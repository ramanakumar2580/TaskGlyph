module.exports = [
"[project]/src/lib/deleteFromS3.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Deletes a file from AWS S3 via your Next.js API route.
 * * @param url - The full S3 URL of the file to delete
 * @returns boolean - True if deleted successfully
 */ __turbopack_context__.s([
    "deleteFromS3",
    ()=>deleteFromS3
]);
async function deleteFromS3(url) {
    try {
        const res = await fetch("/api/s3-delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url
            })
        });
        if (!res.ok) {
            const err = await res.json();
            console.error("Failed to delete from S3:", err.error);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error in deleteFromS3:", error);
        return false;
    }
}
}),
"[project]/src/lib/db/useNotes.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFolders",
    ()=>useFolders,
    "useNoteTags",
    ()=>useNoteTags,
    "useNotes",
    ()=>useNotes,
    "useTrashNotes",
    ()=>useTrashNotes,
    "useUserMetadata",
    ()=>useUserMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2d$react$2d$hooks$2f$dist$2f$dexie$2d$react$2d$hooks$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dexie-react-hooks/dist/dexie-react-hooks.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-ssr] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/useTier.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sync/syncService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$deleteFromS3$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/deleteFromS3.ts [app-ssr] (ecmascript)"); // [NEW] Import delete S3
