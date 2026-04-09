"use client";

import { useState } from "react";
import { NutritionData, saveNutritionData } from "@/lib/actions/nutrition-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Edit2, Save, X, Loader2 } from "lucide-react";

interface NutritionResultTableProps {
    data: NutritionData[];
    onDataUpdate?: (data: NutritionData[]) => void;
    isLoading?: boolean;
}

export function NutritionResultTable({
    data,
    onDataUpdate,
    isLoading = false,
}: NutritionResultTableProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedData, setEditedData] = useState<NutritionData[]>(data);
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = () => {
        setEditedData([...data]);
        setIsEditMode(true);
    };

    const handleCancel = () => {
        setEditedData([...data]);
        setIsEditMode(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save each item individually
            const savePromises = editedData.map(item =>
                saveNutritionData(item.id, {
                    name: item.name,
                    calories: item.calories,
                    proteins: item.proteins,
                    carbs: item.carbs,
                    fats: item.fats,
                })
            );
            await Promise.all(savePromises);

            onDataUpdate?.(editedData);
            setIsEditMode(false);
            toast.success("Modifications sauvegardées", {
                description: "Les données nutritionnelles ont été mises à jour.",
            });
        } catch {
            toast.error("Erreur de sauvegarde", {
                description: "Impossible de sauvegarder les modifications.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const updateItem = (id: string, field: keyof NutritionData, value: string | number) => {
        setEditedData((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, [field]: typeof value === "string" && field !== "name" ? parseFloat(value) || 0 : value }
                    : item
            )
        );
    };

    const totalCalories = (isEditMode ? editedData : data).reduce(
        (sum, item) => sum + item.calories,
        0
    );
    const totalProteins = (isEditMode ? editedData : data).reduce(
        (sum, item) => sum + item.proteins,
        0
    );
    const totalCarbs = (isEditMode ? editedData : data).reduce(
        (sum, item) => sum + item.carbs,
        0
    );
    const totalFats = (isEditMode ? editedData : data).reduce(
        (sum, item) => sum + item.fats,
        0
    );

    if (isLoading) {
        return <NutritionResultSkeleton />;
    }

    if (data.length === 0) {
        return null;
    }

    const displayData = isEditMode ? editedData : data;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">Analyse nutritionnelle</CardTitle>
                <div className="flex gap-2">
                    {isEditMode ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="gap-1"
                            >
                                <X className="h-4 w-4" />
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="gap-1"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Valider
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="gap-1"
                        >
                            <Edit2 className="h-4 w-4" />
                            Mode Édition
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aliment</TableHead>
                            <TableHead className="text-right">Calories</TableHead>
                            <TableHead className="text-right">Protéines</TableHead>
                            <TableHead className="text-right">Glucides</TableHead>
                            <TableHead className="text-right">Lipides</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {isEditMode ? (
                                        <Input
                                            value={item.name}
                                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                            className="h-8 max-w-[200px]"
                                            aria-label={`Nom de l'aliment: ${item.name}`}
                                        />
                                    ) : (
                                        <span className="font-medium">{item.name}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {isEditMode ? (
                                        <Input
                                            type="number"
                                            value={item.calories}
                                            onChange={(e) => updateItem(item.id, "calories", e.target.value)}
                                            className="h-8 w-20 ml-auto text-right"
                                            aria-label={`Calories pour ${item.name}`}
                                        />
                                    ) : (
                                        <span>{item.calories} kcal</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {isEditMode ? (
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={item.proteins}
                                            onChange={(e) => updateItem(item.id, "proteins", e.target.value)}
                                            className="h-8 w-20 ml-auto text-right"
                                            aria-label={`Protéines pour ${item.name}`}
                                        />
                                    ) : (
                                        <span>{item.proteins}g</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {isEditMode ? (
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={item.carbs}
                                            onChange={(e) => updateItem(item.id, "carbs", e.target.value)}
                                            className="h-8 w-20 ml-auto text-right"
                                            aria-label={`Glucides pour ${item.name}`}
                                        />
                                    ) : (
                                        <span>{item.carbs}g</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {isEditMode ? (
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={item.fats}
                                            onChange={(e) => updateItem(item.id, "fats", e.target.value)}
                                            className="h-8 w-20 ml-auto text-right"
                                            aria-label={`Lipides pour ${item.name}`}
                                        />
                                    ) : (
                                        <span>{item.fats}g</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <div className="flex w-full items-center justify-between">
                    <span className="font-medium">Total</span>
                    <div className="flex gap-6 text-sm">
                        <span className="font-bold text-primary">{totalCalories} kcal</span>
                        <span>{totalProteins.toFixed(1)}g prot.</span>
                        <span>{totalCarbs.toFixed(1)}g gluc.</span>
                        <span>{totalFats.toFixed(1)}g lip.</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

function NutritionResultSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-28" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-4 border-b pb-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 py-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16 ml-auto" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <div className="flex w-full justify-between">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-48" />
                </div>
            </CardFooter>
        </Card>
    );
}
