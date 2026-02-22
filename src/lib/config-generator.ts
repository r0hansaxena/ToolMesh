import { McpTool, ConfigOutput } from './types';

export type Platform = 'windows' | 'macos' | 'linux' | 'unknown';

export function generateConfig(
    tools: McpTool[],
    client: 'claude-desktop' | 'cursor' | 'generic',
    platform: Platform = 'unknown'
): ConfigOutput {
    // Transform tools based on platform
    const transformedTools = tools.map((tool) => {
        const configSnippet = JSON.parse(JSON.stringify(tool.configSnippet));

        if (platform === 'windows') {
            // 1. Transform npx to npx.cmd
            if (configSnippet.command === 'npx') {
                configSnippet.command = 'npx.cmd';
            }

            // 2. Transform paths for filesystem tool
            if (tool.id === 'filesystem' || tool.id === 'live-filesystem') {
                if (Array.isArray(configSnippet.args)) {
                    configSnippet.args = configSnippet.args.map((arg: string) => {
                        if (arg === '<PATH_TO_FILES_DIR>') {
                            return 'C:/';
                        }
                        return arg;
                    });
                }
            }
        } else if (platform === 'macos' || platform === 'linux') {
            // Default for Unix-like systems
            if (tool.id === 'filesystem' || tool.id === 'live-filesystem') {
                if (Array.isArray(configSnippet.args)) {
                    configSnippet.args = configSnippet.args.map((arg: string) => {
                        if (arg === '<PATH_TO_FILES_DIR>') {
                            return '~/';
                        }
                        return arg;
                    });
                }
            }
        }

        return {
            ...tool,
            configSnippet,
        };
    });

    switch (client) {
        case 'claude-desktop':
            return {
                client,
                tools: transformedTools,
                config: {
                    mcpServers: Object.fromEntries(
                        transformedTools.map((tool) => [
                            tool.id.replace('live-', ''), // Clean up IDs for config
                            tool.configSnippet,
                        ])
                    ),
                },
            };

        case 'cursor':
            return {
                client,
                tools: transformedTools,
                config: {
                    mcpServers: Object.fromEntries(
                        transformedTools.map((tool) => [
                            tool.id.replace('live-', ''),
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
                tools: transformedTools,
                config: {
                    version: '1.0',
                    servers: transformedTools.map((tool) => ({
                        name: tool.id.replace('live-', ''),
                        displayName: tool.name,
                        ...tool.configSnippet,
                    })),
                },
            };
    }
}
