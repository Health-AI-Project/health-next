"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Database, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    createDataSource,
    deactivateDataSource,
    fetchDataSources,
    updateDataSource,
} from "@/lib/api/admin";
import type { DataSourceRegistry } from "@/types/admin";

const FORMAT_COLORS: Record<DataSourceRegistry["format"], string> = {
    csv: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
    json: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
    xlsx: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
    api: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
};

interface SourceFormState {
    code: string;
    label: string;
    format: DataSourceRegistry["format"];
    description: string;
    url: string;
    license: string;
    active: boolean;
}

function emptyForm(): SourceFormState {
    return { code: "", label: "", format: "csv", description: "", url: "", license: "", active: true };
}

export default function SourcesAdminPage() {
    const [sources, setSources] = useState<DataSourceRegistry[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<SourceFormState>(emptyForm());

    const refresh = async () => {
        const data = await fetchDataSources();
        setSources(data);
    };

    useEffect(() => {
        let cancelled = false;
        refresh().finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const openNew = () => {
        setEditingId(null);
        setForm(emptyForm());
        setDialogOpen(true);
    };

    const openEdit = (s: DataSourceRegistry) => {
        setEditingId(s.id);
        setForm({
            code: s.code,
            label: s.label,
            format: s.format,
            description: s.description ?? "",
            url: s.url ?? "",
            license: s.license ?? "",
            active: s.active,
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (editingId !== null) {
            const updated = await updateDataSource(editingId, {
                label: form.label,
                description: form.description || null,
                url: form.url || null,
                license: form.license || null,
                active: form.active,
            });
            if (updated) {
                setSources((current) => current.map((s) => (s.id === editingId ? updated : s)));
                toast.success("Source mise à jour");
                setDialogOpen(false);
            } else {
                toast.error("Échec mise à jour");
            }
        } else {
            const created = await createDataSource(form);
            if (created) {
                setSources((current) => [...current, created]);
                toast.success("Source ajoutée au registre");
                setDialogOpen(false);
            } else {
                toast.error("Échec création (code déjà utilisé ?)");
            }
        }
    };

    const handleDeactivate = async (s: DataSourceRegistry) => {
        if (!confirm(`Désactiver la source "${s.label}" ?`)) return;
        const ok = await deactivateDataSource(s.id);
        if (ok) {
            setSources((current) => current.map((x) => (x.id === s.id ? { ...x, active: false } : x)));
            toast.success("Source désactivée");
        } else {
            toast.error("Échec désactivation");
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">Sources de données</h1>
                    <p className="text-muted-foreground">Chargement...</p>
                </header>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Sources de données</h1>
                    <p className="text-muted-foreground">
                        Registre dynamique : ajoute, modifie ou désactive des sources. L&apos;ETL consomme les sources actives.
                    </p>
                </div>
                <Button onClick={openNew}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouvelle source
                </Button>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sources.map((s) => (
                    <Card key={s.id} className={!s.active ? "opacity-60" : ""}>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Database className="h-5 w-5 text-primary" aria-hidden="true" />
                                    <CardTitle className="text-base">{s.label}</CardTitle>
                                </div>
                                <Badge className={FORMAT_COLORS[s.format]}>{s.format.toUpperCase()}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {s.description && (
                                <p className="text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="font-mono text-muted-foreground">{s.code}</span>
                                {s.license && <Badge variant="outline">{s.license}</Badge>}
                                {!s.active && <Badge variant="destructive">Désactivée</Badge>}
                            </div>
                            {s.url && (
                                <a
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                    Voir la source
                                </a>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                    Éditer
                                </Button>
                                {s.active && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-rose-700 hover:text-rose-900 hover:bg-rose-50 dark:text-rose-300"
                                        onClick={() => handleDeactivate(s)}
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId !== null ? "Éditer la source" : "Nouvelle source"}
                        </DialogTitle>
                        <DialogDescription>
                            Les champs code et format sont immuables après création.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 py-2">
                        <div className="grid gap-1">
                            <Label htmlFor="src-code">Code (identifiant unique)</Label>
                            <Input
                                id="src-code"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                placeholder="ex: garmin_connect_api"
                                disabled={editingId !== null}
                            />
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="src-label">Libellé</Label>
                            <Input
                                id="src-label"
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                                placeholder="ex: Garmin Connect API"
                            />
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="src-format">Format</Label>
                            <Select
                                value={form.format}
                                onValueChange={(v) =>
                                    setForm({ ...form, format: v as DataSourceRegistry["format"] })
                                }
                                disabled={editingId !== null}
                            >
                                <SelectTrigger id="src-format">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="csv">CSV</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                    <SelectItem value="xlsx">XLSX</SelectItem>
                                    <SelectItem value="api">API REST</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="src-description">Description</Label>
                            <Input
                                id="src-description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Court résumé du contenu"
                            />
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="src-url">URL</Label>
                            <Input
                                id="src-url"
                                value={form.url}
                                onChange={(e) => setForm({ ...form, url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="src-license">Licence</Label>
                            <Input
                                id="src-license"
                                value={form.license}
                                onChange={(e) => setForm({ ...form, license: e.target.value })}
                                placeholder="ex: CC0, MIT, CC BY 4.0"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editingId !== null ? "Sauvegarder" : "Créer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
