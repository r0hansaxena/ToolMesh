import { NextRequest, NextResponse } from 'next/server';
import { runConsensus } from '@/lib/consensus-engine';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const evidence = runConsensus(query.trim());
        return NextResponse.json(evidence);
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
