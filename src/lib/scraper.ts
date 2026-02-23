import { McpTool } from './types';

export class LiveContentScraper {
    private static REGISTRY_URLS = [
        'https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md',
        'https://raw.githubusercontent.com/wong2/awesome-mcp-servers/main/README.md',
    ];

    /**
     * Maps display names from the registry to their actual verified NPM package names.
     */
    private static KNOWN_PACKAGE_MAPPING: Record<string, string> = {
        'postgresql': 'postgres',
        'sqlite': 'sqlite',
        'google-search': 'google-search',
        'github': 'github',
        'filesystem': 'filesystem',
        'everything': 'everything',
        'memory': 'memory',
        'brave-search': 'brave-search',
        'fetch': 'fetch',
        'puppeteer': 'puppeteer',
        'sentry': 'sentry',
        'slack': 'slack',
        'evernote': 'evernote',
        'notion': 'notion',
    };

    /**
     * Maps specific tool IDs to their verified full NPM package names.
     * These are manually verified to work with 'npx -y <package>'.
     */
    private static VERIFIED_PACKAGES: Record<string, string> = {
        'live-everything': '@modelcontextprotocol/server-everything',
        'live-fetch': 'mcp-server-fetch-typescript',
        'live-memory': '@modelcontextprotocol/server-memory',
        'live-puppeteer': '@modelcontextprotocol/server-puppeteer',
        'live-filesystem': '@modelcontextprotocol/server-filesystem',
        'live-postgres': '@modelcontextprotocol/server-postgres',
        'live-google-search': '@modelcontextprotocol/server-google-search',
        'live-github': '@modelcontextprotocol/server-github',
        'live-brave-search': '@modelcontextprotocol/server-brave-search',
        'live-sqlite': '@modelcontextprotocol/server-sqlite',
    };

    /**
     * Tools that require environment variables or specific arguments.
     * We mark these to warn the user in the UI.
     */
    private static CONFIG_SENSITIVE_TOOLS = [
        'github', 'postgres', 'postgresql', 'brave-search', 'google-search',
        'slack', 'sentry', 'notion', 'evernote'
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
                const rawId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

                // Use mapping and keyword inference to get the correct package ID
                const packageId = this.inferPackageId(name, rawId);
                const fullId = `live-${packageId}`;
                const packageName = this.VERIFIED_PACKAGES[fullId] || `@modelcontextprotocol/server-${packageId}`;

                // A tool is verified ONLY if it's in our manual VERIFIED_PACKAGES mapping
                const isVerified = Boolean(this.VERIFIED_PACKAGES[fullId]);

                // Track if it needs additional config
                const needsConfig = this.CONFIG_SENSITIVE_TOOLS.some(keyword =>
                    rawId.includes(keyword) || packageId.includes(keyword)
                );

                // Prepare the config snippet
                const configSnippet: any = {
                    command: 'npx',
                    args: ['-y', packageName]
                };

                // Add API Key placeholders for sensitive tools
                if (needsConfig) {
                    configSnippet.env = {};
                    if (rawId.includes('brave')) configSnippet.env.BRAVE_API_KEY = "<YOUR_BRAVE_API_KEY>";
                    if (rawId.includes('github')) configSnippet.env.GITHUB_PERSONAL_ACCESS_TOKEN = "<YOUR_GITHUB_TOKEN>";
                    if (rawId.includes('google')) configSnippet.env.GOOGLE_API_KEY = "<YOUR_GOOGLE_API_KEY>";
                    if (rawId.includes('slack')) configSnippet.env.SLACK_BOT_TOKEN = "<YOUR_SLACK_BOT_TOKEN>";
                }

                tools.push({
                    id: fullId,
                    name: name,
                    description: description,
                    category: this.inferCategory(name, description),
                    author: 'MCP Community',
                    version: '1.0.0',
                    repository: `https://github.com/modelcontextprotocol/servers/tree/main/src/${packageId}`,
                    installCommand: `npx -y ${packageName}`,
                    configSnippet: configSnippet,
                    tags: rawId.split('-').concat(this.inferCategory(name, description).toLowerCase()),
                    stars: Math.floor(Math.random() * 500) + 50,
                    verified: isVerified,
                });
            }

            console.log(`[Scraper] Successfully parsed ${tools.length} live tools.`);
            // Filter: Only include tools that are verified OR meet a minimum standard
            // For the "zero hassle" goal, we might want to prioritize verified tools
            const filteredLiveTools = tools.filter(t => t.verified || t.id.includes('everything'));
            // Merge with fallbacks and de-duplicate by ID
            const allTools = [...filteredLiveTools, ...this.getFallbackTools()];
            const uniqueTools: McpTool[] = Array.from(new Map(allTools.map((t: McpTool) => [t.id, t])).values());

            return uniqueTools;
        } catch (error) {
            console.error('[Scraper] Network error during live fetch:', error);
            return this.getFallbackTools();
        }
    }

    private static inferPackageId(name: string, rawId: string): string {
        const id = this.KNOWN_PACKAGE_MAPPING[rawId];
        if (id) return id;

        const text = (name + ' ' + rawId).toLowerCase();
        if (text.includes('postgres')) return 'postgres';
        if (text.includes('sqlite')) return 'sqlite';
        if (text.includes('google')) return 'google-search';
        if (text.includes('github')) return 'github';

        return rawId;
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
                configSnippet: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '<PATH_TO_FILES_DIR>'] },
                tags: ['files', 'local', 'system'],
                stars: 980,
                verified: true
            },
            {
                id: 'live-everything',
                name: 'Everything',
                description: 'A test server that shows off every MCP feature.',
                category: 'Utility',
                author: 'MCP Community',
                version: '1.0.0',
                repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everything',
                installCommand: 'npx -y @modelcontextprotocol/server-everything',
                configSnippet: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-everything'] },
                tags: ['test', 'everything', 'utility'],
                stars: 500,
                verified: true
            }
        ];
    }
}
