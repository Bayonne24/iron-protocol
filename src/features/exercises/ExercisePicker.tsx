// src/features/exercises/ExercisePicker.tsx
import { useMemo, useRef, useEffect, useState } from "react";
import type { Exercise, MuscleGroup } from "../../types/domain";
import { MUSCLE_GROUPS } from "../../types/domain";
import { searchExercises } from "./exercises";
import { GROUP_COLORS } from "./colors";
import { BottomSheet } from "../../app/ui/Modal";
import { C } from "../../app/ui/Theme";

export function ExercisePicker({
                                   open,
                                   onClose,
                                   onSelect,
                               }: {
    open: boolean;
    onClose: () => void;
    onSelect: (ex: Exercise) => void;
}) {
    const [search, setSearch] = useState("");
    const [group, setGroup] = useState<MuscleGroup | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [hoverId, setHoverId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setSearch("");
            setGroup(null);
            setHoverId(null);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const results = useMemo(() => searchExercises(search, group), [search, group]);

    return (
        <BottomSheet open={open} onClose={onClose}>
            <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div
                        style={{
                            color: C.primary,
                            fontWeight: 800,
                            letterSpacing: "0.14em",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                        }}
                    >
                        Select Exercise
                    </div>

                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", color: C.textDim, fontSize: 22, cursor: "pointer" }}
                    >
                        ×
                    </button>
                </div>

                <input
                    ref={inputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search exercises…"
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        marginTop: 12,
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                        color: C.text,
                        fontSize: 14,
                        outline: "none",
                    }}
                />

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                    <button
                        onClick={() => setGroup(null)}
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: `1px solid ${C.border}`,
                            background: group === null ? C.surface : "transparent",
                            color: group === null ? C.primary : C.textDim,
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 12,
                        }}
                    >
                        All
                    </button>

                    {MUSCLE_GROUPS.map((g) => (
                        <button
                            key={g}
                            onClick={() => setGroup(g)}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 999,
                                border: `1px solid ${C.border}`,
                                background: group === g ? C.surface : "transparent",
                                color: group === g ? C.primary : GROUP_COLORS[g],
                                cursor: "pointer",
                                fontWeight: 700,
                                fontSize: 12,
                            }}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ overflowY: "auto", maxHeight: "60vh" }}>
                {results.length === 0 ? (
                    <div style={{ padding: 24, color: C.textDim, textAlign: "center" }}>No exercises found</div>
                ) : (
                    results.map((ex) => (
                        <button
                            key={ex.id}
                            onClick={() => {
                                onSelect(ex);
                                onClose();
                            }}
                            onMouseEnter={() => setHoverId(ex.id)}
                            onMouseLeave={() => setHoverId(null)}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "12px 16px",
                                background: hoverId === ex.id ? C.surfaceHover : "transparent",
                                border: "none",
                                borderTop: `1px solid ${C.border}`,
                                cursor: "pointer",
                                color: C.text,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span style={{ fontWeight: 650 }}>{ex.name}</span>
                            <span style={{ fontSize: 12, color: GROUP_COLORS[ex.group], fontWeight: 800 }}>{ex.group}</span>
                        </button>
                    ))
                )}
            </div>
        </BottomSheet>
    );
}