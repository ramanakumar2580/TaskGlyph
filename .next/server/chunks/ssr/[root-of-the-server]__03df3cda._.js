module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/db/clientDb.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2f$import$2d$wrapper$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dexie/import-wrapper.mjs [app-ssr] (ecmascript)");
;
// Create a subclass of Dexie for type safety
class TaskGlyphDB extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2f$import$2d$wrapper$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    tasks;
    projects;
    diaryEntries;
    pomodoroSessions;
    syncOutbox;
    userMetadata;
    notifications;
    notes;
    folders;
    constructor(){
        super("TaskGlyphDB");
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
}),
"[project]/src/lib/sync/syncService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-ssr] (ecmascript)");
;
let isPushing = false;
let isPulling = false;
const SYNC_TRIGGER_EVENT = "taskglyph-sync-trigger";
const LAST_PULL_KEY = "taskglyph_last_pull";
// ✅ --- [FIX] A new flag to queue a push ---
let pushNeededAfterCurrent = false;
function debounce(func, waitFor) {
    let timeout = null;
    const debounced = (...args)=>{
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
    return "undefined" !== "undefined" && navigator.onLine;
}
async function pushChangesToServer() {
    if (!isOnline()) {
        console.log("Offline, PUSH aborted.");
        return;
    }
    //TURBOPACK unreachable
    ;
}
async function pullChangesFromServer() {
    if (!isOnline()) {
        console.log("Offline, PULL aborted.");
        return;
    }
    //TURBOPACK unreachable
    ;
}
function startBackgroundSync() {
    console.log("Starting full two-way background sync...");
    if (isOnline()) //TURBOPACK unreachable
    ;
    if (isOnline()) //TURBOPACK unreachable
    ;
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
}),
"[project]/src/app/layout-client.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LayoutClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sync/syncService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-ssr] (ecmascript)"); // Import your Dexie db
"use client";
;
;
;
;
;
// A simple loading spinner component
function InitialSyncLoading() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#111",
            color: "white",
            fontFamily: "sans-serif"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
// We create a new component that *contains* the sync logic
// because we can only call useSession() inside a <SessionProvider>.
function SyncManager({ children }) {
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const [isInitialSyncing, setIsInitialSyncing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isSyncLogicDone, setIsSyncLogicDone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Prevent this effect from running more than once
        if (!session?.user?.id || isSyncLogicDone) {
            if (!session?.user?.id) {
                setIsInitialSyncing(false); // Not logged in, so not syncing
            }
            return;
        }
        // Mark that we've run the logic
        setIsSyncLogicDone(true);
        const checkAndFetchData = async ()=>{
            try {
                console.log("Checking local database...");
                // Check if the main tables are empty
                const noteCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.count();
                const taskCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].tasks.count();
                const projectCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].projects.count();
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
                            throw new Error(`Server error: ${res.statusText}`);
                        }
                        const data = await res.json();
                        console.log("Got data from server, populating local database...");
                        localStorage.setItem("taskglyph_last_pull", data.timestamp);
                        // Use a Dexie transaction to add all data at once
                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].transaction("rw", [
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].userMetadata,
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].projects,
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].tasks,
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes,
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].folders,
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].diaryEntries,
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pomodoroSessions,
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notifications
                        ], async ()=>{
                            // Use 'bulkPut' for all tables (idempotent)
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].userMetadata.bulkPut(data.userMetadata);
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].projects.bulkPut(data.projects);
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].tasks.bulkPut(data.tasks);
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.bulkPut(data.notes);
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].folders.bulkPut(data.folders);
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].diaryEntries.bulkPut(data.diaryEntries);
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pomodoroSessions.bulkPut(data.pomodoroSessions);
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notifications.bulkPut(data.notifications);
                        });
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
        };
        checkAndFetchData();
        // Start background sync for ongoing changes
        console.log("Starting global background sync...");
        const cleanup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["startBackgroundSync"])();
        return cleanup; // Clean up event listener on unmount
    }, [
        session?.user?.id,
        isSyncLogicDone
    ]);
    // Show a loading screen *only* during the initial data fetch
    if (isInitialSyncing) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(InitialSyncLoading, {}, void 0, false, {
            fileName: "[project]/src/app/layout-client.tsx",
            lineNumber: 131,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
function LayoutClient({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SessionProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SyncManager, {
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
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__03df3cda._.js.map