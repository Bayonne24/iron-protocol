// src/app/AppShell.tsx
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

    const [activeId, setActiveId] = useState<string | null>(null);

    // picker
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

    async function startWorkout() {
        const session: WorkoutSession = {
            id: newId(),
            date: new Date().toISOString(),
            title: "Workout",
            exercises: [],
        };
        await saveWorkout(session);
        await refresh();
        setActiveId(session.id);
    }

    async function persist(updated: WorkoutSession) {
        await saveWorkout(updated);
        await refresh();
        setActiveId(updated.id);
    }

    function addExercise(ex: Exercise) {
        if (!active) return;

        const we: WorkoutExercise = {
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
            exercises: [...active.exercises, we],
        });
    }

    function addSet(exerciseId: string) {
        if (!active) return;

        const next = active.exercises.map((e) => {
            if (e.id !== exerciseId) return e;
            const s: WorkoutSet = { id: newId(), weight: 0, reps: 0 };
            return { ...e, sets: [...e.sets, s] };
        });

        void persist({ ...active, exercises: next });
    }

    function updateSet(exerciseId: string, setId: string, patch: Partial<WorkoutSet>) {
        if (!active) return;

        const next = active.exercises.map((e) => {
            if (e.id !== exerciseId) return e;
            return {
                ...e,
                sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
            };
        });

        void persist({ ...active, exercises: next });
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
                            {/* Top actions */}
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button
                                    onClick={startWorkout}
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        border: `1px solid ${C.border}`,
                                        background: C.surface,
                                        color: C.text,
                                        cursor: "pointer",
                                        fontWeight: 750,
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
                                        fontWeight: 800,
                                        opacity: active ? 1 : 0.6,
                                    }}
                                >
                                    Add Exercise
                                </button>

                                <div style={{ alignSelf: "center", color: C.textDim }}>
                                    Sessions stored: {workouts.length}
                                </div>
                            </div>

                            {/* Active session editor */}
                            <div
                                style={{
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 12,
                                    padding: 12,
                                    background: C.surface,
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: 16 }}>
                                            {active ? "Editing Session" : "No active session"}
                                        </div>
                                        <div style={{ color: C.textDim, fontSize: 12 }}>
                                            {active ? fmtDate(active.date) : "Click Start Workout to begin"}
                                        </div>
                                    </div>

                                    {active && (
                                        <button
                                            onClick={() => setActiveId(null)}
                                            style={{
                                                border: `1px solid ${C.border}`,
                                                background: "transparent",
                                                color: C.textDim,
                                                padding: "8px 10px",
                                                borderRadius: 10,
                                                cursor: "pointer",
                                                fontWeight: 750,
                                            }}
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>

                                {active && active.exercises.length === 0 && (
                                    <div style={{ marginTop: 12, color: C.textDim }}>
                                        Add your first exercise.
                                    </div>
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
                                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 900 }}>{ex.name}</div>
                                                        <div style={{ color: C.textDim, fontSize: 12 }}>{ex.group}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => addSet(ex.id)}
                                                        style={{
                                                            border: `1px solid ${C.border}`,
                                                            background: "transparent",
                                                            color: C.secondary,
                                                            padding: "8px 10px",
                                                            borderRadius: 10,
                                                            cursor: "pointer",
                                                            fontWeight: 850,
                                                            height: 40,
                                                        }}
                                                    >
                                                        + Set
                                                    </button>
                                                </div>

                                                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                                                    {ex.sets.map((s, idx) => (
                                                        <div
                                                            key={s.id}
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "52px 1fr 1fr",
                                                                gap: 8,
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <div style={{ color: C.textDim, fontSize: 12, fontWeight: 800 }}>
                                                                Set {idx + 1}
                                                            </div>

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
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sessions list */}
                            <div style={{ marginTop: 4 }}>
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
                                                {w.title} <span style={{ color: C.textDim, fontWeight: 700 }}>• {w.exercises.length} ex</span>
                                            </div>
                                            <div style={{ color: C.textDim, fontSize: 12 }}>{fmtDate(w.date)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ExercisePicker
                                open={pickerOpen}
                                onClose={() => setPickerOpen(false)}
                                onSelect={(ex) => addExercise(ex)}
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