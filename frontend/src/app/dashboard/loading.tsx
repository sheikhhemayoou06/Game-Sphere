export default function DashboardLoading() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f8fafc',
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '40px', height: '40px', border: '3px solid #e2e8f0',
                    borderTopColor: '#4f46e5', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite', margin: '0 auto 14px',
                }} />
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#4f46e5' }}>Game Sphere</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Loading dashboard…</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}
