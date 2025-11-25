(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/db/clientDb.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2f$import$2d$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dexie/import-wrapper.mjs [app-client] (ecmascript)");
;
;
// Create a subclass of Dexie for type safety
class TaskGlyphDB extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2f$import$2d$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] {
    constructor(){
        super("TaskGlyphDB"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "tasks", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "projects", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "diaryEntries", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "pomodoroSessions", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "syncOutbox", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "userMetadata", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "notifications", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "notes", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "folders", void 0);
        // ✅ VERSION 10: Cleanest version for Production
        // Removed notesPasswordHash from userMetadata for security
        this.version(10).stores({
            userMetadata: "userId, hasNotesPassword",
            tasks: "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
            projects: "id, name, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt, mood, *tags, isLocked",
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp",
            notifications: "id, userId, read, createdAt",
            notes: "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
            folders: "id, name"
        });
        // Version 9 (Migration history - kept for safety)
        this.version(9).stores({
            userMetadata: "userId, hasNotesPassword, notesPasswordHash",
            tasks: "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
            projects: "id, name, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp",
            notifications: "id, userId, read, createdAt",
            notes: "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
            folders: "id, name"
        });
        // Older versions...
        this.version(8).stores({
            userMetadata: "userId, hasNotesPassword",
            tasks: "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
            projects: "id, name, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp",
            notifications: "id, userId, read, createdAt",
            notes: "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
            folders: "id, name"
        });
        this.version(7).stores({
            userMetadata: "userId",
            tasks: "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
            projects: "id, name, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp",
            notifications: "id, userId, read, createdAt",
            notes: "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
            folders: "id, name"
        });
        this.version(6).stores({
            userMetadata: "userId",
            tasks: "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
            projects: "id, name, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp",
            notifications: "id, userId, read, createdAt",
            notes: "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt, *tags",
            folders: "id, name",
            noteAttachments: "id, noteId, fileType"
        });
        this.version(5).stores({
            userMetadata: "userId",
            tasks: "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
            projects: "id, name, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp",
            notifications: "id, userId, read, createdAt",
            notes: "id, folderId, isPinned, deletedAt, isQuickNote, title, updatedAt",
            folders: "id, name",
            noteAttachments: "id, noteId, fileType"
        });
        this.version(4).stores({
            userMetadata: "userId",
            tasks: "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule, meetLink, reminder_30_sent, reminder_20_sent, reminder_10_sent",
            projects: "id, name, createdAt, updatedAt",
            notes: "id, title, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp",
            notifications: "id, userId, read, createdAt"
        });
        this.version(3).stores({
            userMetadata: "userId",
            tasks: "id, title, completed, createdAt, updatedAt, projectId, parentId, dueDate, priority, *tags, reminderAt, recurringSchedule",
            projects: "id, name, createdAt, updatedAt",
            notes: "id, title, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp"
        });
        this.version(2).stores({
            userMetadata: "userId",
            tasks: "id, title, completed, createdAt, updatedAt",
            notes: "id, title, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp"
        });
        this.version(1).stores({
            userMetadata: "userId",
            tasks: "id, title, completed, createdAt, updatedAt",
            notes: "id, title, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            pomodoroSessions: "id, durationMinutes, completedAt",
            syncOutbox: "id, entityType, operation, timestamp"
        });
    }
}
// Export a singleton instance
const db = new TaskGlyphDB();
const __TURBOPACK__default__export__ = db;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/sync/syncService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* eslint-disable @typescript-eslint/no-explicit-any */ __turbopack_context__.s([
    "isOnline",
    ()=>isOnline,
    "pullChangesFromServer",
    ()=>pullChangesFromServer,
    "pushChangesToServer",
    ()=>pushChangesToServer,
    "startBackgroundSync",
    ()=>startBackgroundSync,
    "triggerSync",
    ()=>triggerSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-client] (ecmascript)");
;
let isPushing = false;
let isPulling = false;
const SYNC_TRIGGER_EVENT = "taskglyph-sync-trigger";
const LAST_PULL_KEY = "taskglyph_last_pull";
// ✅ --- [FIX] A new flag to queue a push ---
let pushNeededAfterCurrent = false;
function debounce(func, waitFor) {
    let timeout = null;
    const debounced = function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(()=>func(...args), waitFor);
    };
    return debounced;
}
function triggerSync() {
    console.log("Poking sync service...");
    window.dispatchEvent(new Event(SYNC_TRIGGER_EVENT));
}
function isOnline() {
    return "object" !== "undefined" && navigator.onLine;
}
async function pushChangesToServer() {
    if (!isOnline()) {
        console.log("Offline, PUSH aborted.");
        return;
    }
    // ✅ --- [FIX #1] Handle the "deadlock" ---
    // If a push is already running, set a flag to
    // run another one right after it finishes.
    if (isPushing) {
        console.log("PUSH already in progress, queuing another push.");
        pushNeededAfterCurrent = true;
        return;
    }
    // --- End of Fix #1 ---
    isPushing = true;
    try {
        // Get the outbox *inside* the try block
        const outbox = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].syncOutbox.toArray();
        if (outbox.length === 0) {
            console.log("✅ PUSH: Outbox is empty");
        // Do not return here. Let the 'finally' block run.
        } else {
            console.log("📤 PUSH: Flushing ".concat(outbox.length, " operations to server..."));
            const response = await fetch("/api/sync", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    operations: outbox
                })
            });
            if (!response.ok) {
                let errorText = "Unknown error";
                try {
                    const error = await response.json();
                    errorText = JSON.stringify(error, null, 2);
                } catch (e) {
                    errorText = await response.text();
                }
                console.log("❌ PUSH failed: ".concat(errorText));
            } else {
                const result = await response.json();
                console.log("✅ PUSH result:", result);
                const successIds = result.results.filter((r)=>r.success).map((r)=>r.id);
                if (successIds.length > 0) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].syncOutbox.bulkDelete(successIds);
                    console.log("🗑️ PUSH: Removed ".concat(successIds.length, " synced operations from outbox"));
                }
            }
        }
    } catch (error) {
        console.error("❌ PUSH: Network error during sync:", error);
    } finally{
        isPushing = false; // Release the lock
        console.log("PUSH finished.");
        // Check if another push was requested while this one was running
        if (pushNeededAfterCurrent) {
            console.log("Changes came in during push. Running another push.");
            pushNeededAfterCurrent = false; // Clear the flag
            setTimeout(pushChangesToServer, 50);
        }
    // --- End of Fixes ---
    }
}
async function pullChangesFromServer() {
    if (!isOnline()) {
        console.log("Offline, PULL aborted.");
        return;
    }
    if (isPulling) {
        console.log("PULL already in progress, skipping.");
        return;
    }
    isPulling = true;
    try {
        const lastPulledAt = localStorage.getItem(LAST_PULL_KEY) || 0;
        console.log("🔽 PULL: Fetching changes since ".concat(lastPulledAt));
        const response = await fetch("/api/sync?since=".concat(lastPulledAt), {
            credentials: "include"
        });
        if (!response.ok) {
            throw new Error("Server error: ".concat(response.statusText));
        }
        const data = await response.json();
        const dataArrays = [
            data.userMetadata,
            data.projects,
            data.tasks,
            data.notes,
            data.folders,
            data.diaryEntries,
            data.pomodoroSessions,
            data.notifications
        ];
        const hasNewData = dataArrays.some((arr)=>Array.isArray(arr) && arr.length > 0);
        if (!hasNewData) {
            console.log("✅ PULL: No new changes from server.");
            isPulling = false;
            return;
        }
        console.log("🔽 PULL: Applying changes from server...");
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transaction("rw", [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].userMetadata,
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].projects,
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].tasks,
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notes,
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].folders,
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].diaryEntries,
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].pomodoroSessions,
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notifications
        ], async ()=>{
            if (data.userMetadata.length > 0) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].userMetadata.bulkPut(data.userMetadata);
            if (data.projects.length > 0) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].projects.bulkPut(data.projects);
            if (data.tasks.length > 0) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].tasks.bulkPut(data.tasks);
            if (data.notes.length > 0) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notes.bulkPut(data.notes);
            if (data.folders.length > 0) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].folders.bulkPut(data.folders);
            if (data.diaryEntries.length > 0) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].diaryEntries.bulkPut(data.diaryEntries);
            if (data.pomodoroSessions.length > 0) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].pomodoroSessions.bulkPut(data.pomodoroSessions);
            if (data.notifications.length > 0) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notifications.bulkPut(data.notifications);
        });
        localStorage.setItem(LAST_PULL_KEY, data.timestamp);
        console.log("✅ PULL: Sync complete. New timestamp set to", data.timestamp);
    } catch (error) {
        console.error("❌ PULL: Error fetching changes:", error);
    } finally{
        isPulling = false;
    }
}
function startBackgroundSync() {
    console.log("Starting full two-way background sync...");
    if (isOnline()) {
        pushChangesToServer();
    }
    if (isOnline()) {
        pullChangesFromServer();
    }
    const handleOnline = ()=>{
        console.log("🌐 Back online — triggering PUSH");
        pushChangesToServer();
    };
    const debouncedHandleOnline = debounce(handleOnline, 2000);
    window.addEventListener("online", debouncedHandleOnline);
    // 4. Listen for pokes
    const handleSyncTrigger = ()=>{
        console.log("Sync poke received, triggering push...");
        // The push function itself will now handle the lock and queue
        pushChangesToServer();
    };
    window.addEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);
    const pullInterval = setInterval(pullChangesFromServer, 60000);
    return ()=>{
        window.removeEventListener("online", debouncedHandleOnline);
        window.removeEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);
        clearInterval(pullInterval);
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/layout-client.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LayoutClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sync/syncService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-client] (ecmascript)"); // Import your Dexie db
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
// A simple loading spinner component
function InitialSyncLoading() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#111",
            color: "white",
            fontFamily: "sans-serif"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            children: "Syncing your data..."
        }, void 0, false, {
            fileName: "[project]/src/app/layout-client.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/layout-client.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = InitialSyncLoading;
// We create a new component that *contains* the sync logic
// because we can only call useSession() inside a <SessionProvider>.
function SyncManager(param) {
    let { children } = param;
    var _session_user;
    _s();
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const [isInitialSyncing, setIsInitialSyncing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isSyncLogicDone, setIsSyncLogicDone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SyncManager.useEffect": ()=>{
            var _session_user;
            // Prevent this effect from running more than once
            if (!(session === null || session === void 0 ? void 0 : (_session_user = session.user) === null || _session_user === void 0 ? void 0 : _session_user.id) || isSyncLogicDone) {
                var _session_user1;
                if (!(session === null || session === void 0 ? void 0 : (_session_user1 = session.user) === null || _session_user1 === void 0 ? void 0 : _session_user1.id)) {
                    setIsInitialSyncing(false); // Not logged in, so not syncing
                }
                return;
            }
            // Mark that we've run the logic
            setIsSyncLogicDone(true);
            const checkAndFetchData = {
                "SyncManager.useEffect.checkAndFetchData": async ()=>{
                    try {
                        console.log("Checking local database...");
                        // Check if the main tables are empty
                        const noteCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notes.count();
                        const taskCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].tasks.count();
                        const projectCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].projects.count();
                        // If all are 0, it's a fresh (or cleared) database
                        if (noteCount === 0 && taskCount === 0 && projectCount === 0) {
                            console.log("Local database is empty. Checking online status...");
                            // ✅ --- [THE FIX] ---
                            // Only attempt to fetch from the server if we are ONLINE.
                            // If we are offline, we just skip this and the app will
                            // load in an empty state, which is correct.
                            if (navigator.onLine) {
                                console.log("Online. Fetching from server...");
                                // Call our new GET endpoint
                                const res = await fetch("/api/sync");
                                if (!res.ok) {
                                    throw new Error("Server error: ".concat(res.statusText));
                                }
                                const data = await res.json();
                                console.log("Got data from server, populating local database...");
                                localStorage.setItem("taskglyph_last_pull", data.timestamp);
                                // Use a Dexie transaction to add all data at once
                                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transaction("rw", [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].userMetadata,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].projects,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].tasks,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notes,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].folders,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].diaryEntries,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].pomodoroSessions,
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notifications
                                ], {
                                    "SyncManager.useEffect.checkAndFetchData": async ()=>{
                                        // Use 'bulkPut' for all tables (idempotent)
                                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].userMetadata.bulkPut(data.userMetadata);
                                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].projects.bulkPut(data.projects);
                                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].tasks.bulkPut(data.tasks);
                                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notes.bulkPut(data.notes);
                                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].folders.bulkPut(data.folders);
                                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].diaryEntries.bulkPut(data.diaryEntries);
                                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].pomodoroSessions.bulkPut(data.pomodoroSessions);
                                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].notifications.bulkPut(data.notifications);
                                    }
                                }["SyncManager.useEffect.checkAndFetchData"]);
                                console.log("Local database populated successfully.");
                            } else {
                                console.log("Offline. Skipping server fetch. App will load empty.");
                            }
                        // ✅ --- END OF FIX ---
                        } else {
                            console.log("Local database already has data. Skipping initial fetch.");
                        }
                    } catch (error) {
                        console.error("Failed during initial sync:", error);
                    } finally{
                        // This will now run even if we are offline,
                        // hiding the loading spinner.
                        setIsInitialSyncing(false);
                    }
                }
            }["SyncManager.useEffect.checkAndFetchData"];
            checkAndFetchData();
            // Start background sync for ongoing changes
            console.log("Starting global background sync...");
            const cleanup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startBackgroundSync"])();
            return cleanup; // Clean up event listener on unmount
        }
    }["SyncManager.useEffect"], [
        session === null || session === void 0 ? void 0 : (_session_user = session.user) === null || _session_user === void 0 ? void 0 : _session_user.id,
        isSyncLogicDone
    ]);
    // Show a loading screen *only* during the initial data fetch
    if (isInitialSyncing) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InitialSyncLoading, {}, void 0, false, {
            fileName: "[project]/src/app/layout-client.tsx",
            lineNumber: 131,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(SyncManager, "IiIzM5ZmyMxCEO22iCMKKJv4Los=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c1 = SyncManager;
function LayoutClient(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SessionProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SyncManager, {
            children: children
        }, void 0, false, {
            fileName: "[project]/src/app/layout-client.tsx",
            lineNumber: 144,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/layout-client.tsx",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
_c2 = LayoutClient;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "InitialSyncLoading");
__turbopack_context__.k.register(_c1, "SyncManager");
__turbopack_context__.k.register(_c2, "LayoutClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_8e58bcf3._.js.map