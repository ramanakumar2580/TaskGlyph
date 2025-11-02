"use client";

import { useCallback, useMemo } from "react";
import db, { Project, Task, OperationType, EntityType } from "./clientDb";
import { v4 as uuidv4 } from "uuid";
import { useTier } from "./useTier"; // We might need this later for project limits
import { triggerSync } from "../sync/syncService";
import { useLiveQuery } from "dexie-react-hooks";

// Define the type for the optional fields when creating a project
type ProjectCreationOptions = {
  description?: string | null;
  accentColor?: string | null;
};

// Define the type for updating a project
type ProjectUpdateOptions = Partial<Omit<Project, "id" | "createdAt">>;

export function useProjects() {
  const allProjects = useLiveQuery(() => db.projects.toArray(), []);
  // Memoize projects array for stability
  const projects = useMemo(() => allProjects || [], [allProjects]);

  const tier = useTier();
  const canSync = !!tier;

  /**
   * Creates a new project.
   */
  const addProject = useCallback(
    async (name: string, options: ProjectCreationOptions = {}) => {
      // Note: You can add a project limit check for free tier here
      // if (tier === 'free' && projects.length >= 3) { // Example limit
      //   alert("Free plan project limit reached.");
      //   return;
      // }

      const now = Date.now();
      const newProject: Project = {
        id: uuidv4(),
        name: name.trim(),
        description: options.description || null,
        accentColor: options.accentColor || null,
        createdAt: now,
        updatedAt: now,
      };

      // Add to local DB (useLiveQuery will update state)
      await db.projects.add(newProject);

      // Add to sync outbox
      if (canSync) {
        const syncOp = {
          id: uuidv4(),
          entityType: "project" as EntityType,
          operation: "create" as OperationType,
          payload: newProject,
          timestamp: now,
        };
        await db.syncOutbox.add(syncOp);
        console.log("📤 Added CREATE project to sync outbox", syncOp);
        triggerSync();
      }
      return newProject;
    },
    [canSync] // ✅ 1. REMOVED 'tier' dependency
  );

  /**
   * Deletes a project AND all tasks/subtasks associated with it.
   */
  const deleteProject = useCallback(
    async (projectId: string) => {
      // ✅ CASCADING DELETE
      // 1. Find all tasks associated with this project
      const allTasks = await db.tasks.toArray();
      const taskIdsToDelete: string[] = [];

      const findTasksRecursive = (pId: string) => {
        // ✅ 2. ADDED (t: Task) type
        const children = allTasks.filter((t: Task) => t.projectId === pId);
        for (const child of children) {
          taskIdsToDelete.push(child.id);
          // Also find subtasks of these tasks (if any)
          findSubtasks(child.id);
        }
      };

      const findSubtasks = (parentId: string) => {
        // ✅ 3. ADDED (t: Task) type
        const children = allTasks.filter((t: Task) => t.parentId === parentId);
        for (const child of children) {
          taskIdsToDelete.push(child.id);
          findSubtasks(child.id); // Recurse for sub-sub-tasks
        }
      };

      // Start the search
      findTasksRecursive(projectId);

      // 2. Delete project and all its tasks in a single transaction
      await db.transaction(
        "rw",
        db.projects,
        db.tasks,
        db.syncOutbox,
        async () => {
          // Delete the project itself
          await db.projects.delete(projectId);

          // Delete all found tasks/subtasks
          if (taskIdsToDelete.length > 0) {
            await db.tasks.bulkDelete(taskIdsToDelete);
          }

          // 3. Add all deletes to sync outbox
          if (canSync) {
            const now = Date.now();
            const projectSyncOp = {
              id: uuidv4(),
              entityType: "project" as EntityType,
              operation: "delete" as OperationType,
              payload: { id: projectId },
              timestamp: now,
            };

            const taskSyncOps = taskIdsToDelete.map((id) => ({
              id: uuidv4(),
              entityType: "task" as EntityType,
              operation: "delete" as OperationType,
              payload: { id },
              timestamp: now,
            }));

            // Add all operations to the outbox
            await db.syncOutbox.bulkAdd([projectSyncOp, ...taskSyncOps]);

            console.log(
              `📤 Added DELETE project and ${taskIdsToDelete.length} tasks to sync outbox`
            );
            triggerSync();
          }
        }
      );
    },
    [canSync] // allTasks is fetched inside
  );

  /**
   * Updates any field(s) on a project.
   */
  const updateProject = useCallback(
    async (id: string, updates: ProjectUpdateOptions) => {
      const updatedAt = Date.now();
      const finalUpdates = { ...updates, updatedAt };

      // Update local DB
      await db.projects.update(id, finalUpdates);

      // Add to sync outbox
      if (canSync) {
        // We must send the full object
        // ✅ 4. Changed 'projects' to 'allProjects' for stability
        const existingProject = (allProjects || []).find(
          (p: Project) => p.id === id
        );

        if (existingProject) {
          const updatedProject: Project = {
            ...existingProject,
            ...finalUpdates,
          };
          const syncOp = {
            id: uuidv4(),
            entityType: "project" as EntityType,
            operation: "update" as OperationType,
            payload: updatedProject, // Send the full updated project
            timestamp: updatedAt,
          };
          await db.syncOutbox.add(syncOp);
          console.log("📤 Added UPDATE project to sync outbox", syncOp);
          triggerSync();
        }
      }
    },
    [canSync, allProjects] // Depends on the stable allProjects
  );

  // Return the live-query-powered projects array and the C-U-D functions
  return {
    projects, // Return memoized 'projects' for the UI
    addProject,
    updateProject,
    deleteProject,
  };
}
