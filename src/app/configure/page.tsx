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
        if (selectedToolIds.length === 0 || platform === 'unknown' || platform === 'mobile') {
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
        {
            id: 'claude-desktop' as const, name: 'Claude Desktop', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <title>Claude</title>
                    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
                </svg>
            )
        },
        {
            id: 'cursor' as const, name: 'Cursor', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <title>Cursor</title>
                    <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
                </svg>
            )
        },
        {
            id: 'generic' as const,
            name: 'Generic MCP',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
            )
        },
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
                        <div className={styles.osBar}>
                            <span className={styles.osLabel}>OS:</span>
                            {(['windows', 'macos', 'linux'] as const).map((p) => (
                                <button
                                    key={p}
                                    className={`${styles.osBtn} ${platform === p ? styles.osBtnActive : ''}`}
                                    onClick={() => setPlatform(platform === p ? 'unknown' : p)}
                                >
                                    {p === 'macos' ? 'Macos' : p.charAt(0).toUpperCase() + p.slice(1)}
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
                            ) : platform === 'unknown' || platform === 'mobile' ? (
                                <div className={styles.previewEmpty}>
                                    <p>Select an OS to generate a configuration file.</p>
                                </div>
                            ) : (
                                <div className={styles.previewEmpty}>
                                    <p>Select tools from the left panel to generate a configuration file.</p>
                                </div>
                            )}
                        </div>

                        {selectedToolIds.length > 0 && (
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
