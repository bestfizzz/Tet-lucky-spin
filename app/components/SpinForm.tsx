'use client';

import { useState, useEffect } from 'react';
import { collectFingerprint } from '@/lib/fingerprint';
import { spin, SpinResult } from '@/app/actions/spin';

interface SpinFormProps {
    mode: 'real' | 'local';
    onSpinStart: () => void;
    onSpinResult: (result: SpinResult & { spinCount?: number; inputName?: string }) => void;
    existingSpin?: { name: string; amount: number } | null;
    isSpinning: boolean;
    uiaUrl: string | null;
}

export default function SpinForm({ mode, onSpinStart, onSpinResult, existingSpin, isSpinning, uiaUrl }: SpinFormProps) {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [spinCount, setSpinCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (mode === 'real' && existingSpin) {
            setHasSpun(true);
        } else if (mode === 'local') {
            // Load spin count from localStorage
            const history = localStorage.getItem('lucky_spin_history');
            if (history) {
                try {
                    const spins = JSON.parse(history);
                    setSpinCount(spins.length);
                } catch (e) {
                    setSpinCount(0);
                }
            }
        }
    }, [mode, existingSpin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!name.trim()) {
            setErrorMessage('Vui lòng nhập tên của bạn');
            return;
        }

        setIsLoading(true);
        onSpinStart();

        try {
            if (mode === 'real') {
                // Extract token from cached UIA image right now
                if (!uiaUrl) {
                    setErrorMessage('Xác thực thất bại. Vui lòng tải lại trang.');
                    setIsLoading(false);
                    return;
                }

                // Re-fetch the cached image and read the hidden token
                const response = await fetch(uiaUrl);
                if (!response.ok) {
                    setErrorMessage('Xác thực thất bại. Vui lòng tải lại trang.');
                    setIsLoading(false);
                    return;
                }
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                const tail64 = new TextDecoder('iso-8859-1').decode(bytes.slice(-64));
                const tailShort = new TextDecoder('iso-8859-1').decode(bytes.slice(-15));

                // Use the valid 64-char hex token, or fall back to whatever the server embedded
                let sessionToken = /^[a-f0-9]{64}$/.test(tail64) ? tail64 : tailShort;

                console.log('[SpinForm] Extracted token from UIA:', sessionToken);

                const fingerprint = await collectFingerprint();
                console.log('[SpinForm] Sending spin with token:', sessionToken);
                const result = await spin(name, fingerprint, sessionToken);

                if (result.success || result.alreadySpun) {
                    setHasSpun(true);
                    onSpinResult({ ...result, inputName: name });
                } else {
                    setErrorMessage(result.message);
                }
                // Stop local loading, animation state is managed by parent's isSpinning
                setIsLoading(false);
            } else {
                // Local mode: skip Server Action
                const history = localStorage.getItem('lucky_spin_history');
                const spins = history ? JSON.parse(history) : [];

                const newSpin = {
                    name,
                    amount: 1000,
                    timestamp: Date.now(),
                };

                spins.push(newSpin);
                localStorage.setItem('lucky_spin_history', JSON.stringify(spins));

                // Dispatch event for RecentRolls
                window.dispatchEvent(new CustomEvent('newSpin', {
                    detail: { name, amount: 1000 }
                }));

                setSpinCount(spins.length);

                // Simulate spin result delay
                setTimeout(() => {
                    onSpinResult({
                        success: true,
                        amount: 1000,
                        message: 'Chúc mừng!',
                        spinCount: spins.length,
                    });
                    setIsLoading(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Spin error:', error);
            setErrorMessage('Đã có lỗi xảy ra. Vui lòng thử lại.');
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        if (mode === 'local') {
            localStorage.removeItem('lucky_spin_history');
            setSpinCount(0);
            setHasSpun(false);
            setName('');
        }
    };

    const isInputDisabled = isLoading || isSpinning || (mode === 'real' && hasSpun);
    const isButtonDisabled = isLoading || isSpinning || (mode === 'real' && hasSpun);

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-lg font-semibold text-white mb-2">
                        Nhập tên của bạn:
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isInputDisabled}
                        className="w-full px-4 py-3 rounded-lg border-2 border-yellow-400 bg-white/90 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Tên của bạn..."
                        maxLength={100}
                    />
                </div>

                {errorMessage && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg">
                        {errorMessage}
                    </div>
                )}

                {mode === 'real' && hasSpun && existingSpin && !isSpinning && (
                    <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-100 px-4 py-2 rounded-lg">
                        Bạn đã quay rồi! Kết quả: {existingSpin.amount.toLocaleString('vi-VN')}đ
                    </div>
                )}

                {mode === 'local' && spinCount > 0 && !isSpinning && !isLoading && (
                    <div className="bg-blue-500/20 border border-blue-400 text-blue-100 px-4 py-2 rounded-lg flex justify-between items-center">
                        <span>Số lần quay: {spinCount}</span>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-sm underline hover:no-underline"
                        >
                            Reset
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isButtonDisabled}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading || isSpinning ? 'Đang quay...' : (mode === 'real' && hasSpun) ? 'Đã quay rồi' : 'QUAY NGAY! 🎰'}
                </button>
            </form>
        </div>
    );
}
