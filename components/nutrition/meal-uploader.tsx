"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface MealUploaderProps {
    onUpload: (file: File) => void;
    isLoading?: boolean;
}

export function MealUploader({ onUpload, isLoading = false }: MealUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },
        maxFiles: 1,
        disabled: isLoading,
    });

    const handleClear = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        setFile(null);
    };

    const handleAnalyze = () => {
        if (file) {
            onUpload(file);
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                {!preview ? (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer",
                            isDragActive
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
                            isLoading && "pointer-events-none opacity-50"
                        )}
                    >
                        <input {...getInputProps()} aria-label="Zone de dépôt de fichier" />
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-medium">
                                {isDragActive
                                    ? "Déposez l'image ici..."
                                    : "Glissez-déposez une photo de repas"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                ou cliquez pour sélectionner un fichier
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                PNG, JPG, WEBP jusqu&apos;à 10MB
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                            <Image
                                src={preview}
                                alt="Prévisualisation du repas"
                                fill
                                className="object-cover"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={handleClear}
                                disabled={isLoading}
                                aria-label="Supprimer l'image"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                                <span className="truncate max-w-[200px]">{file?.name}</span>
                            </div>
                            <Button
                                onClick={handleAnalyze}
                                disabled={isLoading}
                                className="gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyse en cours...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Analyser le repas
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
