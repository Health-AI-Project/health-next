"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface WizardStepProps {
    children: ReactNode;
    direction: number;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
    }),
};

export function WizardStep({ children, direction }: WizardStepProps) {
    return (
        <motion.div
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
            }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
}

interface WizardStepWrapperProps {
    children: ReactNode;
    stepKey: number;
    direction: number;
}

export function WizardStepWrapper({
    children,
    stepKey,
    direction,
}: WizardStepWrapperProps) {
    return (
        <AnimatePresence mode="wait" custom={direction}>
            <WizardStep key={stepKey} direction={direction}>
                {children}
            </WizardStep>
        </AnimatePresence>
    );
}
