(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/db/usePomodoro.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePomodoro",
    ()=>usePomodoro
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"); // ✅ 1. Import useCallback
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/clientDb.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist/v4.js [app-client] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/useTier.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sync/syncService.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function usePomodoro() {
    _s();
    const [sessions, setSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const tier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTier"])();
    const canSync = !!tier;
    // Load Pomodoro sessions from IndexedDB on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePomodoro.useEffect": ()=>{
            const fetchSessions = {
                "usePomodoro.useEffect.fetchSessions": async ()=>{
                    const allSessions = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].pomodoroSessions.toArray();
                    const sorted = allSessions.sort({
                        "usePomodoro.useEffect.fetchSessions.sorted": (a, b)=>b.completedAt - a.completedAt
                    }["usePomodoro.useEffect.fetchSessions.sorted"]);
                    setSessions(sorted);
                }
            }["usePomodoro.useEffect.fetchSessions"];
            fetchSessions();
        }
    }["usePomodoro.useEffect"], []); // Empty dependency array is correct here
    const logSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePomodoro.useCallback[logSession]": async (durationMinutes, type)=>{
            const newSession = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                durationMinutes,
                completedAt: Date.now(),
                type: type
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].pomodoroSessions.add(newSession);
            setSessions({
                "usePomodoro.useCallback[logSession]": (prev)=>[
                        newSession,
                        ...prev
                    ]
            }["usePomodoro.useCallback[logSession]"]);
            // Add to sync outbox if paid user
            if (canSync) {
                const syncOp = {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    entityType: "pomodoro",
                    operation: "create",
                    payload: newSession,
                    timestamp: Date.now()
                };
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$clientDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].syncOutbox.add(syncOp);
                console.log("📤 Added CREATE Pomodoro ".concat(type, " session to sync outbox"));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$syncService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["triggerSync"])(); // Poke the sync service
            }
            return newSession;
        }
    }["usePomodoro.useCallback[logSession]"], [
        canSync
    ] // ✅ 3. Add dependencies
    );
    return {
        sessions,
        logSession
    };
}
_s(usePomodoro, "BI7/VBTWd1f2INv+H1Gfno+Ko1o=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTier"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/app/pomodoro/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PomodoroPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usePomodoro$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usePomodoro.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
// LocalStorage keys for persistence
const STORAGE_KEY = {
    END_TIME: "pomodoro_end_time",
    IS_RUNNING: "pomodoro_is_running",
    MODE: "pomodoro_mode",
    STARTED_DURATION: "pomodoro_started_duration"
};
function PomodoroPage() {
    _s();
    const { sessions, logSession } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usePomodoro$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePomodoro"])();
    // State for configurable times
    const [workMinutes, setWorkMinutes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(25);
    const [breakMinutes, setBreakMinutes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(5);
    // Timer state
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(workMinutes * 60);
    const [isRunning, setIsRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("work");
    const intervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const hasRunLoadEffect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Lock to prevent duplicate saves
    const [isLogging, setIsLogging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // --- Helper Functions ---
    const formatTime = (seconds)=>{
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return "".concat(mins.toString().padStart(2, "0"), ":").concat(secs.toString().padStart(2, "0"));
    };
    // Helper to clear all timer storage
    const clearStorage = ()=>{
        localStorage.removeItem(STORAGE_KEY.END_TIME);
        localStorage.removeItem(STORAGE_KEY.IS_RUNNING);
        localStorage.removeItem(STORAGE_KEY.MODE);
        localStorage.removeItem(STORAGE_KEY.STARTED_DURATION);
    };
    // --- Timer Effects ---
    // Effect handles "catching up" when you switch tabs
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PomodoroPage.useEffect": ()=>{
            const handleVisibilityChange = {
                "PomodoroPage.useEffect.handleVisibilityChange": ()=>{
                    if (document.visibilityState === "visible") {
                        // Tab is active, let's check the timer
                        const storedEndTime = localStorage.getItem(STORAGE_KEY.END_TIME);
                        const storedIsRunning = localStorage.getItem(STORAGE_KEY.IS_RUNNING) === "true";
                        const storedMode = localStorage.getItem(STORAGE_KEY.MODE) || "work";
                        const storedDuration = parseInt(localStorage.getItem(STORAGE_KEY.STARTED_DURATION) || "0");
                        if (storedIsRunning && storedEndTime) {
                            const remainingTime = Math.round((parseInt(storedEndTime) - Date.now()) / 1000);
                            if (remainingTime > 0) {
                                // Timer is still running, catch up
                                setTimeLeft(remainingTime);
                            } else {
                                // Timer finished while tab was in background
                                setIsRunning(false);
                                clearStorage();
                                if (!isLogging) {
                                    setIsLogging(true);
                                    if (storedMode === "work") {
                                        logSession(storedDuration, "work").then({
                                            "PomodoroPage.useEffect.handleVisibilityChange": ()=>setIsLogging(false)
                                        }["PomodoroPage.useEffect.handleVisibilityChange"]);
                                        alert("Focus session finished while you were away!");
                                    } else {
                                        logSession(storedDuration, "break").then({
                                            "PomodoroPage.useEffect.handleVisibilityChange": ()=>setIsLogging(false)
                                        }["PomodoroPage.useEffect.handleVisibilityChange"]);
                                        alert("Break finished while you were away!");
                                    }
                                }
                                setMode("work");
                                setTimeLeft(workMinutes * 60);
                            }
                        }
                    }
                }
            }["PomodoroPage.useEffect.handleVisibilityChange"];
            document.addEventListener("visibilitychange", handleVisibilityChange);
            return ({
                "PomodoroPage.useEffect": ()=>{
                    document.removeEventListener("visibilitychange", handleVisibilityChange);
                }
            })["PomodoroPage.useEffect"];
        }
    }["PomodoroPage.useEffect"], [
        isLogging,
        logSession,
        workMinutes
    ]);
    // Effect runs ONCE on page load to restore the timer
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PomodoroPage.useEffect": ()=>{
            if (hasRunLoadEffect.current) return;
            hasRunLoadEffect.current = true;
            const storedEndTime = localStorage.getItem(STORAGE_KEY.END_TIME);
            const storedIsRunning = localStorage.getItem(STORAGE_KEY.IS_RUNNING) === "true";
            const storedMode = localStorage.getItem(STORAGE_KEY.MODE) || "work";
            const storedDuration = parseInt(localStorage.getItem(STORAGE_KEY.STARTED_DURATION) || "0");
            if (storedIsRunning && storedEndTime) {
                const remainingTime = Math.round((parseInt(storedEndTime) - Date.now()) / 1000);
                if (remainingTime > 0) {
                    // Timer is still running
                    setMode(storedMode);
                    setTimeLeft(remainingTime);
                    setIsRunning(true);
                } else {
                    // Timer finished while user was away
                    setIsRunning(false);
                    clearStorage();
                    if (!isLogging) {
                        setIsLogging(true);
                        if (storedMode === "work") {
                            logSession(storedDuration, "work").then({
                                "PomodoroPage.useEffect": ()=>setIsLogging(false)
                            }["PomodoroPage.useEffect"]);
                            alert("Focus session finished while you were away!");
                        } else {
                            logSession(storedDuration, "break").then({
                                "PomodoroPage.useEffect": ()=>setIsLogging(false)
                            }["PomodoroPage.useEffect"]);
                            alert("Break finished while you were away!");
                        }
                    }
                    setMode("work");
                    setTimeLeft(workMinutes * 60);
                }
            }
        }
    }["PomodoroPage.useEffect"], [
        logSession,
        workMinutes,
        isLogging
    ]);
    // Effect is just the countdown
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PomodoroPage.useEffect": ()=>{
            if (isRunning && timeLeft > 0) {
                intervalRef.current = setInterval({
                    "PomodoroPage.useEffect": ()=>{
                        setTimeLeft({
                            "PomodoroPage.useEffect": (prev)=>prev - 1
                        }["PomodoroPage.useEffect"]);
                    }
                }["PomodoroPage.useEffect"], 1000);
            } else if (isRunning && timeLeft === 0) {
                // Timer finished
                setIsRunning(false);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                clearStorage();
                if (!isLogging) {
                    setIsLogging(true);
                    if (mode === "work") {
                        const duration = parseInt(localStorage.getItem(STORAGE_KEY.STARTED_DURATION) || workMinutes.toString());
                        logSession(duration, "work").then({
                            "PomodoroPage.useEffect": ()=>setIsLogging(false)
                        }["PomodoroPage.useEffect"]);
                        alert("Focus session complete! Click 'Break' to start a break.");
                    } else {
                        const duration = parseInt(localStorage.getItem(STORAGE_KEY.STARTED_DURATION) || breakMinutes.toString());
                        logSession(duration, "break").then({
                            "PomodoroPage.useEffect": ()=>setIsLogging(false)
                        }["PomodoroPage.useEffect"]);
                        alert("Break's over! Click 'Focus' to start a new session.");
                    }
                }
            }
            return ({
                "PomodoroPage.useEffect": ()=>{
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                }
            })["PomodoroPage.useEffect"];
        }
    }["PomodoroPage.useEffect"], [
        isRunning,
        timeLeft,
        mode,
        logSession,
        workMinutes,
        breakMinutes,
        isLogging
    ]);
    // --- Button Handlers ---
    const handleStartPause = ()=>{
        if (isRunning) {
            // Pausing
            setIsRunning(false);
            localStorage.setItem(STORAGE_KEY.IS_RUNNING, "false");
        } else {
            // Starting
            setIsRunning(true);
            const durationMinutes = mode === "work" ? workMinutes : breakMinutes;
            // Use the *current* timeLeft, not the full time
            const endTime = Date.now() + timeLeft * 1000;
            localStorage.setItem(STORAGE_KEY.END_TIME, endTime.toString());
            localStorage.setItem(STORAGE_KEY.IS_RUNNING, "true");
            localStorage.setItem(STORAGE_KEY.MODE, mode);
            localStorage.setItem(STORAGE_KEY.STARTED_DURATION, durationMinutes.toString());
        }
    };
    const handleStopAndSave = ()=>{
        if (!confirm("Stop the timer and save this session?")) {
            return;
        }
        setIsRunning(false);
        const storedDuration = parseInt(localStorage.getItem(STORAGE_KEY.STARTED_DURATION) || "0");
        if (mode === "work" && storedDuration > 0) {
            const elapsedSeconds = storedDuration * 60 - timeLeft;
            const elapsedMinutes = Math.floor(elapsedSeconds / 60);
            if (elapsedMinutes > 0) {
                if (!isLogging) {
                    setIsLogging(true);
                    logSession(elapsedMinutes, "work").then(()=>setIsLogging(false));
                    alert("Session saved! You completed ".concat(elapsedMinutes, " minutes."));
                }
            } else {
                alert("Timer reset. No time logged.");
            }
        }
        clearStorage();
        setMode("work");
        setTimeLeft(workMinutes * 60);
    };
    // ✅ --- THE FIX: Updated the check for an active session ---
    const handleModeSwitch = (newMode)=>{
        // Check if trying to switch to a different mode
        if (newMode !== mode) {
            // Check if the timer is *actually* active (running or paused mid-session)
            const fullCurrentTime = (mode === "work" ? workMinutes : breakMinutes) * 60;
            const isActuallyActive = isRunning || !isRunning && timeLeft > 0 && timeLeft < fullCurrentTime;
            if (isActuallyActive) {
                alert("You are in an active ".concat(mode, " session. Please stop or finish it before switching to ").concat(newMode, "."));
                return; // Prevent switching
            }
        }
        // Allow switching if session is finished (timeLeft === 0) or not started
        setIsRunning(false);
        clearStorage();
        setMode(newMode);
        setTimeLeft((newMode === "work" ? workMinutes : breakMinutes) * 60);
    };
    const handleWorkMinutesChange = (e)=>{
        const minutes = parseInt(e.target.value);
        if (minutes > 0) {
            setWorkMinutes(minutes);
            if (mode === "work" && !isRunning) {
                setTimeLeft(minutes * 60);
            }
        }
    };
    const handleBreakMinutesChange = (e)=>{
        const minutes = parseInt(e.target.value);
        if (minutes > 0) {
            setBreakMinutes(minutes);
            if (mode === "break" && !isRunning) {
                setTimeLeft(minutes * 60);
            }
        }
    };
    // --- History Logic (Unchanged) ---
    const groupedSessions = sessions.reduce((acc, session)=>{
        const day = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(session.completedAt), "MMMM d, yyyy");
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(session);
        return acc;
    }, {});
    const sortedDays = Object.keys(groupedSessions).sort((a, b)=>new Date(b).getTime() - new Date(a).getTime());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-md mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold text-gray-900 mb-6",
                    children: "Pomodoro Timer"
                }, void 0, false, {
                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                    lineNumber: 314,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>handleModeSwitch("work"),
                            className: "flex-1 p-2 rounded ".concat(mode === "work" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"),
                            children: "Focus"
                        }, void 0, false, {
                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                            lineNumber: 320,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>handleModeSwitch("break"),
                            className: "flex-1 p-2 rounded ".concat(mode === "break" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"),
                            children: "Break"
                        }, void 0, false, {
                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                            lineNumber: 330,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                    lineNumber: 319,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-8xl font-mono font-bold text-gray-900 mb-6",
                            children: formatTime(timeLeft)
                        }, void 0, false, {
                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                            lineNumber: 344,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleStartPause,
                                    className: "px-6 py-2 rounded text-white ".concat(isRunning ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"),
                                    children: isRunning ? "Pause" : timeLeft === 0 ? "Start New" : "Start"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                    lineNumber: 348,
                                    columnNumber: 13
                                }, this),
                                timeLeft > 0 && timeLeft < workMinutes * 60 && mode === "work" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleStopAndSave,
                                    className: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
                                    children: "Stop & Save"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                    lineNumber: 361,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                            lineNumber: 347,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                    lineNumber: 343,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-medium text-gray-900 mb-4",
                            children: "Settings"
                        }, void 0, false, {
                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                            lineNumber: 373,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-1",
                                            children: "Focus (mins)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                            lineNumber: 376,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: workMinutes,
                                            onChange: handleWorkMinutesChange,
                                            className: "w-full border border-gray-300 rounded px-3 py-2 text-gray-800",
                                            disabled: isRunning
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                            lineNumber: 379,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                    lineNumber: 375,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-1",
                                            children: "Break (mins)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                            lineNumber: 388,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            value: breakMinutes,
                                            onChange: handleBreakMinutesChange,
                                            className: "w-full border border-gray-300 rounded px-3 py-2 text-gray-800",
                                            disabled: isRunning
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                            lineNumber: 391,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                    lineNumber: 387,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                            lineNumber: 374,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                    lineNumber: 372,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-medium text-gray-900 mb-4",
                            children: "Completed Sessions"
                        }, void 0, false, {
                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                            lineNumber: 404,
                            columnNumber: 11
                        }, this),
                        sortedDays.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-6",
                            children: sortedDays.map((day)=>{
                                const daySessions = groupedSessions[day];
                                const totalMinutes = daySessions.reduce((sum, s)=>sum + s.durationMinutes, 0);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between items-center mb-3 pb-3 border-b border-gray-200",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-gray-900",
                                                    children: day
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                                    lineNumber: 421,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-gray-600",
                                                    children: [
                                                        daySessions.length,
                                                        " sessions",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "mx-2",
                                                            children: "|"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                                            lineNumber: 424,
                                                            columnNumber: 25
                                                        }, this),
                                                        totalMinutes,
                                                        " minutes total"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                                    lineNumber: 422,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                            lineNumber: 420,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2",
                                            children: daySessions.sort((a, b)=>b.completedAt - a.completedAt).map((session)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "flex justify-between items-center text-sm",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: session.type === "break" ? "text-green-700" : "text-gray-800",
                                                            children: [
                                                                session.durationMinutes,
                                                                " minute ",
                                                                session.type,
                                                                " ",
                                                                "session"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                                            lineNumber: 436,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-gray-500",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(session.completedAt), "h:mm a")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                                            lineNumber: 446,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, session.id, true, {
                                                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                                    lineNumber: 432,
                                                    columnNumber: 27
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                            lineNumber: 428,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, day, true, {
                                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                                    lineNumber: 416,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                            lineNumber: 408,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-500 text-center mt-8",
                            children: "No sessions yet. Start a timer!"
                        }, void 0, false, {
                            fileName: "[project]/src/app/app/pomodoro/page.tsx",
                            lineNumber: 457,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/app/pomodoro/page.tsx",
                    lineNumber: 403,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/app/pomodoro/page.tsx",
            lineNumber: 313,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/app/pomodoro/page.tsx",
        lineNumber: 312,
        columnNumber: 5
    }, this);
}
_s(PomodoroPage, "1K3kHt39JTfDAeIQEWGnFtE7YrE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usePomodoro$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePomodoro"]
    ];
});
_c = PomodoroPage;
var _c;
__turbopack_context__.k.register(_c, "PomodoroPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_7134d508._.js.map