import { useEffect, useState } from "react";
import { newId } from "../lib/id";
import type { WorkoutSession } from "../types/domain";
import { listWorkouts, saveWorkout } from "../features/workouts/workoutsRepo";

type Tab = "Log" | "Progress" | "Volume" | "History";

export function AppShell() {
    const [tab, setTab] = useState<Tab>("Log");
    const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);

    async function refresh() {
        const all = await listWorkouts();
        setWorkouts(all);
    }

    useEffect(() => {
        (async () => {
            await refresh();
            setLoading(false);
        })();
    }, []);

    const addTestSession = async () => {
        const session: WorkoutSession = {
            id: newId(),
            date: new Date().toISOString(),
            title: "Test Session",
            exercises: [],
        };
        await saveWorkout(session);
        await refresh();
    };

    return (
        <div style={{ padding: 16, fontFamily: "system-ui", maxWidth: 720, margin: "0 auto" }}>
            <h1 style={{ margin: "8px 0" }}>Iron Protocol</h1>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {(["Log", "Progress", "Volume", "History"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid #ddd",
                            background: tab === t ? "#111" : "#fff",
                            color: tab === t ? "#fff" : "#111",
                            cursor: "pointer",
                            fontWeight: 600,
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
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <button onClick={addTestSession} style={{ padding: "10px 12px", borderRadius: 10 }}>
                                Add Test Session (IndexedDB)
                            </button>
                            <div>Sessions stored: {workouts.length}</div>
                        </div>
                    )}

                    {tab !== "Log" && (
                        <div style={{ padding: 20, border: "1px dashed #bbb", borderRadius: 12 }}>
                            {tab} coming next…
                        </div>
                    )}
                </>
            )}
        </div>
    );
}