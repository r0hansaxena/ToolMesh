import { McpTool, ConfigOutput } from './types';

export function generateConfig(tools: McpTool[], client: 'claude-desktop' | 'cursor' | 'generic'): ConfigOutput {
    switch (client) {
        case 'claude-desktop':
            return {
                client,
                tools,
                config: {
                    mcpServers: Object.fromEntries(
                        tools.map((tool) => [
                            tool.id,
                            tool.configSnippet,
                        ])
                    ),
                },
            };

        case 'cursor':
            return {
                client,
                tools,
                config: {
                    mcpServers: Object.fromEntries(
                        tools.map((tool) => [
                            tool.id,
                            {
                                ...tool.configSnippet,
                                disabled: false,
                                autoApprove: [],
                            },
                        ])
                    ),
                },
            };

        case 'generic':
        default:
            return {
                client: 'generic',
                tools,
                config: {
                    version: '1.0',
                    servers: tools.map((tool) => ({
                        name: tool.id,
                        displayName: tool.name,
                        ...tool.configSnippet,
                    })),
                },
            };
    }
}
