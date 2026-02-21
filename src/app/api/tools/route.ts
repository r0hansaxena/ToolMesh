import { NextResponse } from 'next/server';
import { LiveContentScraper } from '@/lib/scraper';

export async function GET() {
    const tools = await LiveContentScraper.fetchLiveRegistry();
    const categories = Array.from(new Set(tools.map(t => t.category)));

    return NextResponse.json({
        tools: tools,
        categories: categories,
        total: tools.length,
    });
}
