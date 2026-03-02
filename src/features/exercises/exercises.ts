import { EXERCISE_DB } from "./exerciseDb";
import type { Exercise, MuscleGroup } from "../../types/domain";
import { slugify } from "../../lib/id";

export const MUSCLE_GROUPS = Object.keys(EXERCISE_DB) as MuscleGroup[];

export const EXERCISES: Exercise[] = MUSCLE_GROUPS.flatMap((group) =>
    EXERCISE_DB[group].map((name) => ({
        id: `${group.toLowerCase()}:${slugify(name)}`,
        name,
        group,
    }))
);

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
    EXERCISES.map((e) => [e.id, e])
);

// Simple fast search index (lowercased name + group)
type SearchRow = {
    id: string;
    name: string;
    group: MuscleGroup;
    haystack: string;
};

const SEARCH_ROWS: SearchRow[] = EXERCISES.map((e) => ({
    id: e.id,
    name: e.name,
    group: e.group,
    haystack: `${e.name} ${e.group}`.toLowerCase(),
}));

export function searchExercises(query: string, group?: MuscleGroup | null): Exercise[] {
    const q = query.trim().toLowerCase();
    let rows = SEARCH_ROWS;

    if (group) rows = rows.filter((r) => r.group === group);
    if (!q) return rows.map((r) => EXERCISE_BY_ID[r.id]);

    // contains match is fine for now; we can upgrade to scoring later
    return rows
        .filter((r) => r.haystack.includes(q))
        .slice(0, 200)
        .map((r) => EXERCISE_BY_ID[r.id]);
}