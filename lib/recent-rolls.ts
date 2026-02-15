export interface RollEntry {
    id: string;
    name: string;
    amount: number;
    timestamp: number;
}

export function generateRandomAmount(): number {
    // Generate random amount between 100k-500k
    const amounts = [100000, 200000, 300000, 400000, 500000];
    return amounts[Math.floor(Math.random() * amounts.length)];
}

export function formatRollDisplay(name: string, amount: number): string {
    const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount);
    return `${name} - ${formattedAmount}đ`;
}

export function createRollEntry(name: string, amount: number): RollEntry {
    return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        amount,
        timestamp: Date.now(),
    };
}
