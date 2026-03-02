// src/features/exercises/exerciseDb.ts
import type { MuscleGroup } from "../../types/domain";

// NOTE: keep this DB huge if you want; this is just a stub starter.
// You can paste your full list in here safely.
export const EXERCISE_DB: Record<MuscleGroup, string[]> = {
    Chest: ["Bench Press", "Incline Bench Press", "Dumbbell Chest Press", "Push-Up"],
    Shoulders: ["Overhead Press", "Dumbbell Shoulder Press", "Lateral Raise", "Face Pull"],
    Biceps: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl"],
    Triceps: ["Tricep Pushdown With Rope", "Skull Crushers", "Bench Dip"],
    Legs: ["Squat", "Leg Press", "Romanian Deadlift", "Bulgarian Split Squat"],
    Back: ["Deadlift", "Barbell Row", "Pull-Up", "Lat Pulldown With Pronated Grip"],
    Glutes: ["Hip Thrust", "Glute Bridge", "Cable Glute Kickback"],
    Abs: ["Plank", "Cable Crunch", "Hanging Knee Raise"],
    Forearms: ["Farmers Walk", "Wrist Roller"],
    Neck: ["Lying Neck Curl"],
    Cardio: ["Rowing Machine", "Stationary Bike"],
};