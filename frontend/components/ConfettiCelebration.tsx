'use client';
import { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
    trigger: boolean;
    onComplete?: () => void;
}

export function useConfetti() {
    const fire = useCallback((options?: confetti.Options) => {
        const defaults = {
            spread: 360,
            ticks: 100,
            gravity: 0.8,
            decay: 0.94,
            startVelocity: 30,
            colors: ['#E0115F', '#7c3aed', '#3b82f6', '#10b981', '#eab308', '#ffffff'],
        };

        confetti({
            ...defaults,
            ...options,
            particleCount: 50,
            scalar: 1.2,
            shapes: ['circle', 'square'],
        });

        confetti({
            ...defaults,
            ...options,
            particleCount: 30,
            scalar: 0.75,
            shapes: ['circle'],
        });
    }, []);

    const fireworks = useCallback(() => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const interval: NodeJS.Timeout = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: {
                    x: Math.random(),
                    y: Math.random() - 0.2,
                },
                colors: ['#E0115F', '#7c3aed', '#3b82f6', '#10b981', '#eab308'],
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const burst = useCallback((origin?: { x: number; y: number }) => {
        const defaults = {
            origin: origin || { x: 0.5, y: 0.5 },
            spread: 100,
            startVelocity: 55,
            decay: 0.91,
            scalar: 1,
        };

        function shoot() {
            confetti({
                ...defaults,
                particleCount: 40,
                shapes: ['circle', 'square'],
                colors: ['#E0115F', '#7c3aed', '#3b82f6'],
            });

            confetti({
                ...defaults,
                particleCount: 20,
                shapes: ['circle'],
                colors: ['#ffffff', '#eab308'],
                scalar: 0.6,
            });
        }

        shoot();
        setTimeout(shoot, 100);
        setTimeout(shoot, 200);
    }, []);

    const sideCanons = useCallback(() => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
        };

        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
                colors: ['#E0115F', '#7c3aed', '#3b82f6', '#10b981', '#eab308'],
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }, []);

    return { fire, fireworks, burst, sideCanons };
}

export default function ConfettiCelebration({ trigger, onComplete }: ConfettiCelebrationProps) {
    const { sideCanons } = useConfetti();
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (trigger && !hasTriggered.current) {
            hasTriggered.current = true;
            sideCanons();

            if (onComplete) {
                setTimeout(onComplete, 2000);
            }
        }

        if (!trigger) {
            hasTriggered.current = false;
        }
    }, [trigger, sideCanons, onComplete]);

    return null;
}
