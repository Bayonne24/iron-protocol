// src/types/domain.ts

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

export type Id = string;

export type Exercise = {
    id: Id;
    name: string;
    group: MuscleGroup;
};

export type WorkoutSet = {
    weight: number;
    reps: number;
};

export type WorkoutExercise = {
    exerciseId: Id;
    name: string;
    group: MuscleGroup;
    sets: WorkoutSet[];
};

export type WorkoutSession = {
    id: Id;
    date: string; // ISO
    title: string;
    exercises: WorkoutExercise[];
};