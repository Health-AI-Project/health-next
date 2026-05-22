"use client";

import * as React from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportFormat } from "@/types/admin";

interface ExportButtonProps {
    onExport: (format: ExportFormat) => Promise<void> | void;
    disabled?: boolean;
    label?: string;
    formats?: ExportFormat[];
}

export function ExportButton({
    onExport,
    disabled = false,
    label = "Exporter",
    formats = ["json", "csv"],
}: ExportButtonProps) {
    const [pendingFormat, setPendingFormat] = React.useState<ExportFormat | null>(null);

    const handleExport = async (format: ExportFormat) => {
        setPendingFormat(format);
        try {
            await onExport(format);
        } finally {
            setPendingFormat(null);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled || pendingFormat !== null}
                    aria-label={`${label} les données`}
                >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>{pendingFormat ? `Export ${pendingFormat.toUpperCase()}...` : label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {formats.includes("json") && (
                    <DropdownMenuItem
                        onSelect={() => handleExport("json")}
                        disabled={pendingFormat !== null}
                    >
                        <FileJson className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>Format JSON</span>
                    </DropdownMenuItem>
                )}
                {formats.includes("csv") && (
                    <DropdownMenuItem
                        onSelect={() => handleExport("csv")}
                        disabled={pendingFormat !== null}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>Format CSV</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function downloadAsFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function toCsv(rows: Array<Record<string, unknown>>): string {
    if (rows.length === 0) return "";
    const headers = Array.from(
        rows.reduce((set, row) => {
            Object.keys(row).forEach((k) => set.add(k));
            return set;
        }, new Set<string>()),
    );
    const escape = (v: unknown): string => {
        if (v == null) return "";
        const s = typeof v === "object" ? JSON.stringify(v) : String(v);
        if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
    };
    const lines = [headers.join(",")];
    for (const row of rows) {
        lines.push(headers.map((h) => escape(row[h])).join(","));
    }
    return lines.join("\n");
}
