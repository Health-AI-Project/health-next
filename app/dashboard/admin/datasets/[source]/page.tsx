"use client";

import { use, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ExportButton } from "@/components/ui/export-button";
import {
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    Plus,
    XCircle,
    Pencil,
    Trash2,
} from "lucide-react";
import { DATASET_LABELS, STATUS_LABELS, mockDatasetsBySource } from "@/lib/mocks/admin";
import {
    buildExportUrl,
    createDatasetRow,
    deleteDatasetRow,
    fetchDatasetRows,
    updateDatasetRow,
} from "@/lib/api/admin";
import type {
    DatasetRow,
    DatasetSource,
    ExportFormat,
    ValidationStatus,
} from "@/types/admin";
import { toast } from "sonner";

function ValidationBadge({ status }: { status: ValidationStatus }) {
    if (status === "VALIDATED") {
        return (
            <Badge variant="default" className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 gap-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                {STATUS_LABELS.VALIDATED}
            </Badge>
        );
    }
    if (status === "REJECTED") {
        return (
            <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" aria-hidden="true" />
                {STATUS_LABELS.REJECTED}
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="border-amber-500 text-amber-900 dark:text-amber-200 gap-1">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            {STATUS_LABELS.PENDING}
        </Badge>
    );
}

interface EditDialogProps {
    row: DatasetRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (updated: DatasetRow) => void;
    onReject: (id: string) => void;
    onValidate: (id: string) => void;
}

function EditDialog({ row, open, onOpenChange, onSave, onReject, onValidate }: EditDialogProps) {
    const [draft, setDraft] = useState<Record<string, string>>({});

    useMemo(() => {
        if (row) {
            const initial: Record<string, string> = {};
            for (const [key, val] of Object.entries(row.data)) {
                initial[key] = val == null ? "" : String(val);
            }
            setDraft(initial);
        }
    }, [row]);

    if (!row) return null;

    const handleSave = () => {
        const updatedData: Record<string, string | number | boolean | null> = {};
        for (const [k, v] of Object.entries(draft)) {
            if (v === "") {
                updatedData[k] = null;
            } else if (!isNaN(Number(v)) && v.trim() !== "") {
                updatedData[k] = Number(v);
            } else {
                updatedData[k] = v;
            }
        }
        onSave({ ...row, data: updatedData });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Édition de la ligne {row.id}</DialogTitle>
                    <DialogDescription>
                        Modifiez les champs ci-dessous, puis validez ou rejetez la ligne.
                    </DialogDescription>
                </DialogHeader>

                {row.anomalies.length > 0 && (
                    <div className="rounded-md border border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                            Anomalies détectées
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
                            {row.anomalies.map((a, i) => (
                                <li key={i}>
                                    <strong>{a.field}</strong> — {a.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid gap-3 py-2">
                    {Object.entries(draft).map(([key, value]) => {
                        const hasAnomaly = row.anomalies.some((a) => a.field === key);
                        return (
                            <div key={key} className="grid gap-1">
                                <Label htmlFor={`field-${key}`} className="text-xs uppercase tracking-wide">
                                    {key}
                                    {hasAnomaly && (
                                        <span className="ml-2 text-amber-700 dark:text-amber-400 normal-case">⚠ à vérifier</span>
                                    )}
                                </Label>
                                <Input
                                    id={`field-${key}`}
                                    value={value}
                                    onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                                    className={hasAnomaly ? "border-amber-500" : undefined}
                                    aria-invalid={hasAnomaly}
                                />
                            </div>
                        );
                    })}
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                            onReject(row.id);
                            onOpenChange(false);
                        }}
                    >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Rejeter
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            handleSave();
                            onValidate(row.id);
                            toast.success("Ligne sauvegardée et validée");
                        }}
                    >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Sauvegarder + valider
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function DatasetSourcePage({ params }: { params: Promise<{ source: string }> }) {
    const { source } = use(params);

    if (!(source in mockDatasetsBySource)) {
        notFound();
    }

    const sourceTyped = source as DatasetSource;
    const [rows, setRows] = useState<DatasetRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRow, setEditingRow] = useState<DatasetRow | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchDatasetRows(sourceTyped, 100)
            .then((data) => {
                if (!cancelled) setRows(data);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [sourceTyped]);

    const handleEdit = (row: DatasetRow) => {
        setEditingRow(row);
        setEditOpen(true);
    };

    const handleSave = async (updated: DatasetRow) => {
        // Calcule le diff vs la ligne en BDD pour n'envoyer que les colonnes modifiées
        const original = rows.find((r) => r.id === updated.id);
        const diff: Record<string, string | number | boolean | null> = {};
        for (const [k, v] of Object.entries(updated.data)) {
            if (!original || original.data[k] !== v) {
                diff[k] = v;
            }
        }
        if (Object.keys(diff).length === 0) {
            setRows((current) => current.map((r) => (r.id === updated.id ? updated : r)));
            return;
        }
        const serverRow = await updateDatasetRow(sourceTyped, updated.id, diff);
        if (serverRow) {
            // Merge la réponse serveur avec les anomalies/validation_status locaux
            setRows((current) =>
                current.map((r) =>
                    r.id === updated.id
                        ? { ...updated, data: serverRow.data }
                        : r,
                ),
            );
            toast.success("Modification persistée en BDD");
        } else {
            setRows((current) => current.map((r) => (r.id === updated.id ? updated : r)));
            toast.warning("Modification locale uniquement (backend indisponible)");
        }
    };

    const handleValidate = (id: string) => {
        setRows((current) =>
            current.map((r) => (r.id === id ? { ...r, validation_status: "VALIDATED", anomalies: [] } : r)),
        );
    };

    const handleReject = (id: string) => {
        setRows((current) =>
            current.map((r) => (r.id === id ? { ...r, validation_status: "REJECTED" } : r)),
        );
        toast.success("Ligne rejetée");
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Supprimer définitivement la ligne ${id} ?`)) return;
        const ok = await deleteDatasetRow(sourceTyped, id);
        if (ok) {
            setRows((current) => current.filter((r) => r.id !== id));
            toast.success("Ligne supprimée");
        } else {
            toast.error("Échec suppression");
        }
    };

    const handleCreate = async (data: Record<string, string | number | boolean | null>) => {
        const newRow = await createDatasetRow(sourceTyped, data);
        if (newRow) {
            setRows((current) => [newRow, ...current]);
            toast.success("Ligne créée");
            return true;
        }
        toast.error("Échec création (vérifie les champs requis)");
        return false;
    };

    const handleExport = (format: ExportFormat) => {
        const url = buildExportUrl(sourceTyped, format);
        window.open(url, "_blank");
        toast.success(`Export ${format.toUpperCase()} demandé`);
    };

    const allKeys = useMemo(() => {
        const set = new Set<string>();
        rows.forEach((r) => Object.keys(r.data).forEach((k) => set.add(k)));
        return Array.from(set);
    }, [rows]);

    const columns: DataTableColumn<DatasetRow>[] = [
        {
            key: "validation_status",
            header: "Statut",
            accessor: (r) => <ValidationBadge status={r.validation_status} />,
        },
        ...allKeys.slice(0, 5).map<DataTableColumn<DatasetRow>>((k) => ({
            key: k,
            header: k,
            accessor: (r) => {
                const val = r.data[k];
                const hasAnomaly = r.anomalies.some((a) => a.field === k);
                return (
                    <span className={hasAnomaly ? "font-medium text-amber-700 dark:text-amber-400" : undefined}>
                        {val == null ? <span className="text-muted-foreground italic">vide</span> : String(val)}
                    </span>
                );
            },
            sortValue: (r) => {
                const v = r.data[k];
                if (typeof v === "number") return v;
                return v == null ? "" : String(v);
            },
        })),
        {
            key: "anomalies",
            header: "Anomalies",
            accessor: (r) =>
                r.anomalies.length > 0 ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-900 dark:text-amber-200">
                        {r.anomalies.length}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                ),
            sortValue: (r) => r.anomalies.length,
        },
        {
            key: "actions",
            header: "Actions",
            sortable: false,
            accessor: (r) => (
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(r);
                        }}
                        aria-label={`Éditer la ligne ${r.id}`}
                    >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Éditer
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-rose-700 hover:text-rose-900 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(r.id);
                        }}
                        aria-label={`Supprimer la ligne ${r.id}`}
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            ),
            className: "w-44",
        },
    ];

    const stats = {
        total: rows.length,
        pending: rows.filter((r) => r.validation_status === "PENDING").length,
        validated: rows.filter((r) => r.validation_status === "VALIDATED").length,
        rejected: rows.filter((r) => r.validation_status === "REJECTED").length,
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard/admin/datasets" className="hover:text-foreground inline-flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Datasets
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-foreground">{DATASET_LABELS[sourceTyped]}</span>
            </div>

            <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{DATASET_LABELS[sourceTyped]}</h1>
                    <p className="text-muted-foreground">
                        {stats.total} lignes — {stats.pending} à valider, {stats.validated} validées, {stats.rejected} rejetées
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setCreateOpen(true)}
                        aria-label="Ajouter une nouvelle ligne"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Nouveau
                    </Button>
                    <ExportButton onExport={handleExport} disabled={rows.length === 0} />
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Lignes du dataset</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={rows}
                        rowId={(r) => r.id}
                        pageSize={10}
                        searchableKeys={allKeys}
                        searchPlaceholder="Rechercher dans les données..."
                        emptyMessage="Aucune ligne dans ce dataset"
                        caption={`Lignes ingérées pour la source ${DATASET_LABELS[sourceTyped]}`}
                    />
                </CardContent>
            </Card>

            <EditDialog
                row={editingRow}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSave={handleSave}
                onReject={handleReject}
                onValidate={handleValidate}
            />

            <CreateDialog
                source={sourceTyped}
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreate={handleCreate}
            />
        </div>
    );
}

// Templates de colonnes requises par source (côté front — affichés à l'admin)
const CREATE_TEMPLATES: Record<DatasetSource, { fields: string[]; placeholders: Record<string, string> }> = {
    daily_food_nutrition: {
        fields: ["user_id", "logged_at", "calories", "protein", "carbs", "fat"],
        placeholders: {
            user_id: "ID user (ex: u_001)",
            logged_at: "YYYY-MM-DD",
            calories: "ex: 320",
            protein: "ex: 18",
            carbs: "ex: 35",
            fat: "ex: 12",
        },
    },
    diet_recommendations: { fields: [], placeholders: {} },
    exercisedb: {
        fields: ["id", "name", "type", "difficulty", "required_equipment"],
        placeholders: {
            id: "ex-mspr-001",
            name: "Squat sauté",
            type: "strength | cardio | flexibility",
            difficulty: "beginner | intermediate | advanced",
            required_equipment: "none | bodyweight | dumbbell",
        },
    },
    gym_members: {
        fields: ["user_id", "date", "type", "duration"],
        placeholders: {
            user_id: "ID user (ex: u_001)",
            date: "YYYY-MM-DD",
            type: "cardio | strength",
            duration: "minutes (ex: 45)",
        },
    },
    fitness_tracker: { fields: [], placeholders: {} },
};

interface CreateDialogProps {
    source: DatasetSource;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (data: Record<string, string | number | boolean | null>) => Promise<boolean>;
}

function CreateDialog({ source, open, onOpenChange, onCreate }: CreateDialogProps) {
    const template = CREATE_TEMPLATES[source];
    const [values, setValues] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const data: Record<string, string | number | boolean | null> = {};
        for (const [k, v] of Object.entries(values)) {
            if (v === "") {
                data[k] = null;
            } else if (!isNaN(Number(v)) && v.trim() !== "") {
                data[k] = Number(v);
            } else {
                data[k] = v;
            }
        }
        setSubmitting(true);
        const ok = await onCreate(data);
        setSubmitting(false);
        if (ok) {
            setValues({});
            onOpenChange(false);
        }
    };

    if (template.fields.length === 0) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Création non supportée</DialogTitle>
                        <DialogDescription>
                            La source <span className="font-mono">{source}</span> n&apos;est pas encore mappée à une table éditable.
                            Utilise le pipeline ETL pour ingérer de nouvelles lignes.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => onOpenChange(false)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nouvelle ligne — {source}</DialogTitle>
                    <DialogDescription>
                        Tous les champs sont requis. La ligne sera insérée directement en base.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-2">
                    {template.fields.map((field) => (
                        <div key={field} className="grid gap-1">
                            <Label htmlFor={`create-${field}`} className="text-xs uppercase tracking-wide">
                                {field}
                            </Label>
                            <Input
                                id={`create-${field}`}
                                placeholder={template.placeholders[field]}
                                value={values[field] ?? ""}
                                onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
                            />
                        </div>
                    ))}
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Création..." : "Créer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
