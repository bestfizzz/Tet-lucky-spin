'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';

export interface SpinRecord {
    id: string;
    name: string;
    amount: number;
    createdAt: string;
}

export async function getAllSpins(): Promise<SpinRecord[]> {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection('spins').orderBy('createdAt', 'desc').get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name || '',
            amount: data.amount || 0,
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() || '',
        };
    });
}
