import type { Exercise, MuscleGroup } from "../../types/domain";
import { MUSCLE_GROUPS } from "../../types/domain";
import { EXERCISE_DB } from "./exerciseDb";

export { MUSCLE_GROUPS };

function normalize(s: string) {
    return s.trim().toLowerCase();
}

export function buildExercises(): Exercise[] {
    const out: Exercise[] = [];
    for (const g of MUSCLE_GROUPS) {
        const names = EXERCISE_DB[g] ?? [];
        for (const name of names) {
            out.push({
                id: `${g}:${name}`.replace(/\s+/g, " ").trim(),
                name,
                group: g,
            });
        }
    }
    return out;
}

const ALL = buildExercises();

export function searchExercises(search: string, group: MuscleGroup | null): Exercise[] {
    const q = normalize(search);
    return ALL.filter((ex) => {
        if (group && ex.group !== group) return false;
        if (!q) return true;
        return normalize(ex.name).includes(q);
    });
}