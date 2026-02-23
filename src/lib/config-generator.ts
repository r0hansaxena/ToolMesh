import { McpTool, ConfigOutput } from './types';

export type Platform = 'windows' | 'macos' | 'linux' | 'mobile' | 'unknown';

export interface ConfigOptions {
    filesystemPath?: string;
}

export function generateConfig(
    tools: McpTool[],
    client: 'claude-desktop' | 'cursor' | 'generic',
    platform: Platform = 'unknown',
    options: ConfigOptions = {}
): ConfigOutput {
    // Transform tools based on platform
    const transformedTools = tools.map((tool) => {
        const configSnippet = JSON.parse(JSON.stringify(tool.configSnippet));

        if (platform === 'windows' || platform === 'macos' || platform === 'linux' || platform === 'unknown') {
            // 1. Transform npx to npx.cmd for Windows
            if (platform === 'windows' && configSnippet.command === 'npx') {
                configSnippet.command = 'npx.cmd';
            }

            // 2. Transform paths for any tool that looks like a filesystem tool
            if (tool.id.includes('filesystem') || tool.name.toLowerCase().includes('filesystem')) {
                if (!Array.isArray(configSnippet.args)) {
                    configSnippet.args = [];
                }

                const defaultPath = '<ENTER_DIRECTORY_PATH>';

                const finalPath = options.filesystemPath || defaultPath;

                let hasPath = false;
                configSnippet.args = configSnippet.args.map((arg: string) => {
                    const argStr = String(arg);
                    if (argStr === '<PATH_TO_FILES_DIR>' || argStr === '<ENTER_DIRECTORY_PATH>' || argStr === 'C:/' || argStr === '~/') {
                        hasPath = true;
                        return finalPath;
                    }
                    return arg;
                });

                // If it's a filesystem tool but doesn't have a path arg yet, add it
                if (!hasPath) {
                    configSnippet.args.push(finalPath);
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
                platform,
                tools: transformedTools,
                config: {
                    mcpServers: Object.fromEntries(
                        transformedTools.map((tool) => {
                            const cleanId = tool.id.replace('live-', '').toLowerCase();
                            // Final safety check: ensure command is never empty
                            if (!tool.configSnippet.command) {
                                tool.configSnippet.command = platform === 'windows' ? 'npx.cmd' : 'npx';
                            }
                            return [cleanId, tool.configSnippet];
                        })
                    ),
                },
            };

        case 'cursor':
            return {
                client,
                platform,
                tools: transformedTools,
                config: {
                    mcpServers: Object.fromEntries(
                        transformedTools.map((tool) => {
                            const cleanId = tool.id.replace('live-', '').toLowerCase();
                            if (!tool.configSnippet.command) {
                                tool.configSnippet.command = platform === 'windows' ? 'npx.cmd' : 'npx';
                            }
                            return [
                                cleanId,
                                {
                                    ...tool.configSnippet,
                                    disabled: false,
                                    autoApprove: [],
                                },
                            ];
                        })
                    ),
                },
            };

        case 'generic':
        default:
            return {
                client: 'generic',
                platform,
                tools: transformedTools,
                config: {
                    version: '1.0',
                    servers: transformedTools.map((tool) => {
                        const cleanId = tool.id.replace('live-', '').toLowerCase();
                        if (!tool.configSnippet.command) {
                            tool.configSnippet.command = platform === 'windows' ? 'npx.cmd' : 'npx';
                        }
                        return {
                            name: cleanId,
                            displayName: tool.name,
                            ...tool.configSnippet,
                        };
                    }),
                },
            };
    }
}
