import { ConsensusResult } from '@/lib/types';
import styles from './ToolCard.module.css';

interface ToolCardProps {
    result: ConsensusResult;
    onSelect?: (toolId: string) => void;
    onAddToConfig?: (toolId: string) => void;
    selected?: boolean;
    index?: number;
}

export default function ToolCard({ result, onSelect, onAddToConfig, selected, index = 0 }: ToolCardProps) {
    const { tool, confidenceScore, agreementPercentage, approvingNodes, totalNodes } = result;

    const getConfidenceColor = (score: number) => {
        if (score >= 0.75) return 'var(--accent-success)';
        if (score >= 0.55) return 'var(--accent-warning)';
        return 'var(--accent-danger)';
    };

    return (
        <div
            className={`${styles.card} ${selected ? styles.selected : ''} animate-fadeInUp stagger-${index + 1}`}
            onClick={() => onSelect?.(tool.id)}
        >
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <h3 className={styles.name}>{tool.name}</h3>
                    {tool.verified && (
                        <span className="badge badge-success">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <path d="M8.5 3L4 7.5L1.5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Verified
                        </span>
                    )}
                </div>
                <span className="badge badge-primary">{tool.category}</span>
            </div>

            <p className={styles.description}>{tool.description}</p>

            <div className={styles.metrics}>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Confidence</span>
                    <div className={styles.confidenceBar}>
                        <div
                            className={styles.confidenceFill}
                            style={{
                                width: `${confidenceScore * 100}%`,
                                background: getConfidenceColor(confidenceScore),
                            }}
                        />
                    </div>
                    <span className={styles.metricValue} style={{ color: getConfidenceColor(confidenceScore) }}>
                        {Math.round(confidenceScore * 100)}%
                    </span>
                </div>

                <div className={styles.metricRow}>
                    <div className={styles.metricSmall}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="5" stroke="var(--text-tertiary)" strokeWidth="1.2" />
                            <circle cx="7" cy="7" r="2" fill="var(--accent-primary-light)" />
                        </svg>
                        <span>{approvingNodes}/{totalNodes} nodes</span>
                    </div>
                    <div className={styles.metricSmall}>
                        <span className={styles.agreement}>{agreementPercentage}% agreement</span>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.tags}>
                    {tool.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="badge badge-secondary">{tag}</span>
                    ))}
                </div>
                {onAddToConfig && (
                    <button
                        className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToConfig(tool.id);
                        }}
                    >
                        {selected ? '✓ Added' : '+ Add to Config'}
                    </button>
                )}
            </div>
        </div>
    );
}
