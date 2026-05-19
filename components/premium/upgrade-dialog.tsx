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
import { Lock, Crown, Gem } from "lucide-react";
import Link from "next/link";
import { SubscriptionTier } from "@/lib/hooks/use-premium-status";

interface UpgradeDialogProps {
    feature: string;
    requiredTier: SubscriptionTier;
    currentTier: SubscriptionTier;
}

const TIER_CONFIG = {
    premium: {
        label: "Premium",
        price: "9,99€",
        icon: Crown,
        badge: "Premium",
        features: [
            "Recommandations IA personnalisees",
            "Plans nutritionnels et sportifs detailles",
            "Suivi fin des objectifs",
        ],
    },
    premium_plus: {
        label: "Premium+",
        price: "19,99€",
        icon: Gem,
        badge: "Premium+",
        features: [
            "Integration donnees biometriques",
            "Connexion objets connectes",
            "Consultations nutritionnistes en ligne",
        ],
    },
};

export function UpgradeDialog({ feature, requiredTier, currentTier }: UpgradeDialogProps) {
    const config = TIER_CONFIG[requiredTier === "free" ? "premium" : requiredTier];
    const Icon = config.icon;

    const upgradeMessage =
        currentTier === "free" && requiredTier === "premium_plus"
            ? `Passez a ${config.label} pour debloquer cette fonctionnalite et bien plus.`
            : currentTier === "premium" && requiredTier === "premium_plus"
              ? `Vous etes Premium. Passez a Premium+ pour debloquer les fonctionnalites avancees.`
              : `Passez a ${config.label} pour debloquer toutes les fonctionnalites avancees.`;

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
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                        Fonctionnalite {config.label}
                    </DialogTitle>
                    <DialogDescription>
                        <strong>{feature}</strong> est reservee aux abonnes {config.label}.{" "}
                        {upgradeMessage}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                        <Badge>{config.badge}</Badge>
                        <span className="text-sm text-muted-foreground">
                            a partir de {config.price}/mois
                        </span>
                    </div>
                    <ul className="space-y-2 text-sm">
                        {config.features.map((feat) => (
                            <li key={feat} className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                                {feat}
                            </li>
                        ))}
                    </ul>
                    <Link href="/inscription">
                        <Button variant="premium" className="w-full gap-2">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            Passer a {config.label}
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
