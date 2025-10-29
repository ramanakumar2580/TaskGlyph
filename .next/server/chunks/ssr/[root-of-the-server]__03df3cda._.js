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
    notes;
    diaryEntries;
    pomodoroSessions;
    syncOutbox;
    userMetadata;
    constructor(){
        super("TaskGlyphDB");
        // ✅ 1. Bump the database version
        this.version(2).stores({
            userMetadata: "userId",
            tasks: "id, title, completed, createdAt, updatedAt",
            notes: "id, title, createdAt, updatedAt",
            diaryEntries: "id, entryDate, createdAt",
            // ✅ 2. Add 'type' to the pomodoroSessions table
            pomodoroSessions: "id, durationMinutes, completedAt, type",
            syncOutbox: "id, entityType, operation, timestamp"
        });
        // This was your old version 1, we keep it for migrations
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

/* eslint-disable @typescript-eslint/no-unused-vars */ /* eslint-disable @typescript-eslint/no-explicit-any */ __turbopack_context__.s([
    "flushSyncOutbox",
    ()=>flushSyncOutbox,
    "isOnline",
    ()=>isOnline,
    "startBackgroundSync",
    ()=>startBackgroundSync,
    "triggerSync",
    ()=>triggerSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-ssr] (ecmascript)");
;
// ✅ ADDED: A "lock" to prevent multiple syncs at once
let isSyncing = false;
// ✅ ADDED: A timer for debouncing sync pokes
let syncTimeout = null;
// ✅ ADDED: A custom event name to "poke" the sync service
const SYNC_TRIGGER_EVENT = "taskglyph-sync-trigger";
function triggerSync() {
    console.log("Poking sync service...");
    window.dispatchEvent(new Event(SYNC_TRIGGER_EVENT));
}
function isOnline() {
    return "undefined" !== "undefined" && navigator.onLine;
}
// Get user tier from IndexedDB
async function getUserTier(userId) {
    const userMeta = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].userMetadata.get(userId);
    return userMeta?.tier || "free";
}
async function flushSyncOutbox(userId) {
    // ✅ ADDED: Check online status and sync lock
    if (!isOnline()) {
        console.log("Offline, flush aborted.");
        return;
    }
    //TURBOPACK unreachable
    ;
    // ✅ ALL TIERS SYNC NOW — including Free (with limits enforced on server)
    const outbox = undefined;
}
function startBackgroundSync(userId) {
    // 1. Sync immediately if online
    if (isOnline()) //TURBOPACK unreachable
    ;
    // 2. Listen for online events (sync immediately)
    const handleOnline = ()=>{
        console.log("🌐 Back online — triggering sync");
        flushSyncOutbox(userId);
    };
    window.addEventListener("online", handleOnline);
    // 3. ✅ ADDED: Listen for pokes (debounced sync)
    const handleSyncTrigger = ()=>{
        if (syncTimeout) {
            clearTimeout(syncTimeout);
        }
        console.log("Sync poke received, debouncing...");
        syncTimeout = setTimeout(()=>{
            flushSyncOutbox(userId);
        }, 1500); // 1.5 second debounce
    };
    window.addEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);
    // 4. Return cleanup function
    return ()=>{
        window.removeEventListener("online", handleOnline);
        // ✅ ADDED: Cleanup for new listener and timeout
        window.removeEventListener(SYNC_TRIGGER_EVENT, handleSyncTrigger);
        if (syncTimeout) {
            clearTimeout(syncTimeout);
        }
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
"use client";
;
;
;
;
// We create a new component that *contains* the sync logic
// because we can only call useSession() inside a <SessionProvider>.
function SyncManager({ children }) {
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    // ✅ ADDED: Start background sync for authenticated users
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (session?.user?.id) {
            console.log("Starting global background sync...");
            const cleanup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["startBackgroundSync"])(session.user.id);
            return cleanup; // Clean up event listener on unmount
        }
    }, [
        session?.user?.id
    ]);
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
            lineNumber: 32,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/layout-client.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__03df3cda._.js.map