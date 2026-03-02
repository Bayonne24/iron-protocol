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
    id: Id;
    name: string;
    group: MuscleGroup;
};

export type WorkoutSet = {
    id: Id;
    weight: number; // lbs for now
    reps: number;
};

export type WorkoutExercise = {
    id: Id;
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