'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';

export interface SpinData {
    name: string;
    amount: number;
}

export async function getSpin(fingerprintHash: string): Promise<SpinData | null> {
    try {
        const db = getFirestoreAdmin();
        const spinRef = db.collection('spins').doc(fingerprintHash);
        const spinDoc = await spinRef.get();

        if (!spinDoc.exists) {
            return null;
        }

        const data = spinDoc.data();
        return {
            name: data?.name || '',
            amount: data?.amount || 0,
        };
    } catch (error) {
        console.error('Get spin error:', error);
        return null;
    }
}
