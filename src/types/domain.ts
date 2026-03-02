// src/types/domain.ts
export type Id = string;

export const MUSCLE_GROUPS = [
    "Chest",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Legs",
    "Back",
    "Glutes",
    "Abs",
    "Forearms",
    "Neck",
    "Cardio",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export type Exercise = {
    id: string;
    name: string;
    group: MuscleGroup;
};

export type WorkoutSet = {
    weight: number;
    reps: number;
};

export type WorkoutExercise = {
    exerciseId: string;
    name: string;
    group: MuscleGroup;
    sets: WorkoutSet[];
};

export type WorkoutSession = {
    id: string;
    date: string; // ISO
    title: string;
    exercises: WorkoutExercise[];
};