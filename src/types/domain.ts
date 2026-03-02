export type MuscleGroup =
    | "Chest"
    | "Shoulders"
    | "Biceps"
    | "Triceps"
    | "Legs"
    | "Back"
    | "Glutes"
    | "Abs"
    | "Forearms"
    | "Neck"
    | "Cardio";

export type Exercise = {
    id: string;      // stable ID (slug)
    name: string;
    group: MuscleGroup;
};

export type SetEntry = {
    weight: number;
    reps: number;
    rpe?: number;    // optional future
};

export type ExerciseEntry = {
    exerciseId: string;
    sets: SetEntry[];
    notes?: string;
};

export type WorkoutSession = {
    id: string;
    date: string; // ISO
    title?: string; // “Push Day”, etc.
    exercises: ExerciseEntry[];
    notes?: string;
};

export type BodyLog = {
    id: string;
    date: string; // ISO
    weightLb?: number;
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
};

export type CardioLog = {
    id: string;
    date: string; // ISO
    mode: "Run" | "Walk" | "Bike" | "Row" | "Other";
    durationMin: number;
    distanceMi?: number;
    calories?: number;
    notes?: string;
};

export type ProgressPhoto = {
    id: string;
    date: string; // ISO
    // stored in IndexedDB as Blob later
    blobId: string;
    note?: string;
};