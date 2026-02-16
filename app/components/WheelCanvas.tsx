'use client';

import { useEffect, useRef, useState } from 'react';

interface WheelCanvasProps {
    isSpinning: boolean;
    onSpinComplete: () => void;
    targetAmount: number;
}

interface Segment {
    amount: number;
    color: string;
    percentage: number;
    label: string;
    gradient: string[];
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

// Premium Tết color scheme with gradients
const segments: Segment[] = [
    {
        amount: 500000,
        color: '#FFD700',
        gradient: ['#FFD700', '#FFA500'],
        percentage: 38,
        label: '500K'
    },
    {
        amount: 200000,
        color: '#DC143C',
        gradient: ['#DC143C', '#8B0000'],
        percentage: 20,
        label: '200K'
    },
    {
        amount: 100000,
        color: '#FF6347',
        gradient: ['#FF6347', '#FF4500'],
        percentage: 15,
        label: '100K'
    },
    {
        amount: 30000,
        color: '#FFD700',
        gradient: ['#FFD700', '#DAA520'],
        percentage: 10,
        label: '30K'
    },
    {
        amount: 20000,
        color: '#B22222',
        gradient: ['#B22222', '#8B0000'],
        percentage: 10,
        label: '20K'
    },
    {
        amount: 1000,
        color: '#FF8C00',
        gradient: ['#FF8C00', '#FF6347'],
        percentage: 7,
        label: '1K'
    },
];

export default function WheelCanvas({ isSpinning, onSpinComplete, targetAmount }: WheelCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particleCanvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);
    const [showFlash, setShowFlash] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const animationRef = useRef<number | undefined>(undefined);
    const particleAnimationRef = useRef<number | undefined>(undefined);
    const lastTickSegmentRef = useRef(-1);
    const isReversingRef = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Resume AudioContext on user interaction
    const resumeAudio = async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
    };

    // Generate tick sound using Web Audio API
    const playTick = (isReverse = false) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        if (ctx.state !== 'running') return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Tick sound parameters
        oscillator.frequency.value = isReverse ? 800 : 1200; // Lower pitch when reversing
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    };

    // Check and play tick when crossing segments
    const playTickIfNeeded = (currentRotation: number) => {
        const normalized = ((currentRotation % 360) + 360) % 360;
        let acc = 0;

        for (let i = 0; i < segments.length; i++) {
            const angle = (segments[i].percentage / 100) * 360;
            acc += angle;
            if (normalized < acc) {
                if (i !== lastTickSegmentRef.current) {
                    playTick(isReversingRef.current);
                    lastTickSegmentRef.current = i;
                }
                break;
            }
        }
    };

    useEffect(() => {
        drawWheel(rotation);
    }, [rotation]);

    useEffect(() => {
        if (isSpinning) {
            resumeAudio().then(() => {
                startSpinAnimation();
                createParticles();
            });
        }
    }, [isSpinning]);

    useEffect(() => {
        if (particles.length > 0) {
            animateParticles();
        }
    }, [particles]);

    // Cleanup audio context on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const createParticles = () => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < 50; i++) {
            newParticles.push({
                x: 200 + Math.random() * 100 - 50,
                y: 200 + Math.random() * 100 - 50,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: ['#FFD700', '#FF6347', '#DC143C', '#FFA500'][Math.floor(Math.random() * 4)],
                size: Math.random() * 6 + 2
            });
        }
        setParticles(newParticles);
    };

    const animateParticles = () => {
        const canvas = particleCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        setParticles(prevParticles => {
            const updated = prevParticles
                .map(p => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy,
                    vy: p.vy + 0.2,
                    life: p.life - 0.02
                }))
                .filter(p => p.life > 0);

            updated.forEach(p => {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            if (updated.length > 0) {
                particleAnimationRef.current = requestAnimationFrame(animateParticles);
            }

            return updated;
        });
    };

    const drawWheel = (currentRotation: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Clear with transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw outer golden ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
        const outerGradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + 15);
        outerGradient.addColorStop(0, '#FFD700');
        outerGradient.addColorStop(0.5, '#FFA500');
        outerGradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = outerGradient;
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw decorative dots on outer ring
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const dotX = centerX + Math.cos(angle) * (radius + 10);
            const dotY = centerY + Math.sin(angle) * (radius + 10);
            ctx.beginPath();
            ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#8B0000';
            ctx.fill();
        }

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((currentRotation * Math.PI) / 180);

        let currentAngle = 0;

        segments.forEach((segment, index) => {
            const sliceAngle = (segment.percentage / 100) * 2 * Math.PI;

            // Draw segment with gradient
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            gradient.addColorStop(0, segment.gradient[0]);
            gradient.addColorStop(1, segment.gradient[1]);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Golden border
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Inner decorative line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text with shadow
            ctx.save();
            ctx.rotate(currentAngle + sliceAngle / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Text shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // Main text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 28px "Arial Black", Arial, sans-serif';
            ctx.fillText(segment.label, radius * 0.65, 0);

            // Golden outline
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeText(segment.label, radius * 0.65, 0);

            ctx.restore();

            // Draw lucky symbols
            ctx.save();
            ctx.rotate(currentAngle + sliceAngle / 2);
            ctx.font = '20px Arial';
            ctx.fillText('🧧', radius * 0.35, 0);
            ctx.restore();

            currentAngle += sliceAngle;
        });

        ctx.restore();

        // Draw center ornament
        const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
        centerGradient.addColorStop(0, '#FFD700');
        centerGradient.addColorStop(0.5, '#FFA500');
        centerGradient.addColorStop(1, '#FF8C00');

        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = centerGradient;
        ctx.fill();
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Center symbol
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#8B0000';
        ctx.fillText('', centerX, centerY);

        // Draw premium pointer at right side
        ctx.save();
        ctx.translate(canvas.width - 36, centerY);
        ctx.rotate(-Math.PI / 2); // Rotate 90 degrees counter-clockwise

        // Pointer shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-25, 25);
        ctx.lineTo(0, 15);
        ctx.lineTo(25, 25);
        ctx.closePath();

        const pointerGradient = ctx.createLinearGradient(-25, -15, 25, 25);
        pointerGradient.addColorStop(0, '#FFD700');
        pointerGradient.addColorStop(0.5, '#FFA500');
        pointerGradient.addColorStop(1, '#FF6347');
        ctx.fillStyle = pointerGradient;
        ctx.fill();

        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
    };

    // ========================================
    // LAYER 1: OUTCOME (Deterministic)
    // ========================================
    const resolveOutcome = () => {
        let targetAngle = 0;
        let accumulatedAngle = 0;

        for (let i = 0; i < segments.length; i++) {
            const sliceAngle = (segments[i].percentage / 100) * 360;
            if (segments[i].amount === 1000) {
                targetAngle = accumulatedAngle + sliceAngle / 2;
                break;
            }
            accumulatedAngle += sliceAngle;
        }

        return { amount: 1000, targetAngle };
    };

    // Helper: Get center angle of any segment
    const getSegmentCenterAngle = (amount: number) => {
        let targetAngle = 0;
        let accumulatedAngle = 0;
        let sliceWidth = 0;

        for (let i = 0; i < segments.length; i++) {
            const sliceAngle = (segments[i].percentage / 100) * 360;
            if (segments[i].amount === amount) {
                targetAngle = accumulatedAngle + sliceAngle / 2;
                sliceWidth = sliceAngle;
                break;
            }
            accumulatedAngle += sliceAngle;
        }

        return { angle: targetAngle, width: sliceWidth };
    };

    // Helper: Pick a random big money segment for bait
    const pickBaitSegment = () => {
        const baitSegments = segments.filter(s => s.amount >= 100000);
        return baitSegments[Math.floor(Math.random() * baitSegments.length)];
    };

    // ========================================
    // LAYER 2: STRATEGIES (Chaos Variants)
    // ========================================

    // Strategy 1: Fake Jackpot Panic
    const buildFakeJackpotPhases = (startRot: number, finalTarget: number) => {
        const bait = pickBaitSegment();
        const baitInfo = getSegmentCenterAngle(bait.amount);
        const normalizedStart = ((startRot % 360) + 360) % 360;
        const deltaToTarget = (360 - (baitInfo.angle - 0) - normalizedStart) % 360;
        const fullSpins = 6 + Math.floor(Math.random() * 4); // 6-9 spins
        const baitTarget = startRot + fullSpins * 360 + deltaToTarget;

        return [
            { type: 'spin' as const, from: startRot, to: baitTarget, duration: 4200 + Math.random() * 1200 },
            { type: 'pause' as const, duration: 150 + Math.random() * 150 },
            { type: 'flash' as const, duration: 180 },
            { type: 'reverse' as const, from: baitTarget, to: finalTarget, duration: 700 + Math.random() * 400 },
            { type: 'settle' as const, from: finalTarget - 6, to: finalTarget, duration: 350 }
        ];
    };

    // Strategy 2: Cruel Slow Creep
    const buildSlowCreepPhases = (startRot: number, finalTarget: number) => {
        const fullSpins = 7 + Math.floor(Math.random() * 3);
        const overshoot = 25 + Math.random() * 15;

        return [
            { type: 'spin' as const, from: startRot, to: finalTarget + overshoot, duration: 4500 + Math.random() * 800 },
            { type: 'spin' as const, from: finalTarget + overshoot, to: finalTarget + 3, duration: 1600 + Math.random() * 400 },
            { type: 'pause' as const, duration: 300 + Math.random() * 200 },
            { type: 'flash' as const, duration: 120 },
            { type: 'reverse' as const, from: finalTarget + 3, to: finalTarget, duration: 400 },
            { type: 'settle' as const, from: finalTarget - 4, to: finalTarget, duration: 300 }
        ];
    };

    // Strategy 3: Double Betrayal
    const buildDoubleBetrayalPhases = (startRot: number, finalTarget: number) => {
        const bait1Info = getSegmentCenterAngle(500000);
        const bait2Info = getSegmentCenterAngle(200000);

        const normalizedStart = ((startRot % 360) + 360) % 360;
        const deltaToBait1 = (360 - (bait1Info.angle - 0) - normalizedStart) % 360;
        const fullSpins = 7 + Math.floor(Math.random() * 3);
        const bait1Target = startRot + fullSpins * 360 + deltaToBait1;

        const normalizedBait1 = ((bait1Target % 360) + 360) % 360;
        const deltaToBait2 = (360 - (bait2Info.angle - 0) - normalizedBait1) % 360;
        const bait2Target = bait1Target + deltaToBait2;

        return [
            { type: 'spin' as const, from: startRot, to: bait1Target, duration: 4000 + Math.random() * 1000 },
            { type: 'pause' as const, duration: 120 + Math.random() * 100 },
            { type: 'reverse' as const, from: bait1Target, to: bait2Target, duration: 600 + Math.random() * 300 },
            { type: 'pause' as const, duration: 100 + Math.random() * 100 },
            { type: 'flash' as const, duration: 150 },
            { type: 'reverse' as const, from: bait2Target, to: finalTarget, duration: 800 + Math.random() * 400 },
            { type: 'settle' as const, from: finalTarget - 5, to: finalTarget, duration: 350 }
        ];
    };

    // Strategy selector
    const chooseStrategy = () => {
        const strategies = [
            buildFakeJackpotPhases,
            buildSlowCreepPhases,
            buildDoubleBetrayalPhases
        ];
        return strategies[Math.floor(Math.random() * strategies.length)];
    };

    // ========================================
    // LAYER 3: ENGINE (Phase Execution)
    // ========================================
    const startSpinAnimation = () => {
        const startRotation = rotation;
        const outcome = resolveOutcome();

        // Calculate final target with normalization
        const POINTER_ANGLE = 0;
        const normalizedStart = ((startRotation % 360) + 360) % 360;
        const deltaToTarget = (360 - (outcome.targetAngle - POINTER_ANGLE) - normalizedStart) % 360;
        const fullSpins = 8;
        const finalTarget = startRotation + fullSpins * 360 + deltaToTarget;

        // Pick a random strategy
        const strategy = chooseStrategy();
        const phases = strategy(startRotation, finalTarget);

        // Execute phases sequentially
        const executePhases = async (phaseList: typeof phases, index = 0) => {
            if (index >= phaseList.length) {
                // All phases complete
                setTimeout(() => {
                    onSpinComplete();
                }, 400);
                return;
            }

            const phase = phaseList[index];

            switch (phase.type) {
                case 'spin':
                case 'reverse':
                case 'settle':
                    animatePhase(
                        phase.from,
                        phase.to,
                        phase.duration,
                        phase.type === 'reverse' ? (t) => t : (t) => 1 - Math.pow(1 - t, 3),
                        () => executePhases(phaseList, index + 1)
                    );
                    break;

                case 'pause':
                    setTimeout(() => executePhases(phaseList, index + 1), phase.duration);
                    break;

                case 'flash':
                    setShowFlash(true);
                    setTimeout(() => {
                        setShowFlash(false);
                        executePhases(phaseList, index + 1);
                    }, phase.duration);
                    break;
            }
        };

        // Helper function to animate a phase
        const animatePhase = (
            from: number,
            to: number,
            duration: number,
            easing: (t: number) => number,
            onDone?: () => void
        ) => {
            const start = Date.now();
            const isReversing = to < from;
            isReversingRef.current = isReversing;

            const tick = () => {
                const elapsed = Date.now() - start;
                const t = Math.min(elapsed / duration, 1);
                const eased = easing(t);
                const currentRotation = from + (to - from) * eased;
                setRotation(currentRotation);
                playTickIfNeeded(currentRotation);

                if (t < 1) {
                    animationRef.current = requestAnimationFrame(tick);
                } else {
                    isReversingRef.current = false;
                    onDone?.();
                }
            };

            animationRef.current = requestAnimationFrame(tick);
        };

        // Start execution
        executePhases(phases);
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 animate-golden-glow rounded-full"></div>
            <canvas
                ref={canvasRef}
                width={450}
                height={450}
                className="mx-auto relative z-10 drop-shadow-2xl"
            />
            <canvas
                ref={particleCanvasRef}
                width={450}
                height={450}
                className="absolute top-0 left-0 right-0 mx-auto pointer-events-none z-20"
            />
            {showFlash && (
                <div className="absolute inset-0 bg-gradient-radial from-yellow-300 via-orange-400 to-transparent animate-flash pointer-events-none z-30 rounded-full" />
            )}
            {isSpinning && (
                <div className="absolute -inset-4 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 opacity-20 blur-xl animate-pulse rounded-full"></div>
            )}
        </div>
    );
}
