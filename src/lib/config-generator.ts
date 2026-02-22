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

            // 2. Transform paths for any tool that looks like a filesystem tool
            if (tool.id.includes('filesystem') || tool.name.toLowerCase().includes('filesystem')) {
                if (Array.isArray(configSnippet.args)) {
                    // Check if a path placeholder exists, if not, consider adding C:/ for Windows
                    let hasPath = false;
                    configSnippet.args = configSnippet.args.map((arg: string) => {
                        if (arg === '<PATH_TO_FILES_DIR>') {
                            hasPath = true;
                            return 'C:/';
                        }
                        return arg;
                    });

                    // If it's a filesystem tool but doesn't have a path arg yet, add it
                    if (!hasPath && tool.id.includes('filesystem')) {
                        configSnippet.args.push('C:/');
                    }
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
