(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/db/clientDb.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2f$import$2d$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dexie/import-wrapper.mjs [app-client] (ecmascript)");
;
;
// Create a subclass of Dexie for type safety
class TaskGlyphDB extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2f$import$2d$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] {
    constructor(){
        super("TaskGlyphDB"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "tasks", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "notes", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "diaryEntries", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "pomodoroSessions", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "syncOutbox", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "userMetadata", void 0);
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/sync/syncService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-client] (ecmascript)");
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
    return "object" !== "undefined" && navigator.onLine;
}
// Get user tier from IndexedDB
async function getUserTier(userId) {
    const userMeta = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].userMetadata.get(userId);
    return (userMeta === null || userMeta === void 0 ? void 0 : userMeta.tier) || "free";
}
async function flushSyncOutbox(userId) {
    // ✅ ADDED: Check online status and sync lock
    if (!isOnline()) {
        console.log("Offline, flush aborted.");
        return;
    }
    if (isSyncing) {
        console.log("Sync already in progress, skipping flush request.");
        return;
    }
    isSyncing = true;
    // ✅ ALL TIERS SYNC NOW — including Free (with limits enforced on server)
    const outbox = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].syncOutbox.toArray();
    if (outbox.length === 0) {
        console.log("✅ Sync outbox is empty");
        isSyncing = false; // ✅ Release lock
        return;
    }
    console.log("📤 Flushing ".concat(outbox.length, " operations to server..."));
    try {
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
            console.log("❌ Sync failed: ".concat(errorText));
            return; // Do not delete operations, try again next time
        }
        const result = await response.json();
        console.log("✅ Sync result:", result);
        // Remove successfully synced operations
        const successIds = result.results.filter((r)=>r.success).map((r)=>r.id);
        if (successIds.length > 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].syncOutbox.bulkDelete(successIds);
            console.log("🗑️ Removed ".concat(successIds.length, " synced operations from outbox"));
        }
    } catch (error) {
        console.error("❌ Network error during sync:", error);
    } finally{
        // ✅ ADDED: Always release the lock
        isSyncing = false;
    }
}
function startBackgroundSync(userId) {
    // 1. Sync immediately if online
    if (isOnline()) {
        flushSyncOutbox(userId);
    }
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
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
// We create a new component that *contains* the sync logic
// because we can only call useSession() inside a <SessionProvider>.
function SyncManager(param) {
    let { children } = param;
    var _session_user;
    _s();
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    // ✅ ADDED: Start background sync for authenticated users
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SyncManager.useEffect": ()=>{
            var _session_user;
            if (session === null || session === void 0 ? void 0 : (_session_user = session.user) === null || _session_user === void 0 ? void 0 : _session_user.id) {
                console.log("Starting global background sync...");
                const cleanup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startBackgroundSync"])(session.user.id);
                return cleanup; // Clean up event listener on unmount
            }
        }
    }["SyncManager.useEffect"], [
        session === null || session === void 0 ? void 0 : (_session_user = session.user) === null || _session_user === void 0 ? void 0 : _session_user.id
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(SyncManager, "BVvivrSRe8/FL3eVGyG/GYgr2vQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = SyncManager;
function LayoutClient(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SessionProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SyncManager, {
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
_c1 = LayoutClient;
var _c, _c1;
__turbopack_context__.k.register(_c, "SyncManager");
__turbopack_context__.k.register(_c1, "LayoutClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_8e58bcf3._.js.map