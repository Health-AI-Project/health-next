import { Metadata } from "next";
import { WizardContainer } from "@/components/wizard/wizard-container";

export const metadata: Metadata = {
    title: "Inscription | HealthNext",
    description: "Créez votre profil personnalisé en quelques étapes simples",
};

export default function InscriptionPage() {
    return (
        <main>
            <WizardContainer />
        </main>
    );
}
