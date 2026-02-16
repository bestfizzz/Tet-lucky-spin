'use client';

import { useEffect, useState, useRef } from 'react';
import ModeToggle from './ModeToggle';
import WheelCanvas from './WheelCanvas';
import ResultModal from './ResultModal';
import RecentRolls from './RecentRolls';
import { SpinResult } from '@/app/actions/spin';
import { collectFingerprint } from '@/lib/fingerprint';
import { encodeFingerprint } from '@/lib/fingerprint-hash';

interface PageContentProps {
    existingSpin?: { name: string; amount: number } | null;
}

export default function PageContent({ existingSpin }: PageContentProps) {
    const [currentMode, setCurrentMode] = useState<'real' | 'local'>('real');
    const [isSpinning, setIsSpinning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<(SpinResult & { spinCount?: number; inputName?: string }) | null>(null);
    const [uiaUrl, setUiaUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Autoplay background music
    useEffect(() => {
        const audio = new Audio('/Thần Tài Đến.mp3');
        audio.volume = 0.3;
        audioRef.current = audio;

        // Try autoplay logic
        const tryPlay = async () => {
            try {
                await audio.play();
            } catch (err) {
                // Autoplay blocked — wait for first interaction
                const resumeOnInteraction = async () => {
                    try {
                        await audio.play();
                        document.removeEventListener('click', resumeOnInteraction);
                        document.removeEventListener('touchstart', resumeOnInteraction);
                    } catch (e) {
                        // Still failing, ignore to avoid console noise
                    }
                };
                document.addEventListener('click', resumeOnInteraction);
                document.addEventListener('touchstart', resumeOnInteraction);
            }
        };

        tryPlay();

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    // Register Service Worker + cache UIA image
    useEffect(() => {
        const init = async () => {
            // Register SW first
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register('/sw.js');
                    console.log('[SW] Registered');
                } catch (err) {
                    console.error('[SW] Registration error:', err);
                }
            }

            // Then fetch UIA (SW will cache it)
            try {
                const fingerprint = await collectFingerprint();
                const encoded = encodeFingerprint(fingerprint);
                const url = `/api/getUIA?asset=${encoded}`;

                await fetch(url);
                setUiaUrl(url);
            } catch (e) {
                console.error('UIA cache error:', e);
            }
        };

        init();
    }, []);

    // Sync result with modal visibility
    useEffect(() => {
        if (!isSpinning && result && !showResult) {
            setShowResult(true);
        }
    }, [isSpinning, result, showResult]);

    const handleModeChange = (mode: 'real' | 'local') => {
        setCurrentMode(mode);
        setIsSpinning(false);
        setShowResult(false);
        setResult(null);
    };

    const handleSpinStart = () => {
        setIsSpinning(true);
        setShowResult(false);
        // Ensure audio is playing after user interaction
        audioRef.current?.play().catch(() => { });
    };

    const handleSpinComplete = () => {
        setIsSpinning(false);
        if (result) {
            setShowResult(true);
        }
    };

    const handleSpinResult = (spinResult: SpinResult & { spinCount?: number }) => {
        setResult(spinResult);
    };

    const handleCloseModal = () => {
        setShowResult(false);
        setResult(null);
    };

    return (
        <div
            className="min-h-screen relative overflow-hidden tet-pattern"
            style={{
                backgroundImage: 'url(/TraoNiemTinNhanTaiLoc.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Floating decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Floating lanterns */}
                {[...Array(5)].map((_, i) => (
                    <div
                        key={`lantern-${i}`}
                        className="absolute text-6xl animate-float-lantern"
                        style={{
                            left: `${20 + i * 20}%`,
                            animationDelay: `${i * 3}s`,
                            animationDuration: `${15 + i * 2}s`
                        }}
                    >
                        🏮
                    </div>
                ))}

                {/* Floating coins */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={`coin-${i}`}
                        className="absolute text-4xl animate-coin-rain"
                        style={{
                            left: `${10 + i * 12}%`,
                            animationDelay: `${i * 1.5}s`,
                            animationDuration: `${4 + (i % 3)}s`
                        }}
                    >
                        🪙
                    </div>
                ))}

                {/* Cherry blossoms */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={`blossom-${i}`}
                        className="absolute text-3xl animate-float-lantern"
                        style={{
                            left: `${15 + i * 15}%`,
                            animationDelay: `${i * 2.5}s`,
                            animationDuration: `${12 + i * 1.5}s`,
                            opacity: 0.7
                        }}
                    >
                        🌸
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto relative z-10 py-8 px-4">
                {/* Header with premium design */}
                <div className="text-center mb-6 md:mb-8 relative">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-500 to-yellow-300 drop-shadow-2xl mb-2 md:mb-3 animate-shimmer">
                        VÒNG QUAY MAY MẮN
                    </h1>
                    <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <span className="text-3xl md:text-5xl animate-pulse">🧧</span>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 drop-shadow-lg animate-pulse-glow">
                            TẾT 2026
                        </p>
                        <span className="text-3xl md:text-5xl animate-pulse">🧧</span>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl text-yellow-200 font-semibold drop-shadow-md px-4">
                        🎊 Chúc Mừng Năm Mới - Phát Tài Phát Lộc 🎊
                    </p>
                </div>

                {/* Mode Toggle with integrated form */}
                <div className="mb-8">
                    <ModeToggle
                        currentMode={currentMode}
                        onModeChange={handleModeChange}
                        onSpinStart={handleSpinStart}
                        onSpinResult={handleSpinResult}
                        existingSpin={existingSpin}
                        isSpinning={isSpinning}
                        uiaUrl={uiaUrl}
                    />
                </div>

                {/* Main Content - Just the Wheel */}
                <div className="flex flex-col gap-8 items-center mb-8">
                    {/* Wheel Only */}
                    <div className="relative w-full max-w-2xl">
                        <div className="flex justify-center items-center">
                            <WheelCanvas
                                isSpinning={isSpinning}
                                onSpinComplete={handleSpinComplete}
                                targetAmount={1000}
                            />
                        </div>

                        {isSpinning && (
                            <div className="text-center mt-4 md:mt-6">
                                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-300 animate-pulse drop-shadow-lg px-4">
                                    🎲 Đang Quay... Chúc Bạn May Mắn! 🎲
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Rolls */}
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 rounded-3xl blur-xl opacity-30"></div>
                    <div className="relative">
                        <RecentRolls mode={currentMode} />
                    </div>
                </div>

                {/* Result Modal */}
                {result && (
                    <ResultModal
                        isOpen={showResult}
                        amount={result.amount || 1000}
                        name={result.name || result.inputName || 'Bạn'}
                        onClose={handleCloseModal}
                        mode={currentMode}
                        spinCount={result.spinCount}
                        alreadySpun={result.alreadySpun}
                        message={result.message}
                    />
                )}
            </div>

            {/* Bottom decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-900/50 to-transparent pointer-events-none"></div>
        </div>
    );
}
