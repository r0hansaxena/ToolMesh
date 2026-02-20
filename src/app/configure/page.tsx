'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

interface ToolInfo {
    id: string;
    name: string;
    category: string;
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
    const [copied, setCopied] = useState(false);

    // Fetch all tools for the selector
    useEffect(() => {
        fetch('/api/tools')
            .then((res) => res.json())
            .then((data) => setAllTools(data.tools))
            .catch(console.error);
    }, []);

    // Generate config whenever selection changes
    useEffect(() => {
        if (selectedToolIds.length === 0) {
            setConfig(null);
            return;
        }

        setLoading(true);
        fetch('/api/generate-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ toolIds: selectedToolIds, client }),
        })
            .then((res) => res.json())
            .then((data) => setConfig(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedToolIds, client]);

    const toggleTool = (id: string) => {
        setSelectedToolIds((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

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
                    {/* Left: Tool Selector */}
                    <div className={styles.selectorPanel}>
                        <h2 className={styles.panelTitle}>Select Tools</h2>
                        <div className={styles.toolsList}>
                            {allTools.map((tool) => (
                                <button
                                    key={tool.id}
                                    className={`${styles.toolItem} ${selectedToolIds.includes(tool.id) ? styles.toolSelected : ''}`}
                                    onClick={() => toggleTool(tool.id)}
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
                            ))}
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className={styles.previewPanel}>
                        {/* Client Picker */}
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
                                <span className={styles.summaryLabel}>
                                    {selectedToolIds.length} tool{selectedToolIds.length !== 1 ? 's' : ''} selected
                                </span>
                                <span className={styles.summaryClient}>
                                    Target: {clients.find((c) => c.id === client)?.name}
                                </span>
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
