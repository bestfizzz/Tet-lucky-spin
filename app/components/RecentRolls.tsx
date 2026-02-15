'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getFirestoreClient } from '@/lib/firebase-client';
import { generateRandomAmount, formatRollDisplay, createRollEntry, RollEntry } from '@/lib/recent-rolls';

interface RecentRollsProps {
    mode: 'real' | 'local';
}

export default function RecentRolls({ mode }: RecentRollsProps) {
    const [rolls, setRolls] = useState<RollEntry[]>([]);

    useEffect(() => {
        if (mode === 'real') {
            // Subscribe to Firestore for real mode
            try {
                const db = getFirestoreClient();
                const spinsQuery = query(
                    collection(db, 'spins'),
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );

                const unsubscribe = onSnapshot(spinsQuery, (snapshot) => {
                    const newRolls: RollEntry[] = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        // Display random high amount (not actual 1k)
                        const displayAmount = generateRandomAmount();
                        newRolls.push(createRollEntry(data.name, displayAmount));
                    });
                    setRolls(newRolls.slice(0, 20));
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Firestore listener error:', error);
            }
        } else {
            // Local mode: listen to localStorage and custom events
            const loadLocalRolls = () => {
                try {
                    const history = localStorage.getItem('lucky_spin_history');
                    if (history) {
                        const spins = JSON.parse(history);
                        const localRolls = spins.slice(-20).reverse().map((spin: any) => {
                            const displayAmount = generateRandomAmount();
                            return createRollEntry(spin.name, displayAmount);
                        });
                        setRolls(localRolls);
                    }
                } catch (error) {
                    console.error('localStorage error:', error);
                }
            };

            loadLocalRolls();

            // Listen for new spins
            const handleNewSpin = (event: Event) => {
                const customEvent = event as CustomEvent;
                const { name } = customEvent.detail;
                const displayAmount = generateRandomAmount();
                const newRoll = createRollEntry(name, displayAmount);
                setRolls((prev) => [newRoll, ...prev].slice(0, 20));
            };

            window.addEventListener('newSpin', handleNewSpin);
            return () => window.removeEventListener('newSpin', handleNewSpin);
        }
    }, [mode]);

    if (rolls.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h3 className="text-xl font-bold text-white text-center mb-4">
                🎊 Người chơi gần đây
            </h3>
            <div className="waterfall-container bg-gradient-to-b from-white/10 to-transparent rounded-lg border border-white/20 backdrop-blur-sm">
                <div className="waterfall-content">
                    {rolls.map((roll, index) => (
                        <div
                            key={roll.id}
                            className="waterfall-item"
                            style={{
                                animationDelay: `${index * 0.5}s`,
                            }}
                        >
                            {formatRollDisplay(roll.name, roll.amount)}
                        </div>
                    ))}
                </div>
                <div className="waterfall-fade" />
            </div>
        </div>
    );
}
