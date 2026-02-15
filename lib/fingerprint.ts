export interface RawFingerprint {
    userAgent: string;
    platform: string;
    language: string;
    timeZone: string;
    screenWidth: number;
    screenHeight: number;
    colorDepth: number;
    hardwareConcurrency?: number;
    deviceMemory?: number;
    maxTouchPoints: number;
    canvasFingerprint: string;
}

function generateCanvasFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-canvas';

        canvas.width = 200;
        canvas.height = 50;

        // Draw text with specific styling
        ctx.textBaseline = 'top';
        ctx.font = '14px "Arial"';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Lucky Spin 🎰', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Lucky Spin 🎰', 4, 17);

        return canvas.toDataURL();
    } catch (error) {
        return 'canvas-error';
    }
}

export async function collectFingerprint(): Promise<RawFingerprint> {
    const nav = navigator as any;

    return {
        userAgent: nav.userAgent || '',
        platform: nav.platform || '',
        language: nav.language || '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        screenWidth: screen.width || 0,
        screenHeight: screen.height || 0,
        colorDepth: screen.colorDepth || 0,
        hardwareConcurrency: nav.hardwareConcurrency,
        deviceMemory: nav.deviceMemory,
        maxTouchPoints: nav.maxTouchPoints || 0,
        canvasFingerprint: generateCanvasFingerprint(),
    };
}
