import { openDB, type DBSchema } from "idb";
import type { WorkoutSession, BodyLog } from "../types/domain";

interface IronProtocolDB extends DBSchema {
    workouts: {
        key: string;
        value: WorkoutSession;
        indexes: { "by-date": string };
    };
    bodyLogs: {
        key: string;
        value: BodyLog;
        indexes: { "by-date": string };
    };
    meta: {
        key: string;
        value: { key: string; value: unknown };
    };
}

const DB_NAME = "iron-protocol";
const DB_VERSION = 1;

export const dbPromise = openDB<IronProtocolDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
        const workouts = db.createObjectStore("workouts", { keyPath: "id" });
        workouts.createIndex("by-date", "date");

        const bodyLogs = db.createObjectStore("bodyLogs", { keyPath: "id" });
        bodyLogs.createIndex("by-date", "date");

        db.createObjectStore("meta", { keyPath: "key" });
    },
});