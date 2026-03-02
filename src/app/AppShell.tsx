import { useEffect, useMemo, useState } from "react";
import { newId } from "../lib/id";
import type { Exercise, WorkoutExercise, WorkoutSession, WorkoutSet } from "../types/domain";
import { listWorkouts, saveWorkout } from "../features/workouts/workoutsRepo";
import { ExercisePicker } from "../features/exercises/ExercisePicker";
import { C } from "./ui/Theme";

type Tab = "Log" | "Progress" | "Volume" | "History";

function fmtDate(iso: string) {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

export function AppShell() {
    const [tab, setTab] = useState<Tab>("Log");
    const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);

    // current session being edited
    const [activeId, setActiveId] = useState<string | null>(null);

    // exercise picker
    const [pickerOpen, setPickerOpen] = useState(false);

    const active = useMemo(
        () => workouts.find((w) => w.id === activeId) ?? null,
        [workouts, activeId]
    );

    async function refresh() {
        const all = await listWorkouts();
        // newest first
        all.sort((a, b) => (a.date < b.date ? 1 : -1));
        setWorkouts(all);
    }

    useEffect(() => {
        (async () => {
            await refresh();
            setLoading(false);
        })();
    }, []);

    async function persist(session: WorkoutSession) {
        await saveWorkout(session);
        await refresh();
        setActiveId(session.id);
    }

    async function startWorkout() {
        const session: WorkoutSession = {
            id: newId(),
            date: new Date().toISOString(),
            title: "Workout",
            exercises: [],
        };
        await persist(session);
    }

    function addExerciseToActive(ex: Exercise) {
        if (!active) return;

        const workoutExercise: WorkoutExercise = {
            id: newId(),
            exerciseId: ex.id,
            name: ex.name,
            group: ex.group,
            sets: [
                {
                    id: newId(),
                    weight: 0,
                    reps: 0,
                },
            ],
        };

        void persist({
            ...active,
            exercises: [...active.exercises, workoutExercise],
        });
    }

    function renameActiveTitle(nextTitle: string) {
        if (!active) return;
        void persist({ ...active, title: nextTitle });
    }

    function addSet(exerciseRowId: string) {
        if (!active) return;

        const nextExercises = active.exercises.map((ex) => {
            if (ex.id !== exerciseRowId) return ex;
            const nextSet: WorkoutSet = { id: newId(), weight: 0, reps: 0 };
            return { ...ex, sets: [...ex.sets, nextSet] };
        });

        void persist({ ...active, exercises: nextExercises });
    }

    function updateSet(exerciseRowId: string, setId: string, patch: Partial<WorkoutSet>) {
        if (!active) return;

        const nextExercises = active.exercises.map((ex) => {
            if (ex.id !== exerciseRowId) return ex;
            return {
                ...ex,
                sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
            };
        });

        void persist({ ...active, exercises: nextExercises });
    }

    function removeSet(exerciseRowId: string, setId: string) {
        if (!active) return;

        const nextExercises = active.exercises.map((ex) => {
            if (ex.id !== exerciseRowId) return ex;
            const nextSets = ex.sets.filter((s) => s.id !== setId);
            // keep at least 1 set row
            return { ...ex, sets: nextSets.length ? nextSets : [{ id: newId(), weight: 0, reps: 0 }] };
        });

        void persist({ ...active, exercises: nextExercises });
    }

    function removeExercise(exerciseRowId: string) {
        if (!active) return;

        const nextExercises = active.exercises.filter((ex) => ex.id !== exerciseRowId);
        void persist({ ...active, exercises: nextExercises });
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: C.bg,
                color: C.text,
                padding: 16,
                fontFamily: "system-ui",
                maxWidth: 720,
                margin: "0 auto",
            }}
        >
            <h1 style={{ margin: "8px 0" }}>Iron Protocol</h1>

            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {(["Log", "Progress", "Volume", "History"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: `1px solid ${C.border}`,
                            background: tab === t ? C.surface : "transparent",
                            color: tab === t ? C.primary : C.textDim,
                            cursor: "pointer",
                            fontWeight: 700,
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div>Loading…</div>
            ) : (
                <>
                    {tab === "Log" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {/* top actions */}
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                <button
                                    onClick={startWorkout}
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: `1px solid ${C.border}`,
                                        background: C.surface,
                                        color: C.text,
                                        cursor: "pointer",
                                        fontWeight: 800,
                                    }}
                                >
                                    Start Workout
                                </button>

                                <button
                                    onClick={() => setPickerOpen(true)}
                                    disabled={!active}
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: `1px solid ${C.border}`,
                                        background: "transparent",
                                        color: active ? C.secondary : C.textDim,
                                        cursor: active ? "pointer" : "not-allowed",
                                        fontWeight: 900,
                                        opacity: active ? 1 : 0.6,
                                    }}
                                >
                                    Add Exercise
                                </button>

                                <div style={{ color: C.textDim }}>Sessions stored: {workouts.length}</div>
                            </div>

                            {/* active editor */}
                            <div
                                style={{
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 12,
                                    padding: 12,
                                    background: C.surface,
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: 14, color: C.textDim, marginBottom: 6 }}>
                                            Active Session
                                        </div>

                                        {active ? (
                                            <>
                                                <input
                                                    value={active.title}
                                                    onChange={(e) => renameActiveTitle(e.target.value)}
                                                    placeholder="Workout title"
                                                    style={{
                                                        width: "100%",
                                                        boxSizing: "border-box",
                                                        background: C.bg,
                                                        border: `1px solid ${C.border}`,
                                                        borderRadius: 10,
                                                        padding: "10px 12px",
                                                        color: C.text,
                                                        fontSize: 14,
                                                        outline: "none",
                                                        fontWeight: 700,
                                                    }}
                                                />
                                                <div style={{ marginTop: 6, color: C.textDim, fontSize: 12 }}>{fmtDate(active.date)}</div>
                                            </>
                                        ) : (
                                            <div style={{ color: C.textDim }}>Click “Start Workout” to begin.</div>
                                        )}
                                    </div>

                                    {active && (
                                        <button
                                            onClick={() => setActiveId(null)}
                                            style={{
                                                border: `1px solid ${C.border}`,
                                                background: "transparent",
                                                color: C.textDim,
                                                padding: "10px 12px",
                                                borderRadius: 10,
                                                cursor: "pointer",
                                                fontWeight: 800,
                                                height: 42,
                                            }}
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>

                                {active && active.exercises.length === 0 && (
                                    <div style={{ marginTop: 12, color: C.textDim }}>Add your first exercise.</div>
                                )}

                                {active && active.exercises.length > 0 && (
                                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                                        {active.exercises.map((ex) => (
                                            <div
                                                key={ex.id}
                                                style={{
                                                    border: `1px solid ${C.border}`,
                                                    borderRadius: 12,
                                                    padding: 10,
                                                    background: C.bg,
                                                }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                                    <div>
                                                        <div style={{ fontWeight: 900 }}>{ex.name}</div>
                                                        <div style={{ color: C.textDim, fontSize: 12 }}>{ex.group}</div>
                                                    </div>

                                                    <div style={{ display: "flex", gap: 8 }}>
                                                        <button
                                                            onClick={() => addSet(ex.id)}
                                                            style={{
                                                                border: `1px solid ${C.border}`,
                                                                background: "transparent",
                                                                color: C.secondary,
                                                                padding: "8px 10px",
                                                                borderRadius: 10,
                                                                cursor: "pointer",
                                                                fontWeight: 900,
                                                            }}
                                                        >
                                                            + Set
                                                        </button>

                                                        <button
                                                            onClick={() => removeExercise(ex.id)}
                                                            style={{
                                                                border: `1px solid ${C.border}`,
                                                                background: "transparent",
                                                                color: C.textDim,
                                                                padding: "8px 10px",
                                                                borderRadius: 10,
                                                                cursor: "pointer",
                                                                fontWeight: 900,
                                                            }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* set rows */}
                                                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                                                    {ex.sets.map((s, idx) => (
                                                        <div
                                                            key={s.id}
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "60px 1fr 1fr 90px",
                                                                gap: 8,
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <div style={{ color: C.textDim, fontSize: 12, fontWeight: 900 }}>Set {idx + 1}</div>

                                                            <input
                                                                inputMode="decimal"
                                                                value={String(s.weight)}
                                                                onChange={(e) =>
                                                                    updateSet(ex.id, s.id, {
                                                                        weight: Number(e.target.value || 0),
                                                                    })
                                                                }
                                                                placeholder="Weight"
                                                                style={{
                                                                    width: "100%",
                                                                    boxSizing: "border-box",
                                                                    background: C.surface,
                                                                    border: `1px solid ${C.border}`,
                                                                    borderRadius: 10,
                                                                    padding: "10px 12px",
                                                                    color: C.text,
                                                                    fontSize: 14,
                                                                    outline: "none",
                                                                }}
                                                            />

                                                            <input
                                                                inputMode="numeric"
                                                                value={String(s.reps)}
                                                                onChange={(e) =>
                                                                    updateSet(ex.id, s.id, {
                                                                        reps: Number(e.target.value || 0),
                                                                    })
                                                                }
                                                                placeholder="Reps"
                                                                style={{
                                                                    width: "100%",
                                                                    boxSizing: "border-box",
                                                                    background: C.surface,
                                                                    border: `1px solid ${C.border}`,
                                                                    borderRadius: 10,
                                                                    padding: "10px 12px",
                                                                    color: C.text,
                                                                    fontSize: 14,
                                                                    outline: "none",
                                                                }}
                                                            />

                                                            <button
                                                                onClick={() => removeSet(ex.id, s.id)}
                                                                style={{
                                                                    border: `1px solid ${C.border}`,
                                                                    background: "transparent",
                                                                    color: C.textDim,
                                                                    padding: "10px 12px",
                                                                    borderRadius: 10,
                                                                    cursor: "pointer",
                                                                    fontWeight: 900,
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* sessions list */}
                            <div>
                                <div style={{ fontWeight: 900, marginBottom: 8 }}>Recent Sessions</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {workouts.map((w) => (
                                        <button
                                            key={w.id}
                                            onClick={() => setActiveId(w.id)}
                                            style={{
                                                textAlign: "left",
                                                borderRadius: 12,
                                                border: `1px solid ${C.border}`,
                                                background: activeId === w.id ? C.surface : "transparent",
                                                color: C.text,
                                                padding: "10px 12px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <div style={{ fontWeight: 900 }}>
                                                {w.title}{" "}
                                                <span style={{ color: C.textDim, fontWeight: 700 }}>• {w.exercises.length} ex</span>
                                            </div>
                                            <div style={{ color: C.textDim, fontSize: 12 }}>{fmtDate(w.date)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ExercisePicker
                                open={pickerOpen}
                                onClose={() => setPickerOpen(false)}
                                onSelect={(ex) => addExerciseToActive(ex)}
                            />
                        </div>
                    )}

                    {tab !== "Log" && (
                        <div
                            style={{
                                padding: 20,
                                border: `1px dashed ${C.border}`,
                                borderRadius: 12,
                                color: C.textDim,
                            }}
                        >
                            {tab} coming next…
                        </div>
                    )}
                </>
            )}
        </div>
    );
}