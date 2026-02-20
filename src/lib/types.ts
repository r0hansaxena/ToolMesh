export interface McpTool {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  repository: string;
  installCommand: string;
  configSnippet: Record<string, unknown>;
  tags: string[];
  stars: number;
  verified: boolean;
}

export interface CortensorNode {
  id: string;
  name: string;
  region: string;
  reliability: number;
  latency: number;
}

export interface NodeVote {
  nodeId: string;
  nodeName: string;
  region: string;
  score: number;
  reasoning: string;
  latency: number;
  approved: boolean;
}

export interface ConsensusResult {
  toolId: string;
  tool: McpTool;
  confidenceScore: number;
  agreementPercentage: number;
  totalNodes: number;
  approvingNodes: number;
  votes: NodeVote[];
  reasoning: string;
}

export interface EvidenceBundle {
  query: string;
  timestamp: string;
  consensusResults: ConsensusResult[];
  totalNodesParticipated: number;
  averageLatency: number;
  consensusReachedIn: number;
}

export interface ConfigOutput {
  client: 'claude-desktop' | 'cursor' | 'generic';
  config: Record<string, unknown>;
  tools: McpTool[];
}
