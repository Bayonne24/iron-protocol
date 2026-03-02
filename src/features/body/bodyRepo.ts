import type { BodyLog } from "../../types/domain";
import { dbPromise } from "../../lib/db";

export async function listBodyLogs(): Promise<BodyLog[]> {
    const db = await dbPromise;
    const all = await db.getAll("bodyLogs");
    all.sort((a, b) => a.date.localeCompare(b.date));
    return all;
}

export async function saveBodyLog(entry: BodyLog): Promise<void> {
    const db = await dbPromise;
    await db.put("bodyLogs", entry);
}

export async function deleteBodyLog(id: string): Promise<void> {
    const db = await dbPromise;
    await db.delete("bodyLogs", id);
}

export async function clearBodyLogs(): Promise<void> {
    const db = await dbPromise;
    await db.clear("bodyLogs");
}