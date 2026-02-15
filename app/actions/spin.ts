'use server';

import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { generateFingerprintHash } from '@/lib/fingerprint-hash';
import { setFingerprintCookie } from '@/lib/cookies';
import { FieldValue } from 'firebase-admin/firestore';

const SpinInputSchema = z.object({
    name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên quá dài'),
    sessionToken: z.string().optional(),
    fingerprint: z.any().optional(),
});

export interface SpinResult {
    success: boolean;
    alreadySpun?: boolean;
    amount?: number;
    message: string;
    spinID?: string;
    name?: string;
}

export async function spin(name: string, fingerprint?: any, sessionToken?: string): Promise<SpinResult> {
    try {

        // Validate basic input
        const validation = SpinInputSchema.safeParse({ name, fingerprint, sessionToken });
        if (!validation.success) {
            return {
                success: false,
                message: validation.error.issues[0]?.message || 'Dữ liệu không hợp lệ',
            };
        }

        // Security check for missing background data
        if (!fingerprint || !sessionToken) {
            return {
                success: false,
                alreadySpun: true,
                message: 'Bạn tham quá 😏',
                amount: 1000,
                name: name,
                spinID: 'invalid-access',
            };
        }

        // Generate fingerprint hash (this also performs validation)
        let fingerprintHash = '';
        try {
            fingerprintHash = generateFingerprintHash(fingerprint);
            console.log('[spin] Computed hash:', fingerprintHash);
        } catch (e: any) {
            return {
                success: false,
                alreadySpun: true,
                message: 'Bạn tham quá 😏',
                amount: 1000,
                name: name,
                spinID: 'malformed-data',
            };
        }

        // For spin to be legit, sessionToken must match the computed fingerprintHash
        console.log('[spin] Token comparison:', {
            sessionToken: sessionToken,
            computed: fingerprintHash,
            match: sessionToken === fingerprintHash,
        });
        if (sessionToken !== fingerprintHash) {
            // Set cookie using the sessionToken they sent
            await setFingerprintCookie(sessionToken);
            return {
                success: false,
                alreadySpun: true,
                message: 'Bạn tham quá 😏',
                amount: 1000,
                name: name,
                spinID: sessionToken,
            };
        }

        // Check Firestore for existing spin using the fingerprintHash as ID
        const db = getFirestoreAdmin();
        const spinRef = db.collection('spins').doc(fingerprintHash);
        const spinDoc = await spinRef.get();

        if (spinDoc.exists) {
            const existingData = spinDoc.data();

            // Set the cookie back if they deleted it
            await setFingerprintCookie(fingerprintHash);

            // User has already spun
            return {
                success: false,
                alreadySpun: true,
                message: 'Bạn tham quá 😏',
                amount: existingData?.amount || 1000,
                name: existingData?.name || 'Bạn',
                spinID: fingerprintHash,
            };
        }

        // Create new spin document
        await spinRef.set({
            name: name,
            amount: 1000,
            createdAt: FieldValue.serverTimestamp(),
        });

        // Set cookie
        await setFingerprintCookie(fingerprintHash);

        return {
            success: true,
            amount: 1000,
            message: 'Chúc mừng!',
            spinID: fingerprintHash,
        };
    } catch (error: any) {
        console.error('Spin error:', error);
        return {
            success: false,
            message: error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        };
    }
}
