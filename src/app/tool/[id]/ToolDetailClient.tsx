'use client';

import { useRouter } from 'next/navigation';
import { McpTool, ConsensusResult } from '@/lib/types';
import EvidencePanel from '@/components/EvidencePanel';
import styles from './page.module.css';

interface ToolDetailClientProps {
    tool: McpTool;
    result: ConsensusResult | null;
}

export default function ToolDetailClient({ tool, result }: ToolDetailClientProps) {
    const router = useRouter();

    return (
        <div className={styles.page}>
            <div className="container">
                <button className={`btn btn-ghost ${styles.backBtn}`} onClick={() => router.back()}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                </button>

                <div className={styles.hero}>
                    <div className={styles.heroLeft}>
                        <div className={styles.titleRow}>
                            <h1 className={styles.title}>{tool.name}</h1>
                            {tool.verified && (
                                <span className="badge badge-success">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M8.5 3L4 7.5L1.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className={styles.meta}>
                            <span className="badge badge-primary">{tool.category}</span>
                            <span className={styles.metaText}>by {tool.author}</span>
                            <span className={styles.metaText}>v{tool.version}</span>
                            <span className={styles.metaText}>★ {tool.stars.toLocaleString()}</span>
                        </div>
                        <p className={styles.description}>{tool.description}</p>
                    </div>

                    {result && (
                        <div className={styles.heroRight}>
                            <div className={styles.scoreCard}>
                                <div className={styles.scoreValue}>{Math.round(result.confidenceScore * 100)}%</div>
                                <div className={styles.scoreLabel}>Confidence</div>
                                <div className={styles.scoreBar}>
                                    <div
                                        className={styles.scoreBarFill}
                                        style={{ width: `${result.confidenceScore * 100}%` }}
                                    />
                                </div>
                                <div className={styles.scoreMeta}>
                                    {result.approvingNodes}/{result.totalNodes} nodes · {result.agreementPercentage}% agreement
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Install & Config */}
                <div className={styles.sections}>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Installation</h2>
                        <div className={styles.codeBlock}>
                            <code>{tool.installCommand}</code>
                            <button
                                className={`btn btn-ghost btn-sm`}
                                onClick={() => navigator.clipboard.writeText(tool.installCommand)}
                                title="Copy"
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                                    <path d="M10 4V3C10 2.44772 9.55228 2 9 2H3C2.44772 2 2 2.44772 2 3V9C2 9.55228 2.44772 10 3 10H4" stroke="currentColor" strokeWidth="1.2" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Configuration Snippet</h2>
                        <div className={styles.codeBlockLarge}>
                            <pre>{JSON.stringify(tool.configSnippet, null, 2)}</pre>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Tags</h2>
                        <div className={styles.tags}>
                            {tool.tags.map((tag) => (
                                <span key={tag} className="badge badge-secondary">{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Links</h2>
                        <a href={tool.repository} target="_blank" rel="noopener noreferrer" className={`btn btn-secondary`}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                <path d="M7 0C3.13 0 0 3.13 0 7c0 3.1 2.01 5.73 4.79 6.65.35.06.48-.15.48-.34 0-.17-.01-.72-.01-1.31-1.76.33-2.22-.43-2.36-.82-.08-.2-.42-.82-.72-.99-.24-.13-.59-.46-.01-.47.55-.01.94.51 1.07.72.63 1.06 1.64.76 2.04.58.06-.46.25-.76.45-.93-1.56-.18-3.19-.78-3.19-3.46 0-.76.27-1.39.72-1.88-.07-.17-.31-.89.07-1.86 0 0 .59-.19 1.93.72.56-.16 1.16-.24 1.75-.24.6 0 1.2.08 1.75.24 1.34-.91 1.93-.72 1.93-.72.38.97.14 1.69.07 1.86.45.49.72 1.11.72 1.88 0 2.69-1.64 3.28-3.2 3.46.25.22.47.64.47 1.3 0 .93-.01 1.69-.01 1.93 0 .19.13.41.48.34A7.01 7.01 0 0014 7c0-3.87-3.13-7-7-7z" />
                            </svg>
                            Repository
                        </a>
                    </div>
                </div>

                {/* Consensus Evidence */}
                {result && (
                    <div className={styles.evidenceSection}>
                        <h2 className={styles.sectionTitle}>Consensus Evidence</h2>
                        <EvidencePanel votes={result.votes} reasoning={result.reasoning} />
                    </div>
                )}

                {/* Add to Config CTA */}
                <div className={styles.ctaSection}>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => router.push(`/configure?tools=${tool.id}`)}
                    >
                        Generate Config with {tool.name}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
