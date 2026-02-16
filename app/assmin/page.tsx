import { getAllSpins } from '@/app/actions/get-all-spins';
export const dynamic = 'force-dynamic';

export default async function AssminPage() {
    const spins = await getAllSpins();
    const totalAmount = spins.reduce((sum, s) => sum + s.amount, 0);

    return (
        <div className="assmin-page">
            <style>{`
                .assmin-page {
                    min-height: 100vh;
                    background: #0f0f0f;
                    color: #e0e0e0;
                    font-family: monospace;
                    padding: 1rem;
                }
                .assmin-header {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: #fbbf24;
                }
                .assmin-stats {
                    margin-bottom: 1.5rem;
                    color: #888;
                }
                .assmin-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                }
                .assmin-table th {
                    padding: 0.5rem;
                    color: #888;
                    text-align: left;
                    border-bottom: 2px solid #333;
                }
                .assmin-table td {
                    padding: 0.5rem;
                }
                .assmin-table tr:nth-child(even) { background: #141414; }
                .assmin-table tr:nth-child(odd) { background: #0f0f0f; }
                .assmin-table tr { border-bottom: 1px solid #222; }
                .name { color: #fbbf24; }
                .amount { color: #4ade80; }
                .time { color: #888; }
                .num { color: #555; }

                /* Cards layout on mobile */
                @media (max-width: 600px) {
                    .assmin-page { padding: 0.75rem; }
                    .assmin-header { font-size: 1.2rem; }
                    .assmin-table, .assmin-table thead, .assmin-table tbody,
                    .assmin-table th, .assmin-table td, .assmin-table tr {
                        display: block;
                    }
                    .assmin-table thead { display: none; }
                    .assmin-table tr {
                        margin-bottom: 0.75rem;
                        border: 1px solid #333;
                        border-radius: 8px;
                        padding: 0.75rem;
                        background: #141414 !important;
                    }
                    .assmin-table td {
                        padding: 0.25rem 0;
                        display: flex;
                        justify-content: space-between;
                    }
                    .assmin-table td::before {
                        font-weight: bold;
                        color: #666;
                        margin-right: 1rem;
                    }
                    .assmin-table td:nth-child(1)::before { content: '#'; }
                    .assmin-table td:nth-child(2)::before { content: 'Name'; }
                    .assmin-table td:nth-child(3)::before { content: 'Amount'; }
                    .assmin-table td:nth-child(4)::before { content: 'Time'; }
                }
            `}</style>

            <h1 className="assmin-header">🎰 Spin Records</h1>
            <p className="assmin-stats">
                Total: <strong style={{ color: '#fff' }}>{spins.length}</strong> spins
                &nbsp;|&nbsp;
                Sum: <strong style={{ color: '#4ade80' }}>{totalAmount.toLocaleString()}đ</strong>
            </p>

            {spins.length === 0 ? (
                <p style={{ color: '#666' }}>No spins yet.</p>
            ) : (
                <table className="assmin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {spins.map((spin, i) => (
                            <tr key={spin.id}>
                                <td className="num">{i + 1}</td>
                                <td className="name">{spin.name}</td>
                                <td className="amount">{spin.amount.toLocaleString()}đ</td>
                                <td className="time">
                                    {spin.createdAt ? new Date(spin.createdAt).toLocaleString('vi-VN', {
                                        timeZone: 'Asia/Ho_Chi_Minh',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }) : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
