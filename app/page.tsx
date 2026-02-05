import Link from "next/link";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Zap,
  Crown,
  Heart,
  Activity,
  Apple,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "HealthNext | Votre parcours santé personnalisé",
  description:
    "Découvrez nos offres Freemium et Premium pour atteindre vos objectifs de santé et bien-être.",
};

const FREEMIUM_FEATURES = [
  { included: true, text: "Suivi basique de l'alimentation" },
  { included: true, text: "Objectifs personnalisés" },
  { included: true, text: "Rappels quotidiens" },
  { included: false, text: "Plans nutritionnels sur mesure" },
  { included: false, text: "Coaching personnalisé" },
  { included: false, text: "Analyses avancées" },
];

const PREMIUM_FEATURES = [
  { included: true, text: "Suivi complet de l'alimentation" },
  { included: true, text: "Objectifs personnalisés illimités" },
  { included: true, text: "Rappels et notifications intelligentes" },
  { included: true, text: "Plans nutritionnels sur mesure" },
  { included: true, text: "Coaching personnalisé 24/7" },
  { included: true, text: "Analyses et rapports avancés" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold">HealthNext</span>
          </div>
          <Link href="/inscription">
            <Button variant="outline">Commencer gratuitement</Button>
          </Link>
        </nav>
      </header>

      <main>
        <section
          className="container mx-auto px-4 py-16 md:py-24"
          aria-labelledby="hero-heading"
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" aria-hidden="true" />
              Nouveau: Plans nutritionnels IA
            </div>
            <h1
              id="hero-heading"
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              Votre parcours{" "}
              <span className="text-primary">santé personnalisé</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Atteignez vos objectifs de santé et bien-être avec notre
              accompagnement personnalisé. Choisissez l&apos;offre qui vous
              correspond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/inscription">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8">
                  <Activity className="h-5 w-5" aria-hidden="true" />
                  Commencer maintenant
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 text-lg px-8"
              >
                <Apple className="h-5 w-5" aria-hidden="true" />
                En savoir plus
              </Button>
            </div>
          </div>

          <div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            role="list"
            aria-label="Nos offres"
          >
            <Card
              className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors"
              role="listitem"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-secondary">
                    <TrendingUp className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Gratuit
                  </span>
                </div>
                <CardTitle className="text-2xl mt-4">Freemium</CardTitle>
                <CardDescription className="text-base">
                  Parfait pour découvrir et commencer votre parcours santé
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="mb-6">
                  <span className="text-4xl font-bold">0€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <ul className="space-y-3" aria-label="Fonctionnalités incluses">
                  {FREEMIUM_FEATURES.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check
                          className="h-5 w-5 text-primary flex-shrink-0"
                          aria-label="Inclus"
                        />
                      ) : (
                        <X
                          className="h-5 w-5 text-muted-foreground flex-shrink-0"
                          aria-label="Non inclus"
                        />
                      )}
                      <span
                        className={
                          feature.included ? "" : "text-muted-foreground"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/inscription" className="w-full">
                  <Button variant="outline" size="lg" className="w-full">
                    Commencer gratuitement
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card
              className="relative overflow-hidden border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl"
              role="listitem"
            >
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  <Crown className="h-4 w-4" aria-hidden="true" />
                  Populaire
                </span>
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <Crown className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <CardTitle className="text-2xl mt-4">Premium</CardTitle>
                <CardDescription className="text-base">
                  L&apos;expérience complète pour des résultats optimaux
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="mb-6">
                  <span className="text-4xl font-bold">9,99€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <ul className="space-y-3" aria-label="Fonctionnalités incluses">
                  {PREMIUM_FEATURES.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check
                        className="h-5 w-5 text-primary flex-shrink-0"
                        aria-label="Inclus"
                      />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/inscription" className="w-full">
                  <Button size="lg" className="w-full gap-2">
                    <Crown className="h-4 w-4" aria-hidden="true" />
                    Essayer Premium
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Prêt à transformer votre quotidien ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Rejoignez des milliers d&apos;utilisateurs qui ont déjà atteint leurs
              objectifs avec HealthNext.
            </p>
            <Link href="/inscription">
              <Button size="lg" className="gap-2 text-lg px-8">
                <Activity className="h-5 w-5" aria-hidden="true" />
                Créer mon profil
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="font-semibold">HealthNext</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 HealthNext. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
