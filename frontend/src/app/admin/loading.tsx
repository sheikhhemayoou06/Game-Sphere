export default function Loading() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f8fafc',
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '36px', height: '36px', border: '3px solid #e2e8f0',
                    borderTopColor: '#4f46e5', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite', margin: '0 auto 12px',
                }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Loading…</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}
