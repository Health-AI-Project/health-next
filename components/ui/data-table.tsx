"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
    key: keyof T | string;
    header: string;
    accessor?: (row: T) => React.ReactNode;
    sortValue?: (row: T) => string | number;
    sortable?: boolean;
    className?: string;
    headerClassName?: string;
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    pageSize?: number;
    searchableKeys?: Array<keyof T | string>;
    searchPlaceholder?: string;
    rowId: (row: T) => string;
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
    caption?: string;
    className?: string;
}

type SortState = { key: string; direction: "asc" | "desc" } | null;

export function DataTable<T>({
    columns,
    data,
    pageSize = 10,
    searchableKeys = [],
    searchPlaceholder = "Rechercher...",
    rowId,
    onRowClick,
    emptyMessage = "Aucune donnée à afficher",
    caption,
    className,
}: DataTableProps<T>) {
    const [search, setSearch] = React.useState("");
    const [sort, setSort] = React.useState<SortState>(null);
    const [page, setPage] = React.useState(0);

    const filtered = React.useMemo(() => {
        if (!search || searchableKeys.length === 0) return data;
        const lower = search.toLowerCase();
        return data.filter((row) =>
            searchableKeys.some((key) => {
                const value = (row as Record<string, unknown>)[key as string];
                if (value == null) return false;
                return String(value).toLowerCase().includes(lower);
            }),
        );
    }, [data, search, searchableKeys]);

    const sorted = React.useMemo(() => {
        if (!sort) return filtered;
        const column = columns.find((c) => String(c.key) === sort.key);
        if (!column) return filtered;
        const getValue = column.sortValue
            ? column.sortValue
            : (row: T) => (row as Record<string, unknown>)[sort.key] as string | number;
        const sortedData = [...filtered].sort((a, b) => {
            const av = getValue(a);
            const bv = getValue(b);
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            if (typeof av === "number" && typeof bv === "number") {
                return sort.direction === "asc" ? av - bv : bv - av;
            }
            const result = String(av).localeCompare(String(bv), "fr", { numeric: true });
            return sort.direction === "asc" ? result : -result;
        });
        return sortedData;
    }, [filtered, sort, columns]);

    React.useEffect(() => {
        setPage(0);
    }, [search, sort]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

    const toggleSort = (key: string) => {
        setSort((current) => {
            if (!current || current.key !== key) return { key, direction: "asc" };
            if (current.direction === "asc") return { key, direction: "desc" };
            return null;
        });
    };

    return (
        <div className={cn("space-y-4", className)}>
            {searchableKeys.length > 0 && (
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search
                            className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                            aria-label={searchPlaceholder}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                        {sorted.length} résultat{sorted.length > 1 ? "s" : ""}
                    </p>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    {caption && <caption className="sr-only">{caption}</caption>}
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => {
                                const sortKey = String(col.key);
                                const isSorted = sort?.key === sortKey;
                                const sortable = col.sortable !== false;
                                return (
                                    <TableHead
                                        key={sortKey}
                                        className={col.headerClassName}
                                        aria-sort={
                                            isSorted
                                                ? sort.direction === "asc"
                                                    ? "ascending"
                                                    : "descending"
                                                : sortable
                                                    ? "none"
                                                    : undefined
                                        }
                                    >
                                        {sortable ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleSort(sortKey)}
                                                className="inline-flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                                                aria-label={`Trier par ${col.header}`}
                                            >
                                                <span>{col.header}</span>
                                                {isSorted ? (
                                                    sort.direction === "asc" ? (
                                                        <ArrowUp className="h-3 w-3" aria-hidden="true" />
                                                    ) : (
                                                        <ArrowDown className="h-3 w-3" aria-hidden="true" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
                                                )}
                                            </button>
                                        ) : (
                                            col.header
                                        )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageData.map((row) => (
                                <TableRow
                                    key={rowId(row)}
                                    className={onRowClick ? "cursor-pointer" : undefined}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    tabIndex={onRowClick ? 0 : undefined}
                                    onKeyDown={
                                        onRowClick
                                            ? (e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    onRowClick(row);
                                                }
                                            }
                                            : undefined
                                    }
                                >
                                    {columns.map((col) => (
                                        <TableCell key={String(col.key)} className={col.className}>
                                            {col.accessor
                                                ? col.accessor(row)
                                                : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                        Page {page + 1} sur {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            aria-label="Page précédente"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">Précédent</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            aria-label="Page suivante"
                        >
                            <span className="sr-only sm:not-sr-only">Suivant</span>
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
