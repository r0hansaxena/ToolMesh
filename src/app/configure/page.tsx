'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

interface ToolInfo {
    id: string;
    name: string;
    category: string;
    description: string;
    repository: string;
    setupGuide?: string;
    installCommand?: string;
    configSnippet?: Record<string, unknown>;
}

const OS_ICONS: Record<string, React.ReactNode> = {
    windows: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 2.3l6.5-.9v6.3H0V2.3zm7.3-1L16 0v7.7H7.3V1.3zM16 8.7V16l-8.7-1.2V8.7H16zM6.5 14.7L0 13.8V8.7h6.5v6z" />
        </svg>
    ),
    macos: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.2 8.5c0-2 1.6-3 1.7-3.1-0.9-1.4-2.4-1.6-2.9-1.6-1.2-0.1-2.4 0.7-3 0.7s-1.6-0.7-2.6-0.7C3.8 3.8 2.3 4.8 1.4 6.4c-1.8 3.1-0.5 7.7 1.3 10.2 0.8 1.2 1.8 2.6 3.2 2.5 1.3-0.1 1.7-0.8 3.3-0.8 1.5 0 1.9 0.8 3.2 0.8s2.2-1.2 3.1-2.4c1-1.4 1.4-2.7 1.4-2.8C16.8 13.9 12.2 12.1 12.2 8.5zM9.9 2.5c0.7-0.9 1.2-2.1 1-3.3-1 0-2.2 0.7-2.9 1.5-0.6 0.7-1.2 2-1 3.1C8.1 3.9 9.2 3.3 9.9 2.5z" transform="scale(0.75) translate(1.5, 2)" />
        </svg>
    ),
    linux: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1C5.8 1 4 2.8 4 5v2.5c-1 .5-2 1.5-2 3 0 1.1.9 2 2 2h.5c.3.9 1.1 1.5 2 1.5h3c.9 0 1.7-.6 2-1.5H12c1.1 0 2-.9 2-2 0-1.5-1-2.5-2-3V5c0-2.2-1.8-4-4-4zm-2 4c0-1.1.9-2 2-2s2 .9 2 2v2H6V5zm-1.5 5.5a.5.5 0 110-1 .5.5 0 010 1zm3 1a.5.5 0 110-1 .5.5 0 010 1zm1 0a.5.5 0 110-1 .5.5 0 010 1zm3-1a.5.5 0 110-1 .5.5 0 010 1z" />
        </svg>
    ),
};

function getConfigFilePath(client: string, platform: string): string {
    const paths: Record<string, Record<string, string>> = {
        'claude-desktop': {
            windows: '%APPDATA%\\Claude\\claude_desktop_config.json',
            macos: '~/Library/Application Support/Claude/claude_desktop_config.json',
            linux: '~/.config/Claude/claude_desktop_config.json',
        },
        cursor: {
            windows: '%USERPROFILE%\\.cursor\\mcp.json',
            macos: '~/.cursor/mcp.json',
            linux: '~/.cursor/mcp.json',
        },
        generic: {
            windows: 'mcp_config.json',
            macos: 'mcp_config.json',
            linux: 'mcp_config.json',
        },
    };
    return paths[client]?.[platform] || paths[client]?.windows || 'config.json';
}

function getNpmPackage(tool: ToolInfo): string {
    const snippet = tool.configSnippet as any;
    if (snippet?.args && Array.isArray(snippet.args)) {
        const yIdx = snippet.args.indexOf('-y');
        if (yIdx >= 0 && snippet.args[yIdx + 1]) {
            return snippet.args[yIdx + 1];
        }
    }
    return tool.installCommand?.replace('npx -y ', '') || tool.name.toLowerCase();
}

interface ConfigResult {
    client: string;
    config: Record<string, unknown>;
    tools: ToolInfo[];
}

