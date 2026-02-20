import { NextRequest, NextResponse } from 'next/server';
import { getToolById } from '@/lib/tools-registry';
import { generateConfig } from '@/lib/config-generator';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { toolIds, client } = body;

        if (!toolIds || !Array.isArray(toolIds) || toolIds.length === 0) {
            return NextResponse.json({ error: 'toolIds array is required' }, { status: 400 });
        }

        const validClients = ['claude-desktop', 'cursor', 'generic'];
        const selectedClient = validClients.includes(client) ? client : 'claude-desktop';

        const tools = toolIds
            .map((id: string) => getToolById(id))
            .filter((t): t is NonNullable<typeof t> => t !== undefined);

        if (tools.length === 0) {
            return NextResponse.json({ error: 'No valid tools found' }, { status: 400 });
        }

        const config = generateConfig(tools, selectedClient);
        return NextResponse.json(config);
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
