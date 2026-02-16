import { sha256 } from 'js-sha256';
import { RawFingerprint } from './fingerprint';

// Use a public secret for obfuscation (can be overridden by env)
const PUBLIC_SECRET = process.env.NEXT_PUBLIC_SECRET || 'lucky-spin-uytin-2026';
const SERVER_SECRET = process.env.SERVER_SECRET || 'top-secret-spin-key';
/**
 * Custom obfuscation for query parameters (not simple URI encoding)
 */
export function obfuscateQuery(data: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ PUBLIC_SECRET.charCodeAt(i % PUBLIC_SECRET.length));
    }
    return btoa(unescape(encodeURIComponent(result))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function deobfuscateQuery(encoded: string): string {
    try {
        // Handle URL safe base64
        const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = decodeURIComponent(escape(atob(base64)));
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ PUBLIC_SECRET.charCodeAt(i % PUBLIC_SECRET.length));
        }
        return result;
    } catch (e) {
        return '';
    }
}

/**
 * Encodes fingerprint data for the getUIA request
 */
export function encodeFingerprint(fingerprint: RawFingerprint): string {
    const data = JSON.stringify({
        ua: fingerprint.userAgent,
        pt: fingerprint.platform,
        lg: fingerprint.language,
        tz: fingerprint.timeZone,
        sw: fingerprint.screenWidth,
        sh: fingerprint.screenHeight,
        cd: fingerprint.colorDepth,
        hc: fingerprint.hardwareConcurrency,
        dm: fingerprint.deviceMemory,
        mt: fingerprint.maxTouchPoints,
        cf: fingerprint.canvasFingerprint,
    });

    // Simple XOR-like obfuscation + Base64
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ PUBLIC_SECRET.charCodeAt(i % PUBLIC_SECRET.length));
    }
    return btoa(unescape(encodeURIComponent(result))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Decodes fingerprint data from the getUIA request
 */
export function decodeFingerprint(encoded: string): any {
    try {
        // Reverse URL-safe base64
        const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = decodeURIComponent(escape(atob(base64)));
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ PUBLIC_SECRET.charCodeAt(i % PUBLIC_SECRET.length));
        }
        return JSON.parse(result);
    } catch (e) {
        return null;
    }
}


const COMMON_SCREEN_WIDTHS = [
    320, 360, 375, 384, 390, 412, 414, 428, 430, // Phones
    600, 768, 800, 810, 820, 834, 1024, // Tablets
    1280, 1366, 1440, 1536, 1600, 1920, 2560, 3440, 3840 // Desktop
];

export interface ValidationResult {
    isValid: boolean;
    reason?: string;
    isTroll?: boolean;
}

export function validateFingerprint(rawFingerprint: RawFingerprint): ValidationResult {
    const {
        screenWidth, screenHeight, userAgent, canvasFingerprint,
        platform, deviceMemory, hardwareConcurrency
    } = rawFingerprint;

    // 1. Basic length checks
    if (userAgent.length < 20) return { isValid: false, reason: 'Trình duyệt gì mà lạ thế? 🤨', isTroll: true };
    if (!canvasFingerprint || canvasFingerprint.length < 10) return { isValid: false, reason: 'Máy tính hay là cục gạch vậy? 🧱', isTroll: true };

    // 2. Screen Dimension Sanity
    // No one uses a screen smaller than 300px or weird odd numbers for standard screens
    if (screenWidth < 300 || screenHeight < 300) {
        return { isValid: false, reason: 'Màn hình tí hon vậy, xem kiểu gì? 🔍', isTroll: true };
    }

    // Check Aspect Ratio (extremely long or wide screens are suspicious)
    const ratio = screenWidth / screenHeight;
    if (ratio < 0.4 || ratio > 3.0) {
        return { isValid: false, reason: 'Màn hình dài như quảng cáo vậy? 🤥', isTroll: true };
    }

    // Check for absolute garbage values
    if (screenWidth > 8000 || screenHeight > 8000) {
        return { isValid: false, reason: 'Màn hình nhà bạn to nhất thế giới à? 🌌', isTroll: true };
    }

    // 3. Logic checks
    // If it's a mobile platform but screen is huge, or vice-versa
    const isMobile = /iPhone|Android|iPad/i.test(userAgent);
    if (isMobile && screenWidth > 1200) {
        return { isValid: false, reason: 'Điện thoại gì to như cái TV vậy? 📺', isTroll: true };
    }

    return { isValid: true };
}

export function generateFingerprintHash(rawFingerprint: RawFingerprint): string {
    const validation = validateFingerprint(rawFingerprint);
    if (!validation.isValid) {
        throw new Error(validation.reason || 'Invalid fingerprint');
    }

    // 1. Coarsen User Agent to ignore browser version/name differences
    // Extract the system part (usually inside first parentheses)
    const ua = rawFingerprint.userAgent;
    const systemMatch = ua.match(/\(([^)]+)\)/);
    let systemInfo = systemMatch ? systemMatch[1] : ua;

    // Further normalize systemInfo: remove specific build numbers or minor versions
    // Example: "iPhone; CPU iPhone OS 15_4_1" -> "iPhone; CPU iPhone OS 15.4"
    // Example: "Android 11; SM-G960F" -> keep
    systemInfo = systemInfo.replace(/[\d._]{3,}/g, (match) => {
        const parts = match.split(/[._]/);
        if (parts.length > 2) {
            return parts.slice(0, 2).join('.');
        }
        return match;
    });

    // 2. Normalize Screen Dimensions (Orientation agnostic)
    const sw = rawFingerprint.screenWidth;
    const sh = rawFingerprint.screenHeight;
    const resolution = `${Math.min(sw, sh)}x${Math.max(sw, sh)}`;

    // 3. Create canonical normalized object
    const normalized = {
        systemInfo: systemInfo.trim(),
        platform: rawFingerprint.platform.trim().toLowerCase(),
        language: rawFingerprint.language.trim().toLowerCase(),
        timeZone: rawFingerprint.timeZone.trim(),
        resolution,
        colorDepth: rawFingerprint.colorDepth,
        hardwareConcurrency: rawFingerprint.hardwareConcurrency || 0,
        deviceMemory: rawFingerprint.deviceMemory || 0,
        maxTouchPoints: rawFingerprint.maxTouchPoints,
        // Canvas is kept but it's the most "browser-sensitive" part.
        // On iOS all browsers use WebKit, so this is stable cross-browser.
        // On Android, most use Blink, so it's also quite stable.
        canvasFingerprint: rawFingerprint.canvasFingerprint,
    };

    // Create canonical string representation
    const canonicalString = JSON.stringify(normalized, Object.keys(normalized).sort());

    // Generate SHA-256 hash using the canonical string + server secret
    return sha256(canonicalString + SERVER_SECRET);
}
