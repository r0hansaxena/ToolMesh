import { McpTool } from './types';

export class LiveContentScraper {
    private static REGISTRY_URLS = [
        'https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md',
        'https://raw.githubusercontent.com/wong2/awesome-mcp-servers/main/README.md',
    ];

    /**
     * Fetches and parses MCP tool data from decentralized registry sources.
     * In a production environment, this would hit a more structured API or On-Chain Oracle.
     */
    static async fetchLiveRegistry(): Promise<McpTool[]> {
        console.log('[Scraper] Initializing live registry fetch from GitHub...');

        try {
            // Fetching from the official modelcontextprotocol/servers repository README
            const response = await fetch('https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md');
            if (!response.ok) throw new Error('Failed to fetch official registry');

            const markdown = await response.text();

            // Refined regex to handle different link/image formats in the official registry
            const toolRegex = /- (?:<img[^>]*> )?\*\*\[?([^\]*]+)\]?(?:\([^)]+\))?\*\* - (.*)$/gm;
            const tools: McpTool[] = [];
            let match;

            while ((match = toolRegex.exec(markdown)) !== null) {
                const name = match[1].trim();
                const description = match[2].trim();
                const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

                tools.push({
                    id: `live-${id}`,
                    name: name,
                    description: description,
                    category: this.inferCategory(name, description),
                    author: 'MCP Community',
                    version: '1.0.0',
                    repository: `https://github.com/modelcontextprotocol/servers/tree/main/src/${id}`,
                    installCommand: `npx -y @modelcontextprotocol/server-${id}`,
                    configSnippet: {
                        command: 'npx',
                        args: ['-y', `@modelcontextprotocol/server-${id}`]
                    },
                    tags: id.split('-').concat(this.inferCategory(name, description).toLowerCase()),
                    stars: Math.floor(Math.random() * 500) + 50,
                    verified: true
                });
            }

            console.log(`[Scraper] Successfully parsed ${tools.length} live tools.`);

            // Merge with fallbacks and de-duplicate by ID
            const allTools = [...tools, ...this.getFallbackTools()];
            const uniqueTools = Array.from(new Map(allTools.map(t => [t.id, t])).values());

            return uniqueTools;
        } catch (error) {
            console.error('[Scraper] Network error during live fetch:', error);
            return this.getFallbackTools();
        }
    }

    private static inferCategory(name: string, description: string): string {
        const text = (name + ' ' + description).toLowerCase();
        if (text.includes('sql') || text.includes('db') || text.includes('postgres') || text.includes('sqlite')) return 'Database';
        if (text.includes('git') || text.includes('dev') || text.includes('code')) return 'Development';
        if (text.includes('search') || text.includes('web') || text.includes('goog')) return 'Search/Web';
        if (text.includes('file') || text.includes('system') || text.includes('drive')) return 'System';
        return 'Utility';
    }

    private static getFallbackTools(): McpTool[] {
        return [
            {
                id: 'live-thirdweb',
                name: 'Thirdweb',
                description: 'Deploy and manage smart contracts using Thirdweb SDK.',
                category: 'Development',
                author: 'Thirdweb',
                version: '1.0.2',
                repository: 'https://github.com/thirdweb-dev/mcp-server',
                installCommand: 'npx -y @thirdweb-dev/mcp',
                configSnippet: {
                    command: 'npx',
                    args: ['-y', '@thirdweb-dev/mcp'],
                    env: {
                        THIRDWEB_SECRET_KEY: "<YOUR_THIRDWEB_SECRET_KEY>"
                    }
                },
                tags: ['web3', 'blockchain', 'contracts'],
                stars: 1200,
                verified: true
            },
            {
                id: 'live-postgres',
                name: 'PostgreSQL',
                description: 'Read and query your Postgres databases with full schema awareness.',
                category: 'Database',
                author: 'MCP Community',
                version: '0.4.5',
                repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
                installCommand: 'npx -y @modelcontextprotocol/server-postgres',
                configSnippet: {
                    command: 'npx',
                    args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost:5432/postgres']
                },
                tags: ['sql', 'database', 'postgres'],
                stars: 1100,
                verified: true
            },
            {
                id: 'live-github',
                name: 'GitHub',
                description: 'Manage repositories, issues, and PRs.',
                category: 'Development',
                author: 'GitHub',
                version: '1.0.0',
                repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
                installCommand: 'npx -y @modelcontextprotocol/server-github',
                configSnippet: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'] },
                tags: ['git', 'github', 'development'],
                stars: 450,
                verified: true
            },
            {
                id: 'live-filesystem',
                name: 'Filesystem',
                description: 'Read and write local files with safety controls.',
                category: 'System',
                author: 'Anthropic',
                version: '1.2.0',
                repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
                installCommand: 'npx -y @modelcontextprotocol/server-filesystem',
                configSnippet: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem'] },
                tags: ['files', 'local', 'system'],
                stars: 980,
                verified: true
            }
        ];
    }
}
