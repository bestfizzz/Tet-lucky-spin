import { cookies } from 'next/headers';

const COOKIE_NAME = 'lucky_spin_fp';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export async function setFingerprintCookie(hash: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, hash, {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function getFingerprintCookie(): Promise<string | undefined> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    return cookie?.value;
}
