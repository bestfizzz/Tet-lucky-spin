'use client';

import SpinForm from './SpinForm';
import { SpinResult } from '@/app/actions/spin';

interface ModeToggleProps {
    currentMode: 'real' | 'local';
    onModeChange: (mode: 'real' | 'local') => void;
    onSpinStart: () => void;
    onSpinResult: (result: SpinResult & { spinCount?: number; inputName?: string }) => void;
    existingSpin?: { name: string; amount: number } | null;
    isSpinning: boolean;
    uiaUrl: string | null;
}

export default function ModeToggle({ currentMode, onModeChange, onSpinStart, onSpinResult, existingSpin, isSpinning, uiaUrl }: ModeToggleProps) {
    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => onModeChange('real')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${currentMode === 'real'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105'
                            : 'bg-white/20 text-white/70 hover:bg-white/30'
                            }`}
                    >
                        🔒 Online
                    </button>
                    <button
                        onClick={() => onModeChange('local')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${currentMode === 'local'
                            ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg scale-105'
                            : 'bg-white/20 text-white/70 hover:bg-white/30'
                            }`}
                    >
                        🎮 Local Mode
                    </button>
                </div>

                <div className="text-center mb-4">
                    {currentMode === 'real' ? (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 space-y-1">
                            <p className="text-sm text-yellow-200">✨ Mỗi người chỉ được quay <strong>1 lần</strong></p>
                            <p className="text-sm text-white/70">🎯 Vui lòng liên hệ chủ website để đòi tiền</p>
                            <p className="text-sm text-yellow-300 font-bold mt-1">⚠️ Đặt tên cho chuẩn, admin mà không nhận ra thì có cái nịt</p>
                        </div>
                    ) : (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3">
                            <p className="text-sm text-blue-200">🎯 Quay không giới hạn để test (chỉ lưu trên trình duyệt)</p>
                        </div>
                    )}
                </div>

                {/* Integrated Spin Form */}
                <SpinForm
                    mode={currentMode}
                    onSpinStart={onSpinStart}
                    onSpinResult={onSpinResult}
                    existingSpin={currentMode === 'real' ? existingSpin : null}
                    isSpinning={isSpinning}
                    uiaUrl={uiaUrl}
                />
            </div>
        </div>
    );
}
