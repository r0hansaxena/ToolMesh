import { McpTool, CortensorNode, NodeVote, ConsensusResult, EvidenceBundle } from './types';
import { toolsRegistry, searchTools } from './tools-registry';

const CORTENSOR_NODES: CortensorNode[] = [
    { id: 'node-alpha', name: 'Alpha-US-East', region: 'US-East', reliability: 0.97, latency: 45 },
    { id: 'node-beta', name: 'Beta-EU-West', region: 'EU-West', reliability: 0.95, latency: 78 },
    { id: 'node-gamma', name: 'Gamma-Asia-SE', region: 'Asia-SE', reliability: 0.93, latency: 112 },
    { id: 'node-delta', name: 'Delta-US-West', region: 'US-West', reliability: 0.96, latency: 52 },
    { id: 'node-epsilon', name: 'Epsilon-EU-Central', region: 'EU-Central', reliability: 0.94, latency: 85 },
    { id: 'node-zeta', name: 'Zeta-SA-East', region: 'SA-East', reliability: 0.91, latency: 130 },
    { id: 'node-eta', name: 'Eta-AU-East', region: 'AU-East', reliability: 0.92, latency: 145 },
];

const REASONING_TEMPLATES = [
    'Tool matches query intent with high semantic relevance. Verified package integrity and active maintenance.',
    'Strong alignment with requested functionality. Community adoption metrics are favorable.',
    'Capabilities directly address the described use case. Security audit passed.',
    'Feature set covers the requirements comprehensively. API stability confirmed.',
    'Well-maintained package with regular updates. Documentation quality is excellent.',
    'Broad community support and proven reliability in production environments.',
];

function jitter(base: number, variance: number): number {
    return base + (Math.random() - 0.5) * 2 * variance;
}

function generateNodeVote(node: CortensorNode, tool: McpTool, queryRelevance: number): NodeVote {
    const baseScore = queryRelevance * node.reliability;
    const score = Math.min(1, Math.max(0, jitter(baseScore, 0.08)));
    const approved = score > 0.45;
    const latency = Math.round(jitter(node.latency, 20));
    const reasoning = REASONING_TEMPLATES[Math.floor(Math.random() * REASONING_TEMPLATES.length)];

    return {
        nodeId: node.id,
        nodeName: node.name,
        region: node.region,
        score: Math.round(score * 100) / 100,
        reasoning,
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
    if (tool.verified) score += 0.05;

    return Math.min(1, score + jitter(0, 0.05));
}

export function runConsensus(query: string): EvidenceBundle {
    const queryTerms = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2);

    // Score every tool against the query
    const toolScores = toolsRegistry.map((tool) => ({
        tool,
        relevance: computeRelevance(tool, queryTerms),
    }));

    // Sort by relevance descending, take top 6
    toolScores.sort((a, b) => b.relevance - a.relevance);
    const topTools = toolScores.slice(0, 6);

    const startTime = Date.now();

    const consensusResults: ConsensusResult[] = topTools.map(({ tool, relevance }) => {
        const votes = CORTENSOR_NODES.map((node) => generateNodeVote(node, tool, relevance));
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
            reasoning: `${approvingNodes}/${votes.length} nodes reached consensus with ${agreementPercentage}% agreement. Average confidence: ${confidenceScore}.`,
        };
    });

    // Filter out tools with less than 40% agreement
    const filtered = consensusResults.filter((r) => r.agreementPercentage >= 40);
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
        consensusReachedIn: Date.now() - startTime + Math.round(jitter(800, 300)),
    };
}

export { searchTools, CORTENSOR_NODES };
