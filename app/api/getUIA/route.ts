import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { decodeFingerprint, generateFingerprintHash } from '@/lib/fingerprint-hash';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const encodedData = searchParams.get('asset');

    const imagePath = path.join(process.cwd(), 'public', 'UIIA.jpg');
    let imageBuffer: Buffer;

    try {
        imageBuffer = await fs.readFile(imagePath);
    } catch (e) {
        return new NextResponse('Asset not found', { status: 404 });
    }

    let tokenToEmbed = 'INVALID_SESSION';

    console.log('[getUIA] Request received, asset param:', encodedData ? `${encodedData.substring(0, 20)}...` : 'MISSING');

    if (encodedData) {
        try {
            const decoded = decodeFingerprint(encodedData);
            console.log('[getUIA] Decoded fingerprint:', decoded ? {
                ua: decoded.ua?.substring(0, 30) + '...',
                platform: decoded.pt,
                screen: `${decoded.sw}x${decoded.sh}`,
                canvas: decoded.cf?.substring(0, 16) + '...',
            } : 'FAILED');

            if (decoded) {
                tokenToEmbed = generateFingerprintHash({
                    userAgent: decoded.ua,
                    platform: decoded.pt,
                    language: decoded.lg,
                    timeZone: decoded.tz,
                    screenWidth: decoded.sw,
                    screenHeight: decoded.sh,
                    colorDepth: decoded.cd,
                    hardwareConcurrency: decoded.hc,
                    deviceMemory: decoded.dm,
                    maxTouchPoints: decoded.mt,
                    canvasFingerprint: decoded.cf,
                } as any);
                console.log('[getUIA] Token generated:', tokenToEmbed);
            }
        } catch (error: any) {
            console.warn('[getUIA] Rejected:', error.message || error);
        }
    }

    console.log('[getUIA] Embedding token:', tokenToEmbed);

    // Append the token directly at the end of the image binary
    const combinedBuffer = Buffer.concat([
        imageBuffer,
        Buffer.from(tokenToEmbed)
    ]);

    return new NextResponse(combinedBuffer, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'no-store',
        },
    });
}
