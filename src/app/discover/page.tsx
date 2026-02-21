'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import ToolCard from '@/components/ToolCard';
import ConsensusVisualizer from '@/components/ConsensusVisualizer';
import EvidencePanel from '@/components/EvidencePanel';
import { EvidenceBundle, ConsensusResult } from '@/lib/types';
import styles from './page.module.css';

function DiscoverContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';

    const [loading, setLoading] = useState(false);
    const [evidence, setEvidence] = useState<EvidenceBundle | null>(null);
    const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
    const [expandedTool, setExpandedTool] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = useCallback(async (query: string) => {
        setLoading(true);
        setEvidence(null);
        setExpandedTool(null);
        setHasSearched(true);

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            setEvidence(data);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialQuery) {
            handleSearch(initialQuery);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleTool = (toolId: string) => {
        setSelectedTools((prev) => {
            const next = new Set(prev);
            if (next.has(toolId)) {
                next.delete(toolId);
            } else {
                next.add(toolId);
            }
            return next;
        });
    };

    const handleToolSelect = (toolId: string) => {
        setExpandedTool(expandedTool === toolId ? null : toolId);
    };

    const expandedResult = evidence?.consensusResults.find((r) => r.toolId === expandedTool);

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Discover MCP Tools</h1>
                    <p className={styles.subtitle}>
                        Describe what you need and let Cortensor&apos;s consensus network find the best tools
                    </p>
                </div>

                <div className={styles.searchSection}>
                    <SearchBar
                        onSearch={handleSearch}
                        loading={loading}
                        placeholder="e.g. I need to manage databases and automate browser tasks..."
                        large
                    />
                    {loading && (
                        <div className={styles.liveStatus}>
                            <span className={styles.statusDot}></span>
                            Network active: Live scraping & auditing repositories...
                        </div>
                    )}
                </div>

                <ConsensusVisualizer
                    running={loading}
                    nodesCount={7}
                    completedIn={evidence?.consensusReachedIn}
                    averageLatency={evidence?.averageLatency}
                    agreementPct={
                        evidence
                            ? Math.round(
                                evidence.consensusResults.reduce((sum, r) => sum + r.agreementPercentage, 0) /
                                Math.max(evidence.consensusResults.length, 1)
                            )
                            : undefined
                    }
                />

                {evidence && evidence.consensusResults.length > 0 && (
                    <>
                        <div className={styles.resultsHeader}>
                            <h2 className={styles.resultsTitle}>
                                {evidence.consensusResults.length} tools recommended
                            </h2>
                            <p className={styles.resultsSubtitle}>
                                Consensus from {evidence.totalNodesParticipated} nodes in {evidence.consensusReachedIn}ms
                            </p>
                            {selectedTools.size > 0 && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const ids = Array.from(selectedTools).join(',');
                                        router.push(`/configure?tools=${ids}`);
                                    }}
                                >
                                    Configure {selectedTools.size} tool{selectedTools.size > 1 ? 's' : ''}
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className={styles.resultsGrid}>
                            {evidence.consensusResults.map((result, i) => (
                                <ToolCard
                                    key={result.toolId}
                                    result={result}
                                    index={i}
                                    selected={selectedTools.has(result.toolId)}
                                    onSelect={handleToolSelect}
                                    onAddToConfig={toggleTool}
                                />
                            ))}
                        </div>

                        {expandedResult && (
                            <div className={styles.evidenceSection}>
                                <EvidencePanel
                                    votes={expandedResult.votes}
                                    reasoning={expandedResult.reasoning}
                                />
                            </div>
                        )}
                    </>
                )}

                {hasSearched && !loading && evidence && evidence.consensusResults.length === 0 && (
                    <div className={styles.empty}>
                        <p className={styles.emptyText}>No tools matched your query with sufficient consensus. Try a different description.</p>
                    </div>
                )}

                {!hasSearched && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <circle cx="24" cy="24" r="20" stroke="var(--border-medium)" strokeWidth="1.5" strokeDasharray="4 4" />
                                <circle cx="24" cy="24" r="8" stroke="var(--accent-primary-light)" strokeWidth="1.5" />
                                <path d="M24 16V24L30 30" stroke="var(--accent-primary-light)" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className={styles.emptyTitle}>Start Your Search</h3>
                        <p className={styles.emptyDescription}>
                            Type a natural language description of the tools you need.
                            Our consensus network will analyze and recommend the best options.
                        </p>
                        <div className={styles.suggestions}>
                            <span className={styles.suggestionsLabel}>Try:</span>
                            {['GitHub & Git tools', 'Database management', 'Web scraping', 'Team communication'].map((s) => (
                                <button
                                    key={s}
                                    className={`btn btn-secondary btn-sm`}
                                    onClick={() => handleSearch(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={<div className={styles.page}><div className="container"><p style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>Loading...</p></div></div>}>
            <DiscoverContent />
        </Suspense>
    );
}
