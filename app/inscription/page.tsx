import { Metadata } from "next";
import { WizardContainer } from "@/components/wizard/wizard-container";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: "Inscription | HealthNext",
    description: "Créez votre profil personnalisé en quelques étapes simples",
};

export default function InscriptionPage() {
    return (
        <main>
            <WizardContainer />
            <Toaster position="bottom-right" />
        </main>
    );
}
