import RunningAthleteLoader from '@/components/RunningAthleteLoader';

export default function Loading() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f8fafc',
        }}>
            <RunningAthleteLoader />
        </div>
    );
}