"use client";
;
;
;
;
;
;
function useNotes() {
    const tier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTier"])();
    const canSync = !!tier;
    // Live Query
    const notes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2d$react$2d$hooks$2f$dist$2f$dexie$2d$react$2d$hooks$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLiveQuery"])(async ()=>{
        const activeNotes = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.filter((note)=>note.deletedAt === null).sortBy("updatedAt");
        activeNotes.reverse();
        return activeNotes.sort((a, b)=>(b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    }, []);
    const updateNote = async (id, updates)=>{
        const now = Date.now();
        const updatedFields = {
            ...updates,
            updatedAt: now
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.update(id, updatedFields);
        if (canSync) {
            const updatedNote = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.get(id);
            if (updatedNote) {
                const syncOp = {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    entityType: "note",
                    operation: "update",
                    payload: updatedNote,
                    timestamp: now
                };
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
            }
        }
    };
    const addNote = async (payload)=>{
        const now = Date.now();
        const newNote = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            title: payload.title,
            content: payload.content,
            createdAt: now,
            updatedAt: now,
            folderId: payload.folderId || null,
            isPinned: false,
            isLocked: false,
            isQuickNote: payload.isQuickNote || false,
            deletedAt: null,
            tags: []
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.add(newNote);
        if (canSync) {
            const syncOp = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                entityType: "note",
                operation: "create",
                payload: newNote,
                timestamp: now
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
        }
        return newNote;
    };
    const addQuickNote = async (payload)=>{
        return addNote({
            ...payload,
            isQuickNote: true
        });
    };
    // Soft Delete (Files stay in S3 for recovery)
    const deleteNote = async (id)=>{
        console.log(`🗑️ Moving note to trash: ${id}`);
        return updateNote(id, {
            deletedAt: Date.now(),
            isPinned: false
        });
    };
    // [FIX] Hard Delete + S3 Cleanup
    const deleteNotePermanently = async (id)=>{
        console.log(`🔥 Permanently deleting note: ${id}`);
        // 1. Get the note content to find attachments
        const note = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.get(id);
        if (note && note.content) {
            try {
                // Parse HTML to find media
                const parser = new DOMParser();
                const doc = parser.parseFromString(note.content, "text/html");
                // Find images, videos, audio, and file links (anchors)
                const mediaElements = doc.querySelectorAll("img, video, audio, a");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const deletePromises = [];
                mediaElements.forEach((el)=>{
                    const src = el.getAttribute("src") || el.getAttribute("href");
                    // Check if it looks like a cloud storage URL (basic check)
                    if (src && src.startsWith("http")) {
                        console.log("Deleting attachment from S3:", src);
                        deletePromises.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$deleteFromS3$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteFromS3"])(src));
                    }
                });
                // Wait for all S3 deletions
                if (deletePromises.length > 0) {
                    await Promise.all(deletePromises);
                }
            } catch (error) {
                console.error("Error cleaning up S3 attachments:", error);
            }
        }
        // 2. Delete from Dexie
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.delete(id);
        // 3. Sync deletion
        if (canSync) {
            const syncOp = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                entityType: "note",
                operation: "delete",
                payload: {
                    id
                },
                timestamp: Date.now()
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
        }
    };
    const recoverNote = async (id)=>{
        console.log(`♻️ Recovering note from trash: ${id}`);
        return updateNote(id, {
            deletedAt: null
        });
    };
    const pinNote = (id)=>updateNote(id, {
            isPinned: true
        });
    const unpinNote = (id)=>updateNote(id, {
            isPinned: false
        });
    const lockNote = (id)=>updateNote(id, {
            isLocked: true
        });
    const unlockNote = (id)=>updateNote(id, {
            isLocked: false
        });
    const moveNoteToFolder = (id, folderId)=>updateNote(id, {
            folderId
        });
    const addTagToNote = async (id, tag)=>{
        const note = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.get(id);
        if (!note) return;
        const cleanTag = tag.trim().toLowerCase();
        if (cleanTag && !(note.tags || []).includes(cleanTag)) {
            return updateNote(id, {
                tags: [
                    ...note.tags || [],
                    cleanTag
                ]
            });
        }
    };
    const removeTagFromNote = async (id, tag)=>{
        const note = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.get(id);
        if (!note) return;
        const cleanTag = tag.trim().toLowerCase();
        const newTags = (note.tags || []).filter((t)=>t !== cleanTag);
        return updateNote(id, {
            tags: newTags
        });
    };
    return {
        notes,
        addNote,
        addQuickNote,
        updateNote,
        deleteNote,
        deleteNotePermanently,
        recoverNote,
        pinNote,
        unpinNote,
        lockNote,
        unlockNote,
        moveNoteToFolder,
        addTagToNote,
        removeTagFromNote
    };
}
function useTrashNotes() {
    const notes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2d$react$2d$hooks$2f$dist$2f$dexie$2d$react$2d$hooks$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLiveQuery"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.filter((note)=>note.deletedAt !== null).sortBy("deletedAt"), []);
    return {
        trashedNotes: notes
    };
}
function useFolders() {
    const tier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTier"])();
    const canSync = !!tier;
    const folders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2d$react$2d$hooks$2f$dist$2f$dexie$2d$react$2d$hooks$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLiveQuery"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].folders.orderBy("name").toArray(), []);
    const addFolder = async (name)=>{
        const now = Date.now();
        const newFolder = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            name,
            createdAt: now,
            updatedAt: now
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].folders.add(newFolder);
        if (canSync) {
            const syncOp = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                entityType: "folder",
                operation: "create",
                payload: newFolder,
                timestamp: now
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
        }
        return newFolder;
    };
    const updateFolder = async (id, updates)=>{
        const now = Date.now();
        const updatedFields = {
            ...updates,
            updatedAt: now
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].folders.update(id, updatedFields);
        if (canSync) {
            const updatedFolder = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].folders.get(id);
            if (updatedFolder) {
                const syncOp = {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    entityType: "folder",
                    operation: "update",
                    payload: updatedFolder,
                    timestamp: now
                };
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
            }
        }
    };
    const deleteFolder = async (id)=>{
        const notesToMove = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.where("folderId").equals(id).toArray();
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].transaction("rw", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].folders, async ()=>{
            const now = Date.now();
            if (notesToMove.length > 0) {
                const noteUpdates = notesToMove.map((note)=>{
                    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.update(note.id, {
                        folderId: null,
                        updatedAt: now
                    });
                });
                await Promise.all(noteUpdates);
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].folders.delete(id);
        });
        if (canSync) {
            const now = Date.now();
            for (const note of notesToMove){
                const updatedNote = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.get(note.id);
                if (updatedNote) {
                    const noteSyncOp = {
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                        entityType: "note",
                        operation: "update",
                        payload: updatedNote,
                        timestamp: now
                    };
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(noteSyncOp);
                }
            }
            const folderSyncOp = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                entityType: "folder",
                operation: "delete",
                payload: {
                    id
                },
                timestamp: now
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(folderSyncOp);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
        }
    };
    return {
        folders,
        addFolder,
        updateFolder,
        deleteFolder
    };
}
function useNoteTags() {
    const allTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2d$react$2d$hooks$2f$dist$2f$dexie$2d$react$2d$hooks$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLiveQuery"])(async ()=>{
        const notes = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notes.toArray();
        const tagSet = new Set();
        notes.forEach((note)=>{
            (note.tags || []).forEach((tag)=>tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, []);
    return {
        tags: allTags
    };
}
function useUserMetadata() {
    const metadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2d$react$2d$hooks$2f$dist$2f$dexie$2d$react$2d$hooks$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLiveQuery"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].userMetadata.limit(1).first(), []);
    return {
        metadata
    };
}
}),
"[project]/src/lib/db/useDiary.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDiary",
    ()=>useDiary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-ssr] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/useTier.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sync/syncService.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function useDiary() {
    const [entries, setEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const tier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTier"])();
    const canSync = !!tier;
    // Load diary entries from IndexedDB on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchEntries = async ()=>{
            const allEntries = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].diaryEntries.toArray();
            // Sort: Newest first
            const sorted = allEntries.sort((a, b)=>new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
            setEntries(sorted);
        };
        fetchEntries();
    }, []);
    /**
   * Save (Create or Update) an entry.
   * @param data - The content and new fields (mood, weather, etc.)
   * @param dateStr - Optional YYYY-MM-DD string. Defaults to TODAY if omitted.
   */ const saveEntry = async (data, dateStr)=>{
        // Default to today if no specific date provided
        const targetDate = dateStr || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(), "yyyy-MM-dd");
        const existing = entries.find((entry)=>entry.entryDate === targetDate);
        const now = Date.now();
        if (existing) {
            // --- UPDATE EXISTING ---
            // Prepare the update object (merging existing data with new data)
            const updates = {
                content: data.content,
                // We generally keep the original createdAt, but you could add updatedAt if needed
                mood: data.mood,
                energy: data.energy,
                weather: data.weather,
                location: data.location,
                tags: data.tags,
                isLocked: data.isLocked,
                media: data.media
            };
            // 1. Update in Local DB
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].diaryEntries.update(existing.id, updates);
            // 2. Update Local State
            setEntries((prev)=>prev.map((entry)=>entry.id === existing.id ? {
                        ...entry,
                        ...updates
                    } : entry));
            // 3. Sync
            if (canSync) {
                const fullUpdatedEntry = {
                    ...existing,
                    ...updates
                };
                const syncOp = {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    entityType: "diary",
                    operation: "update",
                    payload: fullUpdatedEntry,
                    timestamp: now
                };
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
                console.log("📤 Added UPDATE diary entry to sync outbox");
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
            }
        } else {
            // --- CREATE NEW ---
            const newEntry = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                entryDate: targetDate,
                content: data.content,
                createdAt: now,
                mood: data.mood,
                energy: data.energy,
                weather: data.weather || null,
                location: data.location,
                tags: data.tags || [],
                isLocked: data.isLocked || false,
                media: data.media || []
            };
            // 1. Add to Local DB
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].diaryEntries.add(newEntry);
            // 2. Update Local State (and re-sort)
            setEntries((prev)=>{
                const updated = [
                    newEntry,
                    ...prev
                ];
                return updated.sort((a, b)=>new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
            });
            // 3. Sync
            if (canSync) {
                const syncOp = {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    entityType: "diary",
                    operation: "create",
                    payload: newEntry,
                    timestamp: now
                };
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
                console.log("📤 Added CREATE diary entry to sync outbox");
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
            }
        }
    };
    const deleteDiaryEntry = async (id)=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].diaryEntries.delete(id);
        setEntries((prev)=>prev.filter((entry)=>entry.id !== id));
        if (canSync) {
            const syncOp = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                entityType: "diary",
                operation: "delete",
                payload: {
                    id
                },
                timestamp: Date.now()
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
            console.log("📤 Added DELETE diary entry to sync outbox");
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
        }
    };
    return {
        entries,
        saveEntry,
        deleteDiaryEntry
    };
}
}),
"[project]/src/lib/db/usePomodoro.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePomodoro",
    ()=>usePomodoro
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2d$react$2d$hooks$2f$dist$2f$dexie$2d$react$2d$hooks$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dexie-react-hooks/dist/dexie-react-hooks.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-ssr] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/useTier.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sync/syncService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfDay$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/startOfDay.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfDay$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/endOfDay.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function usePomodoro() {
    const tier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTier"])();
    const canSync = !!tier;
    // ✅ 1. Live Query for TODAY'S sessions only (Auto-updates UI)
    const todaySessions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dexie$2d$react$2d$hooks$2f$dist$2f$dexie$2d$react$2d$hooks$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLiveQuery"])(async ()=>{
        const start = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfDay$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["startOfDay"])(new Date()).getTime();
        const end = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfDay$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["endOfDay"])(new Date()).getTime();
        // Get sessions completed between start and end of today
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pomodoroSessions.where("completedAt").between(start, end).toArray();
    }, []);
    // ✅ 2. Add Session (Offline First)
    const addSession = async (durationMinutes, type)=>{
        const now = Date.now();
        const newSession = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            durationMinutes,
            completedAt: now,
            type
        };
        // Save locally
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pomodoroSessions.add(newSession);
        console.log(`✅ Saved ${type} session locally`);
        // Queue for Sync
        if (canSync) {
            const syncOp = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                entityType: "pomodoro",
                operation: "create",
                payload: newSession,
                timestamp: now
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["triggerSync"])();
        }
    };
    return {
        todaySessions,
        addSession
    };
}
}),
"[project]/src/app/app/dashboard/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UnifiedDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/useTier.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTasks$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/useTasks.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useNotes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/useNotes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useDiary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/useDiary.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usePomodoro$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usePomodoro.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-ssr] (ecmascript) <locals>");
"use client";
;
;
;
;
;
;
;
;
;
function UnifiedDashboard() {
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const tier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTier"])();
    const isFree = tier === "free";
    // Tasks
    // ✅ 1. Get the new update and delete functions
    const { tasks, addTask, toggleTask, updateTaskTitle, deleteTask } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTasks$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTasks"])();
    const [taskInput, setTaskInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // Notes
    // ✅ 2. Get the new delete function
    const { notes, addNote, deleteNote } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useNotes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotes"])();
    const [noteTitle, setNoteTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [noteContent, setNoteContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // Diary (only for paid users)
    // ✅ 3. Get the new delete function
    const { entries: diaryEntries, saveTodayEntry, deleteDiaryEntry } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useDiary$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDiary"])();
    const [diaryContent, setDiaryContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(), "yyyy-MM-dd");
    const todayEntry = diaryEntries.find((entry)=>entry.entryDate === today);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (todayEntry && diaryContent === "") {
            setDiaryContent(todayEntry.content);
        }
        // Prevent re-populating if user cleared it
        if (!todayEntry) {
            setDiaryContent("");
        }
    }, [
        todayEntry,
        diaryContent
    ]);
    // Pomodoro
    const { sessions: pomodoroSessions } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usePomodoro$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePomodoro"])();
    // Task limit for Free tier
    const taskLimit = isFree ? 21 : Infinity;
    const noteLimit = isFree ? 14 : Infinity;
    const canAddTask = tasks.length < taskLimit;
    const canAddNote = notes.length < noteLimit;
    // Handlers
    const handleAddTask = ()=>{
        if (taskInput.trim() && canAddTask) {
            addTask(taskInput.trim());
            setTaskInput("");
        }
    };
    // ✅ This function already clears the inputs (lines 74-75)
    const handleAddNote = ()=>{
        if (noteTitle.trim() && canAddNote) {
            addNote(noteTitle.trim(), noteContent);
            setNoteTitle("");
            setNoteContent("");
        }
    };
    const handleSaveDiary = ()=>{
        if (!isFree) {
            saveTodayEntry(diaryContent);
            // ✅ 4. Clear the diary content box after saving
            setDiaryContent("");
        }
    };
    // ✅ 5. Add new handlers for edit/delete
    const handleEditTask = (id, currentTitle)=>{
        const newTitle = prompt("Enter new task title:", currentTitle);
        if (newTitle && newTitle.trim() !== "") {
            updateTaskTitle(id, newTitle.trim());
        }
    };
    const handleDeleteTask = (id)=>{
        if (confirm("Are you sure you want to delete this task?")) {
            deleteTask(id);
        }
    };
    const handleDeleteNote = (id)=>{
        if (confirm("Are you sure you want to delete this note?")) {
            deleteNote(id);
        }
    };
    const handleDeleteDiary = (id)=>{
        if (confirm("Are you sure you want to delete today's diary entry?")) {
            deleteDiaryEntry(id);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-2xl font-semibold text-gray-900",
                children: "TaskGlyph Dashboard"
            }, void 0, false, {
                fileName: "[project]/src/app/app/dashboard/page.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 bg-blue-50 border border-blue-200 rounded-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-blue-800",
                    children: isFree ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "🆓 Free Tier — ",
                            taskLimit - tasks.length,
                            " tasks left,",
                            " ",
                            noteLimit - notes.length,
                            " notes left"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 120,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "✨",
                            " ",
                            tier === "basic" ? "Basic" : tier === "pro" ? "Pro" : "Ultra Pro",
                            " ",
                            "Tier — Full access"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 125,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/app/dashboard/page.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/app/dashboard/page.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-medium text-gray-900 mb-4",
                        children: [
                            "Tasks (",
                            tasks.length,
                            "/",
                            taskLimit,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    canAddTask ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: taskInput,
                                onChange: (e)=>setTaskInput(e.target.value),
                                placeholder: "Add a new task...",
                                className: "flex-1 border border-gray-300 rounded px-3 py-2 text-gray-800",
                                onKeyDown: (e)=>e.key === "Enter" && handleAddTask()
                            }, void 0, false, {
                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleAddTask,
                                className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
                                children: "Add"
                            }, void 0, false, {
                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500 mb-4",
                        children: "Task limit reached. Upgrade to add more."
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "space-y-2",
                        children: tasks.map((task)=>// ✅ 6. Add flex layout to list item
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: task.completed,
                                                onChange: ()=>toggleTask(task.id, !task.completed),
                                                className: "h-4 w-4 text-blue-600 rounded"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                                lineNumber: 173,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: task.completed ? "line-through text-gray-500" : "text-gray-900",
                                                children: task.title
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                                lineNumber: 179,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                                        lineNumber: 172,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleEditTask(task.id, task.title),
                                                className: "text-sm text-blue-600 hover:text-blue-800",
                                                children: "Edit"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                                lineNumber: 191,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleDeleteTask(task.id),
                                                className: "text-sm text-red-600 hover:text-red-800",
                                                children: "Delete"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                                lineNumber: 197,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                                        lineNumber: 190,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, task.id, true, {
                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                lineNumber: 168,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    tasks.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500",
                        children: "No tasks yet."
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 207,
                        columnNumber: 32
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/app/dashboard/page.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-medium text-gray-900 mb-4",
                        children: [
                            "Notes (",
                            notes.length,
                            "/",
                            noteLimit,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 212,
                        columnNumber: 9
                    }, this),
                    canAddNote ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: noteTitle,
                                onChange: (e)=>setNoteTitle(e.target.value),
                                placeholder: "Note title",
                                className: "w-full border border-gray-300 rounded px-3 py-2 mb-2 text-gray-800"
                            }, void 0, false, {
                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                lineNumber: 217,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: noteContent,
                                onChange: (e)=>setNoteContent(e.target.value),
                                placeholder: "Write your note...",
                                rows: 3,
                                className: "w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-800"
                            }, void 0, false, {
                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                lineNumber: 224,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleAddNote,
                                className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
                                children: "Save Note"
                            }, void 0, false, {
                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                lineNumber: 231,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500",
                        children: "Note limit reached. Upgrade to add more."
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 space-y-2 max-h-32 overflow-y-auto",
                        children: notes.slice(0, 3).map((note)=>// ✅ 8. Add flex layout to note item
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center text-sm p-2 bg-gray-50 rounded",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: note.title
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                                lineNumber: 251,
                                                columnNumber: 17
                                            }, this),
                                            ": ",
                                            note.content.substring(0, 60),
                                            "..."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                                        lineNumber: 250,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleDeleteNote(note.id),
                                        className: "ml-2 text-xs text-red-600 hover:text-red-800",
                                        children: "Delete"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                                        lineNumber: 255,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, note.id, true, {
                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                lineNumber: 246,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 243,
                        columnNumber: 9
                    }, this),
                    notes.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500 mt-2",
                        children: "No notes yet."
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 265,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/app/dashboard/page.tsx",
                lineNumber: 211,
                columnNumber: 7
            }, this),
            !isFree && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-medium text-gray-900 mb-4",
                        children: [
                            "Diary — ",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(), "EEEE, MMMM d, yyyy")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 272,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: diaryContent,
                        onChange: (e)=>setDiaryContent(e.target.value),
                        placeholder: "Write your daily thoughts...",
                        rows: 4,
                        className: "w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-800"
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 275,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSaveDiary,
                        className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
                        children: todayEntry ? "Update Entry" : "Save Entry"
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 282,
                        columnNumber: 11
                    }, this),
                    todayEntry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleDeleteDiary(todayEntry.id),
                        className: "ml-2 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200",
                        children: "Delete Entry"
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 290,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/app/dashboard/page.tsx",
                lineNumber: 271,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-medium text-gray-900 mb-4",
                        children: "Focus Sessions"
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 302,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 mb-4",
                        children: [
                            "You’ve completed ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: pomodoroSessions.length
                            }, void 0, false, {
                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                lineNumber: 306,
                                columnNumber: 28
                            }, this),
                            " sessions.",
                            isFree && pomodoroSessions.length >= 21 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-600 ml-2",
                                children: "Monthly limit reached."
                            }, void 0, false, {
                                fileName: "[project]/src/app/app/dashboard/page.tsx",
                                lineNumber: 308,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 305,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/pomodoro",
                        className: "inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
                        children: "Start Pomodoro Timer"
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 311,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/app/dashboard/page.tsx",
                lineNumber: 301,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm text-gray-600 pt-4 border-t border-gray-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "Signed in as: ",
                            session?.user?.email
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 321,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1",
                        children: "✅ All data syncs to cloud — works offline too!"
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/dashboard/page.tsx",
                        lineNumber: 322,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/app/dashboard/page.tsx",
                lineNumber: 320,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/app/dashboard/page.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_16744786._.js.map