import { LiveContentScraper } from '@/lib/scraper';
import { runConsensus } from '@/lib/consensus-engine';
import ToolDetailClient from './ToolDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    const tools = await LiveContentScraper.fetchLiveRegistry();
    return tools.map((tool) => ({
        id: tool.id,
    }));
}

export default async function ToolDetailPage({ params }: PageProps) {
    const { id } = await params;
    const tools = await LiveContentScraper.fetchLiveRegistry();
    const tool = tools.find((t) => t.id === id);

    if (!tool) {
        return (
            <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tool Not Found</h1>
                <p style={{ color: 'var(--text-secondary)' }}>The requested tool does not exist in the registry.</p>
            </div>
        );
    }

    // Run consensus for this specific tool
    const evidence = await runConsensus(tool.name);
    const toolResult = evidence.consensusResults.find((r) => r.toolId === tool.id);

    return <ToolDetailClient tool={tool} result={toolResult || null} />;
}
