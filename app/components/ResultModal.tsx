'use client';

import { useEffect, useState } from 'react';

interface ResultModalProps {
    isOpen: boolean;
    amount: number;
    name: string;
    onClose: () => void;
    mode: 'real' | 'local';
    spinCount?: number;
    alreadySpun?: boolean;
    message?: string;
}

export default function ResultModal({ isOpen, amount, name, onClose, mode, spinCount, alreadySpun, message }: ResultModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [showAmount, setShowAmount] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (!alreadySpun) {
                setShowConfetti(true);
                setShowFireworks(true);
            }

            // Delayed amount reveal for suspense
            setTimeout(() => setShowAmount(true), 500);

            if (!alreadySpun) {
                const timer = setTimeout(() => {
                    setShowConfetti(false);
                    setShowFireworks(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        } else {
            setShowAmount(false);
        }
    }, [isOpen, alreadySpun]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Fireworks effect - only for winners */}
            {showFireworks && !alreadySpun && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={`firework-${i}`}
                            className="absolute"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                        >
                            {[...Array(12)].map((_, j) => {
                                const angle = (j / 12) * Math.PI * 2;
                                const distance = 100;
                                return (
                                    <div
                                        key={`particle-${j}`}
                                        className="absolute w-2 h-2 rounded-full firework-particle"
                                        style={{
                                            backgroundColor: ['#FFD700', '#FF6347', '#FFA500', '#DC143C'][Math.floor(Math.random() * 4)],
                                            '--tx': `${Math.cos(angle) * distance}px`,
                                            '--ty': `${Math.sin(angle) * distance}px`,
                                            animationDelay: `${i * 0.2}s`
                                        } as React.CSSProperties}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {/* Golden coin rain - only for winners */}
            {showConfetti && !alreadySpun && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(60)].map((_, i) => (
                        <div
                            key={`coin-${i}`}
                            className="absolute text-2xl md:text-3xl animate-coin-rain"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        >
                            {['🪙', '💰', '🧧', '💎'][Math.floor(Math.random() * 4)]}
                        </div>
                    ))}
                </div>
            )}

            <div className="relative max-w-xl w-full flex items-center justify-center">
                {/* Glowing background effect */}
                <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-75 animate-pulse ${alreadySpun ? 'bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600' : 'bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400'}`}></div>

                <div className={`relative rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-2xl transform animate-bounce-in border-4 md:border-6 w-full ${alreadySpun ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-black border-purple-400' : 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-600 border-yellow-400'}`}>
                    {/* Decorative corners */}
                    <div className="absolute top-1 left-1 md:top-2 md:left-2 text-2xl md:text-3xl animate-pulse-glow">
                        {alreadySpun ? '🤨' : '🏮'}
                    </div>
                    <div className="absolute top-1 right-1 md:top-2 md:right-2 text-2xl md:text-3xl animate-pulse-glow">
                        {alreadySpun ? '🤨' : '🏮'}
                    </div>
                    <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 text-2xl md:text-3xl animate-pulse-glow">
                        {alreadySpun ? '🤡' : '🎊'}
                    </div>
                    <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 text-2xl md:text-3xl animate-pulse-glow">
                        {alreadySpun ? '🤡' : '🎊'}
                    </div>

                    <div className="text-center relative z-10 flex flex-col items-center">
                        {/* Main header */}
                        {alreadySpun ? (
                            <div className="mb-3 animate-glitch font-mono">
                                <div className="inline-block bg-red-600 text-white px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold animate-pulse mb-1">
                                    🚨 SECURITY ALERT 🚨
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] leading-tight">
                                    THAM THÌ THÂM!
                                </h2>
                            </div>
                        ) : (
                            <div className="mb-2 md:mb-3 animate-shake-excitement">
                                <div className="text-4xl md:text-6xl mb-1 md:mb-2 animate-zoom-in-out">
                                    🎉
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-200 drop-shadow-2xl mb-1 animate-shimmer">
                                    CHÚC MỪNG!
                                </h2>
                                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl">
                                    <span className="animate-pulse">🎊</span>
                                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>🎉</span>
                                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>🎊</span>
                                </div>
                            </div>
                        )}

                        {/* Middle Section: Name (Winner) or Dossier (Troll) */}
                        {!alreadySpun ? (
                            <div className="mb-2 md:mb-3">
                                <p className="text-lg md:text-2xl text-yellow-100 font-bold drop-shadow-lg mb-1 break-words px-2">
                                    {name}
                                </p>
                                <p className="text-base md:text-lg text-yellow-200 font-semibold px-2">
                                    🍀 Phúc Lộc Thọ 🍀
                                </p>
                            </div>
                        ) : (
                            <div className="mb-3 w-full font-mono">
                                <div className="flex gap-2 items-stretch">
                                    {/* Small Video Preview */}
                                    <div className="w-1/3 rounded-lg overflow-hidden border border-purple-500/50 relative shadow-lg bg-black">
                                        <div className="absolute top-0.5 left-0.5 z-10 bg-red-600 text-white text-[8px] px-1 rounded animate-pulse">
                                            REC
                                        </div>
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src="https://www.youtube.com/embed/Snv4DIwCP0c?autoplay=1&loop=1&playlist=Snv4DIwCP0c&controls=0&mute=0"
                                            title="Evidence"
                                            frameBorder="0"
                                            allow="autoplay"
                                            className="grayscale aspect-square object-cover"
                                        ></iframe>
                                    </div>
                                    {/* Compact Dossier Info */}
                                    <div className="flex-1 bg-purple-950/40 rounded-lg p-2 border border-purple-500/20 text-left text-[10px] md:text-xs">
                                        <div className="text-purple-300 opacity-60 mb-1 tracking-tighter">ID: {name.toUpperCase().replace(/\s+/g, '_')}</div>
                                        <div className="flex justify-between items-center mb-0.5 text-red-400 font-bold border-b border-purple-500/20 pb-0.5">
                                            <span>STATUS</span>
                                            <span className="animate-pulse">FLAGGED</span>
                                        </div>
                                        <p className="text-purple-200 leading-tight italic opacity-80">
                                            "Phát hiện hành vi quay lại. Hệ thống đã lưu trữ bằng chứng video."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Result Content */}
                        <div className="relative mb-2 font-mono w-full">
                            <div className={`absolute -inset-1 rounded-xl blur-lg animate-pulse ${alreadySpun ? 'bg-gradient-to-r from-purple-400 to-blue-500' : 'bg-gradient-to-r from-yellow-300 to-orange-400'}`}></div>
                            <div className={`relative rounded-lg md:rounded-xl p-2 md:p-3 border-2 md:border-3 shadow-2xl transform transition-all duration-500 ${showAmount ? 'scale-100' : 'scale-0'} ${alreadySpun ? 'bg-gradient-to-br from-purple-900 to-indigo-950 border-purple-400' : 'bg-gradient-to-br from-red-700 to-red-900 border-yellow-400'}`}>
                                {!alreadySpun && (
                                    <div className="text-3xl md:text-4xl mb-1 animate-envelope-open">
                                        🧧
                                    </div>
                                )}
                                <p className={`text-[10px] md:text-xs mb-1 font-bold ${alreadySpun ? 'text-purple-300' : 'text-yellow-200'}`}>
                                    {alreadySpun ? '📂 DATA_RETRIEVED:' : '🧧 BẠN ĐÃ TRÚNG:'}
                                </p>
                                <div className={`rounded-lg p-1.5 md:p-2 mb-1 animate-pulse-glow ${alreadySpun ? 'bg-purple-800/50 border border-purple-400' : 'bg-gradient-to-r from-yellow-400 to-orange-400'}`}>
                                    <p className={`${alreadySpun ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl'} font-black drop-shadow-lg break-all ${alreadySpun ? 'text-white' : 'text-red-900'}`}>
                                        {alreadySpun ? (message || 'Đã quay') : `${amount.toLocaleString('vi-VN')}đ`}
                                    </p>
                                </div>
                                {alreadySpun ? (
                                    <div className="text-[9px] md:text-[10px] text-purple-300/40 uppercase tracking-tighter text-center">
                                        LOOT: {amount.toLocaleString('vi-VN')}đ | NO_RETRIES
                                    </div>
                                ) : (
                                    <p className="text-white/80 text-xs md:text-sm mt-1 italic">
                                        Năm mới phát lộc, vạn sự như ý!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Local mode spin count */}
                        {mode === 'local' && spinCount && !alreadySpun && (
                            <p className="text-yellow-100 text-sm md:text-base mb-2 font-semibold font-mono">
                                🎲 Lần quay #{spinCount} 🎲
                            </p>
                        )}

                        {/* Footer message */}
                        {alreadySpun ? (
                            <p className="text-[10px] md:text-xs text-red-400 font-mono mb-2 tracking-widest animate-pulse">&gt;&gt; ACCESS_DENIED_2026 &lt;&lt;</p>
                        ) : (
                            <div className="mb-3 md:mb-4 px-2 font-mono text-center">
                                <p className="text-lg md:text-2xl font-bold drop-shadow-lg mb-1 text-yellow-100">
                                    {amount >= 100000 ? '🔥 JACKPOT! 🔥' : amount >= 30000 ? '⭐ TRÚNG LỚN! ⭐' : '🎊 MAY MẮN! 🎊'}
                                </p>
                                <p className="text-sm md:text-base text-yellow-200 text-center">
                                    Năm mới phát tài!
                                </p>
                            </div>
                        )}

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="relative group font-mono mt-1"
                        >
                            <div className={`absolute -inset-1 rounded blur opacity-75 group-hover:opacity-100 transition duration-300 ${alreadySpun ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                            <div className={`relative font-black text-xs md:text-base py-1.5 md:py-2 px-6 md:px-8 rounded shadow-lg transform group-hover:scale-105 transition-transform duration-200 ${alreadySpun ? 'bg-black text-red-500 border border-red-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-red-900'}`}>
                                {alreadySpun ? 'ESCAPE_SESSION' : '🎊 ĐÓNG 🎊'}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
