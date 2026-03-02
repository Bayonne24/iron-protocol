// src/features/exercises/exercises.ts
import { EXERCISE_DB } from "./exerciseDb";
import { MUSCLE_GROUPS } from "../../types/domain";
import type { Exercise, MuscleGroup } from "../../types/domain";

let cached: Exercise[] | null = null;

function buildAll(): Exercise[] {
    const out: Exercise[] = [];
    for (const group of MUSCLE_GROUPS) {
        const names = EXERCISE_DB[group] ?? [];
        for (const name of names) {
            out.push({
                id: `${group}:${name}`.toLowerCase(),
                name,
                group,
            });
        }
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function allExercises(): Exercise[] {
    if (!cached) cached = buildAll();
    return cached;
}

export function searchExercises(query: string, group: MuscleGroup | null): Exercise[] {
    const q = query.trim().toLowerCase();
    return allExercises().filter((ex) => {
        if (group && ex.group !== group) return false;
        if (!q) return true;
        return ex.name.toLowerCase().includes(q);
    });
}