function ConfigureContent() {
    const searchParams = useSearchParams();
    const initialTools = searchParams.get('tools')?.split(',').filter(Boolean) || [];

    const [selectedToolIds, setSelectedToolIds] = useState<string[]>(initialTools);
    const [client, setClient] = useState<'claude-desktop' | 'cursor' | 'generic'>('claude-desktop');
    const [config, setConfig] = useState<ConfigResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [allTools, setAllTools] = useState<ToolInfo[]>([]);
    const [visibleTools, setVisibleTools] = useState<ToolInfo[]>([]);
    const [isScanning, setIsScanning] = useState(true);
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch and simulate real-time discovery
    useEffect(() => {
        let isMounted = true;
        setIsScanning(true);
        setVisibleTools([]); // Clear on mount

        fetch('/api/tools')
            .then((res) => res.json())
            .then((data) => {
                if (!isMounted) return;
                const tools = data.tools as ToolInfo[];
                setAllTools(tools);

                // Simulate "Live Discovery" after a short scan period
                setTimeout(() => {
                    if (!isMounted) return;
                    setIsScanning(false);
                    // Staggered entry
                    tools.forEach((tool, index) => {
                        setTimeout(() => {
                            if (!isMounted) return;
                            setVisibleTools(prev => {
                                // De-duplicate just in case timers overlap
                                if (prev.some(t => t.id === tool.id)) return prev;
                                return [...prev, tool];
                            });
                        }, index * 100);
                    });
                }, 1500);
            })
            .catch(console.error);

        return () => {
            isMounted = false;
        };
    }, []);

    // Detect Platform
    const [platform, setPlatform] = useState<'windows' | 'macos' | 'linux' | 'mobile' | 'unknown'>('unknown');

    useEffect(() => {
        const detectPlatform = () => {
            const ua = window.navigator.userAgent.toLowerCase();
            const platformStr = (window.navigator as any).platform?.toLowerCase() || '';

            // Check for mobile first
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
            if (isMobile) return 'mobile';

            // More aggressive Windows detection
            if (ua.includes('windows') || ua.includes('win32') || platformStr.includes('win')) {
                return 'windows';
            }
            if (ua.includes('macintosh') || ua.includes('mac os x') || platformStr.includes('mac')) {
                return 'macos';
            }
            if (ua.includes('linux') || platformStr.includes('linux')) {
                return 'linux';
            }
            return 'unknown';
        };
        const detected = detectPlatform();
        console.log('[DEBUG] Detected Platform:', detected);
        setPlatform(detected);
    }, []);

    // Custom configuration options
    const [filesystemPath, setFilesystemPath] = useState('');

    useEffect(() => {
        if (platform === 'windows' || platform === 'macos' || platform === 'linux') {
            setFilesystemPath('<ENTER_DIRECTORY_PATH>');
        } else {
            setFilesystemPath('');
        }
    }, [platform]);

    // Generate config whenever selection changes
    useEffect(() => {
        if (selectedToolIds.length === 0) {
            if (config !== null) setConfig(null);
            return;
        }

        setLoading(true);
        fetch('/api/generate-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                toolIds: selectedToolIds,
                client,
                platform,
                configOptions: { filesystemPath }
            }),
        })
            .then((res) => res.json())
            .then((data) => setConfig(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedToolIds, client, platform, filesystemPath]);

    const toggleTool = (id: string) => {
        setSelectedToolIds((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const filteredTools = visibleTools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopy = () => {
        if (config) {
            navigator.clipboard.writeText(JSON.stringify(config.config, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (config) {
            const blob = new Blob([JSON.stringify(config.config, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filenames: Record<string, string> = {
                'claude-desktop': 'claude_desktop_config.json',
                cursor: 'mcp.json',
                generic: 'mcp_config.json',
            };
            a.download = filenames[client] || 'config.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const clients = [
        { id: 'claude-desktop' as const, name: 'Claude Desktop', icon: '🤖' },
        { id: 'cursor' as const, name: 'Cursor', icon: '⚡' },
        { id: 'generic' as const, name: 'Generic MCP', icon: '🔧' },
    ];

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Configure Your Tools</h1>
                    <p className={styles.subtitle}>
                        Select tools and generate a ready-to-use configuration file
                    </p>
                </div>

                <div className={styles.layout}>
                    {platform === 'mobile' && (
                        <div className={styles.mobileAlert}>
                            <span className={styles.mobileAlertIcon}>📱</span>
                            <div className={styles.mobileAlertContent}>
                                <strong className={styles.mobileAlertTitle}>Desktop Recommended</strong>
                                <p className={styles.mobileAlertText}>
                                    MCP tools are designed to run locally on your desktop.
                                    Switch to Windows, macOS, or Linux to use these configurations.
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Left: Tool Selector */}
                    <div className={styles.selectorPanel}>
                        <div className={styles.platformSelector}>
                            {(['windows', 'macos', 'linux'] as const).map((p) => (
                                <button
                                    key={p}
                                    className={`${styles.platformItem} ${platform === p ? styles.platformActive : ''}`}
                                    onClick={() => setPlatform(p)}
                                >
                                    <span className={styles.platformIcon}>{OS_ICONS[p]}</span>
                                    <span className={styles.platformName}>{p === 'macos' ? 'macOS' : p.charAt(0).toUpperCase() + p.slice(1)}</span>
                                </button>
                            ))}
                        </div>

                        <div className={styles.networkStatus}>
                            <div className={styles.statusDot} />
                            <span className={styles.statusLabel}>Mesh Synchronized</span>
                        </div>

                        <h2 className={styles.panelTitle}>Select Tools</h2>

                        {!isScanning && (
                            <div className={styles.searchContainer}>
                                <svg className={styles.searchIconSmall} width="16" height="16" viewBox="0 0 20 20" fill="none">
                                    <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Navigate the tool mesh..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}

                        <div className={styles.toolsList}>
                            {isScanning ? (
                                <div className={styles.scanningOverlay}>
                                    <div className={styles.scanPulse}>
                                        <div className={styles.pulseCircle} />
                                        <div className={styles.pulseCircle} />
                                        <span className={styles.scanIcon}>📡</span>
                                    </div>
                                    <div className={styles.scanText}>Scanning for Live MCP Servers...</div>
                                    <div className={styles.scanSubtext}>Mesh IDs: node-alpha, node-beta, node-gamma</div>
                                </div>
                            ) : (
                                filteredTools.map((tool, index) => (
                                    <button
                                        key={tool.id}
                                        className={`${styles.toolItem} ${selectedToolIds.includes(tool.id) ? styles.toolSelected : ''}`}
                                        onClick={() => toggleTool(tool.id)}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className={styles.toolItemInfo}>
                                            <span className={styles.toolItemName}>{tool.name}</span>
                                            <span className={styles.toolItemCategory}>{tool.category}</span>
                                        </div>
                                        <div className={`${styles.toolItemCheck} ${selectedToolIds.includes(tool.id) ? styles.checked : ''}`}>
                                            {selectedToolIds.includes(tool.id) && (
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className={styles.previewPanel}>
                        <h2 className={styles.panelTitle}>Target Client</h2>
                        <div className={styles.clientPicker}>
                            {clients.map((c) => (
                                <button
                                    key={c.id}
                                    className={`${styles.clientBtn} ${client === c.id ? styles.clientActive : ''}`}
                                    onClick={() => setClient(c.id)}
                                >
                                    <span className={styles.clientIcon}>{c.icon}</span>
                                    <span>{c.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Config Preview */}
                        <div className={styles.previewHeader}>
                            <h2 className={styles.panelTitle}>Configuration Preview</h2>
                            {config && (
                                <div className={styles.previewActions}>
                                    <button className={`btn btn-ghost btn-sm`} onClick={handleCopy}>
                                        {copied ? '✓ Copied' : 'Copy'}
                                    </button>
                                    <button className={`btn btn-primary btn-sm`} onClick={handleDownload}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M7 2V9M7 9L4 6M7 9L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M2 11H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.previewCode}>
                            {loading ? (
                                <div className={styles.previewLoading}>
                                    <div className={styles.spinnerSmall} />
                                    <span>Generating configuration...</span>
                                </div>
                            ) : config ? (
                                <pre className={styles.codeContent}>{JSON.stringify(config.config, null, 2)}</pre>
                            ) : (
                                <div className={styles.previewEmpty}>
                                    <p>Select tools from the left panel to generate a configuration file.</p>
                                </div>
                            )}
                        </div>

                        {config && (
                            <div className={styles.selectedSummary}>
                                <div className={styles.summaryHeader}>
                                    <span className={styles.summaryLabel}>Selected Tools</span>
                                    <span className={styles.summaryCount}>
                                        {selectedToolIds.length} tool{selectedToolIds.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className={styles.selectedToolsCards}>
                                    {selectedToolIds.map(id => {
                                        const tool = allTools.find(t => t.id === id);
                                        if (!tool) return null;
                                        return (
                                            <div key={id} className={styles.selectedToolCard}>
                                                <div className={styles.toolCardHeader}>
                                                    <div className={styles.toolCardTitleInfo}>
                                                        <span className={styles.toolCardName}>{tool.name}</span>
                                                        <span className={styles.toolCardCategory}>{tool.category}</span>
                                                    </div>
                                                    <button
                                                        className={styles.removeCardBtn}
                                                        onClick={() => toggleTool(id)}
                                                        title="Remove from config"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                                                            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className={styles.toolCardBody}>
                                                    <p className={styles.toolCardDescription}>{tool.description}</p>

                                                    <div className={styles.toolMeta}>
                                                        <div className={styles.metaItem}>
                                                            <span className={styles.metaLabel}>Package</span>
                                                            <div className={styles.metaValueRow}>
                                                                <code className={styles.metaCode}>{getNpmPackage(tool)}</code>
                                                                <button
                                                                    className={styles.copySmallBtn}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigator.clipboard.writeText(getNpmPackage(tool));
                                                                    }}
                                                                    title="Copy package name"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className={styles.metaItem}>
                                                            <span className={styles.metaLabel}>Config Path</span>
                                                            <code className={styles.metaCode}>{getConfigFilePath(client, platform)}</code>
                                                        </div>
                                                        <div className={styles.metaItem}>
                                                            <span className={styles.metaLabel}>Run Command</span>
                                                            <div className={styles.metaValueRow}>
                                                                <code className={styles.metaCode}>{tool.installCommand || `npx -y ${getNpmPackage(tool)}`}</code>
                                                                <button
                                                                    className={styles.copySmallBtn}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigator.clipboard.writeText(tool.installCommand || `npx -y ${getNpmPackage(tool)}`);
                                                                    }}
                                                                    title="Copy command"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={styles.usageInstructions}>
                                                        <span className={styles.usageLabel}>Setup Notes</span>
                                                        <p className={styles.usageText}>
                                                            {tool.setupGuide || "Standard MCP server setup. No special credentials required."}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={styles.toolCardActions}>
                                                    {tool.repository && (
                                                        <a
                                                            href={tool.repository}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.docLink}
                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                                <line x1="10" y1="14" x2="21" y2="3"></line>
                                                            </svg>
                                                            View Documentation
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ConfigurePage() {
    return (
        <Suspense fallback={<div className={styles.page}><div className="container"><p style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>Loading...</p></div></div>}>
            <ConfigureContent />
        </Suspense>
    );
}
