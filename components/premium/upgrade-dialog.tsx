"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown } from "lucide-react";
import Link from "next/link";

interface UpgradeDialogProps {
    feature: string;
}

export function UpgradeDialog({ feature }: UpgradeDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Debloquer cette fonctionnalite
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" aria-hidden="true" />
                        Fonctionnalite Premium
                    </DialogTitle>
                    <DialogDescription>
                        <strong>{feature}</strong> est reservee aux abonnes Premium.
                        Passez a Premium pour debloquer toutes les fonctionnalites avancees.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                        <Badge>Premium</Badge>
                        <span className="text-sm text-muted-foreground">
                            a partir de 9,99€/mois
                        </span>
                    </div>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-primary" aria-hidden="true" />
                            Plans nutritionnels sur mesure
                        </li>
                        <li className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-primary" aria-hidden="true" />
                            Coaching personnalise 24/7
                        </li>
                        <li className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-primary" aria-hidden="true" />
                            Analyses et rapports avances
                        </li>
                    </ul>
                    <Link href="/inscription">
                        <Button variant="premium" className="w-full gap-2">
                            <Crown className="h-4 w-4" aria-hidden="true" />
                            Passer a Premium
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
