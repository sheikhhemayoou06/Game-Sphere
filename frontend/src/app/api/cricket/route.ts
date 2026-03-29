import { NextResponse } from 'next/server';

const CRICAPI_KEY = 'c96e46df-0777-40cf-b456-81bdf44dd874';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'currentMatches';
    const matchId = searchParams.get('id') || '';

    let url = '';
    if (endpoint === 'currentMatches') {
        url = `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`;
    } else if (endpoint === 'match_scorecard' && matchId) {
        url = `https://api.cricapi.com/v1/match_scorecard?apikey=${CRICAPI_KEY}&id=${matchId}`;
    } else if (endpoint === 'match_info' && matchId) {
        url = `https://api.cricapi.com/v1/match_info?apikey=${CRICAPI_KEY}&id=${matchId}`;
    } else if (endpoint === 'match_bbb' && matchId) {
        url = `https://api.cricapi.com/v1/match_bbb?apikey=${CRICAPI_KEY}&id=${matchId}`;
    } else {
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }

    try {
        const res = await fetch(url, { next: { revalidate: 10 } });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'CricAPI fetch failed' }, { status: 500 });
    }
}
