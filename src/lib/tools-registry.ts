import { McpTool } from './types';

export const toolsRegistry: McpTool[] = [
    {
        id: 'filesystem',
        name: 'Filesystem',
        description: 'Read, write, and manage files on your local system. Supports file search, directory listing, and content manipulation with safety guards.',
        category: 'System',
        author: 'Anthropic',
        version: '1.2.0',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
        installCommand: 'npx -y @modelcontextprotocol/server-filesystem',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir'],
        },
        tags: ['files', 'io', 'local', 'read', 'write'],
        stars: 4200,
        verified: true,
    },
    {
        id: 'github',
        name: 'GitHub',
        description: 'Interact with GitHub repositories, issues, pull requests, and actions. Manage code reviews, create branches, and automate workflows.',
        category: 'Developer Tools',
        author: 'GitHub',
        version: '2.1.0',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
        installCommand: 'npx -y @modelcontextprotocol/server-github',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-github'],
            env: { GITHUB_PERSONAL_ACCESS_TOKEN: '<your-token>' },
        },
        tags: ['git', 'vcs', 'code', 'repository', 'pr', 'issues'],
        stars: 5800,
        verified: true,
    },
    {
        id: 'postgres',
        name: 'PostgreSQL',
        description: 'Connect to PostgreSQL databases to run read-only queries, inspect schemas, and analyze data. Includes safety measures against destructive operations.',
        category: 'Database',
        author: 'Anthropic',
        version: '1.0.3',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
        installCommand: 'npx -y @modelcontextprotocol/server-postgres',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost/mydb'],
        },
        tags: ['database', 'sql', 'query', 'data'],
        stars: 3100,
        verified: true,
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Send and read messages, manage channels, search conversations, and automate Slack workspace interactions for team collaboration.',
        category: 'Communication',
        author: 'Anthropic',
        version: '1.1.0',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
        installCommand: 'npx -y @modelcontextprotocol/server-slack',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-slack'],
            env: { SLACK_BOT_TOKEN: '<your-bot-token>', SLACK_TEAM_ID: '<your-team-id>' },
        },
        tags: ['messaging', 'team', 'chat', 'collaboration'],
        stars: 2400,
        verified: true,
    },
    {
        id: 'brave-search',
        name: 'Brave Search',
        description: 'Perform privacy-respecting web searches using Brave Search API. Get comprehensive search results with summaries and relevant links.',
        category: 'Search',
        author: 'Anthropic',
        version: '1.0.1',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
        installCommand: 'npx -y @modelcontextprotocol/server-brave-search',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-brave-search'],
            env: { BRAVE_API_KEY: '<your-api-key>' },
        },
        tags: ['search', 'web', 'internet', 'browse'],
        stars: 2900,
        verified: true,
    },
    {
        id: 'puppeteer',
        name: 'Puppeteer',
        description: 'Control a headless Chrome browser to navigate websites, take screenshots, extract content, fill forms, and automate web interactions.',
        category: 'Browser Automation',
        author: 'Anthropic',
        version: '1.0.2',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
        installCommand: 'npx -y @modelcontextprotocol/server-puppeteer',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-puppeteer'],
        },
        tags: ['browser', 'web', 'scraping', 'automation', 'screenshot'],
        stars: 3400,
        verified: true,
    },
    {
        id: 'memory',
        name: 'Memory',
        description: 'Persistent knowledge graph for AI assistants. Store and retrieve entities, relationships, and observations across conversations.',
        category: 'AI & Memory',
        author: 'Anthropic',
        version: '1.0.0',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
        installCommand: 'npx -y @modelcontextprotocol/server-memory',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-memory'],
        },
        tags: ['memory', 'knowledge', 'graph', 'persistence', 'context'],
        stars: 2100,
        verified: true,
    },
    {
        id: 'google-maps',
        name: 'Google Maps',
        description: 'Access Google Maps APIs for geocoding, directions, place search, elevation data, and distance calculations.',
        category: 'Location',
        author: 'Anthropic',
        version: '1.0.0',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps',
        installCommand: 'npx -y @modelcontextprotocol/server-google-maps',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-google-maps'],
            env: { GOOGLE_MAPS_API_KEY: '<your-api-key>' },
        },
        tags: ['maps', 'location', 'geocoding', 'directions'],
        stars: 1800,
        verified: true,
    },
    {
        id: 'sqlite',
        name: 'SQLite',
        description: 'Interact with SQLite databases for lightweight data storage. Create tables, run queries, and manage local databases with full SQL support.',
        category: 'Database',
        author: 'Anthropic',
        version: '1.0.1',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
        installCommand: 'npx -y @modelcontextprotocol/server-sqlite',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-sqlite', '/path/to/database.db'],
        },
        tags: ['database', 'sql', 'local', 'lightweight'],
        stars: 1600,
        verified: true,
    },
    {
        id: 'git',
        name: 'Git',
        description: 'Perform Git operations on local repositories — clone, commit, diff, log, branch management, and more without leaving your AI assistant.',
        category: 'Developer Tools',
        author: 'Anthropic',
        version: '1.0.0',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
        installCommand: 'npx -y @modelcontextprotocol/server-git',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-git'],
        },
        tags: ['git', 'vcs', 'version-control', 'diff', 'commit'],
        stars: 2000,
        verified: true,
    },
    {
        id: 'fetch',
        name: 'Fetch',
        description: 'Make HTTP requests to any URL and return content in a format optimized for LLMs. Supports HTML-to-markdown conversion and robots.txt compliance.',
        category: 'Networking',
        author: 'Anthropic',
        version: '1.0.0',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
        installCommand: 'npx -y @modelcontextprotocol/server-fetch',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-fetch'],
        },
        tags: ['http', 'api', 'web', 'request', 'fetch'],
        stars: 2600,
        verified: true,
    },
    {
        id: 'notion',
        name: 'Notion',
        description: 'Connect to Notion workspaces to read, create, and update pages, databases, and blocks. Perfect for knowledge management workflows.',
        category: 'Productivity',
        author: 'Community',
        version: '0.9.2',
        repository: 'https://github.com/makenotion/notion-mcp-server',
        installCommand: 'npx -y @notionhq/notion-mcp-server',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@notionhq/notion-mcp-server'],
            env: { NOTION_API_KEY: '<your-integration-key>' },
        },
        tags: ['notion', 'wiki', 'documentation', 'notes', 'productivity'],
        stars: 1900,
        verified: false,
    },
    {
        id: 'docker',
        name: 'Docker',
        description: 'Manage Docker containers, images, volumes, and networks. Build, run, stop, and inspect containers directly from your AI assistant.',
        category: 'DevOps',
        author: 'Community',
        version: '0.8.1',
        repository: 'https://github.com/docker/docker-mcp-server',
        installCommand: 'npx -y @docker/mcp-server',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@docker/mcp-server'],
        },
        tags: ['docker', 'containers', 'devops', 'deployment'],
        stars: 1500,
        verified: false,
    },
    {
        id: 'sentry',
        name: 'Sentry',
        description: 'Monitor application errors and performance issues through Sentry. Query issues, view stack traces, and manage error resolutions.',
        category: 'Monitoring',
        author: 'Sentry',
        version: '1.0.0',
        repository: 'https://github.com/getsentry/sentry-mcp-server',
        installCommand: 'npx -y @sentry/mcp-server',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@sentry/mcp-server'],
            env: { SENTRY_AUTH_TOKEN: '<your-auth-token>' },
        },
        tags: ['monitoring', 'errors', 'debugging', 'performance'],
        stars: 1200,
        verified: true,
    },
    {
        id: 'redis',
        name: 'Redis',
        description: 'Connect to Redis instances for key-value operations, pub/sub messaging, caching, and data structure manipulation.',
        category: 'Database',
        author: 'Community',
        version: '0.7.0',
        repository: 'https://github.com/redis/redis-mcp-server',
        installCommand: 'npx -y @redis/mcp-server',
        configSnippet: {
            command: 'npx',
            args: ['-y', '@redis/mcp-server'],
            env: { REDIS_URL: 'redis://localhost:6379' },
        },
        tags: ['cache', 'redis', 'key-value', 'database'],
        stars: 1100,
        verified: false,
    },
];

export function getToolById(id: string): McpTool | undefined {
    return toolsRegistry.find((t) => t.id === id);
}

export function getToolsByCategory(category: string): McpTool[] {
    return toolsRegistry.filter((t) => t.category === category);
}

export function getCategories(): string[] {
    return [...new Set(toolsRegistry.map((t) => t.category))];
}

export function searchTools(query: string): McpTool[] {
    const q = query.toLowerCase();
    return toolsRegistry.filter(
        (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.includes(q)) ||
            t.category.toLowerCase().includes(q)
    );
}
