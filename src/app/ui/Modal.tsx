// src/app/ui/Modal.tsx
import type { ReactNode } from "react";
import { C } from "./Theme";

export function BottomSheet({
                                open,
                                onClose,
                                children,
                            }: {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}) {
    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                zIndex: 1000,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                backdropFilter: "blur(6px)",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: 720,
                    maxHeight: "85vh",
                    background: C.bg,
                    borderRadius: "16px 16px 0 0",
                    border: `1px solid ${C.border}`,
                    borderBottom: "none",
                    overflow: "hidden",
                }}
            >
                {children}
            </div>
        </div>
    );
}