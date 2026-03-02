import type { WorkoutSession } from "../../types/domain";

export function getExerciseSeries(workouts: WorkoutSession[], exerciseName: string) {
    // returns [{date, topWeight}] sorted oldest -> newest
    const rows: { date: string; topWeight: number }[] = [];

    for (const w of workouts) {
        const ex = w.exercises.find((e) => e.name === exerciseName);
        if (!ex) continue;
        const top = Math.max(...ex.sets.map((s) => s.weight ?? 0), 0);
        rows.push({ date: w.date, topWeight: top });
    }

    rows.sort((a, b) => (a.date > b.date ? 1 : -1));
    return rows;
}

export function getPR(workouts: WorkoutSession[], exerciseName: string) {
    let pr = 0;
    let prDate: string | null = null;

    for (const w of workouts) {
        const ex = w.exercises.find((e) => e.name === exerciseName);
        if (!ex) continue;
        const top = Math.max(...ex.sets.map((s) => s.weight ?? 0), 0);
        if (top > pr) {
            pr = top;
            prDate = w.date;
        }
    }

    return { pr, prDate };
}