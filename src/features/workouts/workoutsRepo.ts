import type { WorkoutSession } from "../../types/domain";
import { dbPromise } from "../../lib/db";

export async function listWorkouts(): Promise<WorkoutSession[]> {
    const db = await dbPromise;
    const all = await db.getAll("workouts");
    all.sort((a, b) => a.date.localeCompare(b.date));
    return all;
}

export async function saveWorkout(session: WorkoutSession): Promise<void> {
    const db = await dbPromise;
    await db.put("workouts", session);
}

export async function deleteWorkout(id: string): Promise<void> {
    const db = await dbPromise;
    await db.delete("workouts", id);
}

export async function clearWorkouts(): Promise<void> {
    const db = await dbPromise;
    await db.clear("workouts");
}