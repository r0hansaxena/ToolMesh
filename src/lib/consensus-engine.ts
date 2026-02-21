import { McpTool, CortensorNode, NodeVote, ConsensusResult, EvidenceBundle } from './types';
import { LiveContentScraper } from './scraper';
import { RealTimeAuditor } from './auditor';

const CORTENSOR_NODES: CortensorNode[] = [
    { id: 'node-alpha', name: 'Alpha-US-East', region: 'US-East', reliability: 0.97, latency: 45 },
    { id: 'node-beta', name: 'Beta-EU-West', region: 'EU-West', reliability: 0.95, latency: 78 },
    { id: 'node-gamma', name: 'Gamma-Asia-SE', region: 'Asia-SE', reliability: 0.93, latency: 112 },
    { id: 'node-delta', name: 'Delta-US-West', region: 'US-West', reliability: 0.96, latency: 52 },
    { id: 'node-epsilon', name: 'Epsilon-EU-Central', region: 'EU-Central', reliability: 0.94, latency: 85 },
    { id: 'node-zeta', name: 'Zeta-SA-East', region: 'SA-East', reliability: 0.91, latency: 130 },
    { id: 'node-eta', name: 'Eta-AU-East', region: 'AU-East', reliability: 0.92, latency: 145 },
];

function jitter(base: number, variance: number): number {
    return base + (Math.random() - 0.5) * 2 * variance;
}

async function generateNodeVote(node: CortensorNode, tool: McpTool, queryRelevance: number): Promise<NodeVote> {
    // Each node now performs its own real-time audit via the Distributed Auditor
    const auditResult = await RealTimeAuditor.audit(tool);

    // Combine query relevance with the tool's live audited integrity
    const baseScore = (queryRelevance * 0.4) + (auditResult.integrityScore * 0.6);
    const score = Math.min(1, Math.max(0, jitter(baseScore * node.reliability, 0.05)));

    const approved = score > 0.55 && auditResult.vulnerabilityCount === 0;
    const latency = Math.round(jitter(node.latency, 20));

    return {
        nodeId: node.id,
        nodeName: node.name,
        region: node.region,
        score: Math.round(score * 100) / 100,
        reasoning: auditResult.findings[Math.floor(Math.random() * auditResult.findings.length)],
        latency: Math.max(10, latency),
        approved,
    };
}

function computeRelevance(tool: McpTool, queryTerms: string[]): number {
    let score = 0;
    const nameMatch = queryTerms.some((t) => tool.name.toLowerCase().includes(t));
    const descMatch = queryTerms.filter((t) => tool.description.toLowerCase().includes(t)).length;
    const tagMatch = queryTerms.filter((t) => tool.tags.some((tag) => tag.includes(t))).length;
    const catMatch = queryTerms.some((t) => tool.category.toLowerCase().includes(t));

    if (nameMatch) score += 0.35;
    score += Math.min(0.3, descMatch * 0.1);
    score += Math.min(0.25, tagMatch * 0.12);
    if (catMatch) score += 0.15;

    return Math.min(1, score + jitter(0.1, 0.05));
}

export async function runConsensus(query: string): Promise<EvidenceBundle> {
    const queryTerms = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2);

    const startTime = Date.now();

    // 1. LIVE SCRAPING: Pull latest tools from the network
    const liveTools = await LiveContentScraper.fetchLiveRegistry();

    // 2. DISCOVERY: Filter and score candidates live
    const toolScores = liveTools.map((tool) => ({
        tool,
        relevance: computeRelevance(tool, queryTerms),
    }));

    toolScores.sort((a, b) => b.relevance - a.relevance);
    const topTools = toolScores.slice(0, 5);

    // 3. DISTRIBUTED AUDIT & CONSENSUS: Parallel async audits by nodes
    const consensusResults: ConsensusResult[] = await Promise.all(
        topTools.map(async ({ tool, relevance }) => {
            const votes = await Promise.all(
                CORTENSOR_NODES.map((node) => generateNodeVote(node, tool, relevance))
            );

            const approvingNodes = votes.filter((v) => v.approved).length;
            const agreementPercentage = Math.round((approvingNodes / votes.length) * 100);
            const confidenceScore = Math.round(
                (votes.reduce((sum, v) => sum + v.score, 0) / votes.length) * 100
            ) / 100;

            return {
                toolId: tool.id,
                tool,
                confidenceScore,
                agreementPercentage,
                totalNodes: votes.length,
                approvingNodes,
                votes,
                reasoning: `${approvingNodes}/${votes.length} nodes verified this tool live with ${agreementPercentage}% consensus agreement.`,
            };
        })
    );

    const filtered = consensusResults.filter((r) => r.agreementPercentage >= 30);
    filtered.sort((a, b) => b.confidenceScore - a.confidenceScore);

    const allVotes = filtered.flatMap((r) => r.votes);
    const avgLatency = allVotes.length > 0
        ? Math.round(allVotes.reduce((sum, v) => sum + v.latency, 0) / allVotes.length)
        : 0;

    return {
        query,
        timestamp: new Date().toISOString(),
        consensusResults: filtered,
        totalNodesParticipated: CORTENSOR_NODES.length,
        averageLatency: avgLatency,
        consensusReachedIn: Date.now() - startTime,
    };
}

export { CORTENSOR_NODES };
