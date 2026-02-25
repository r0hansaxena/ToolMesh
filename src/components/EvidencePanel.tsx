'use client';

import styles from './EvidencePanel.module.css';
import { NodeVote } from '@/lib/types';

interface EvidencePanelProps {
    votes: NodeVote[];
    reasoning: string;
}

export default function EvidencePanel({ votes, reasoning }: EvidencePanelProps) {
    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" stroke="var(--accent-primary-light)" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="2" fill="var(--accent-primary-light)" />
                </svg>
                <span className={styles.title}>Consensus Evidence</span>
            </div>

            <p className={styles.reasoning}>{reasoning}</p>

            <div className={styles.votesGrid}>
                {votes.map((vote) => (
                    <div
                        key={vote.nodeId}
                        className={`${styles.vote} ${vote.approved ? styles.approved : styles.rejected}`}
                    >
                        <div className={styles.voteHeader}>
                            <div className={styles.voteNode}>
                                <div className={`${styles.voteDot} ${vote.approved ? styles.dotApproved : styles.dotRejected}`} />
                                <span className={styles.voteName}>{vote.nodeName}</span>
                            </div>
                            <span className={styles.voteScore}>{Math.round(vote.score * 100)}%</span>
                        </div>
                        <div className={styles.voteBar}>
                            <div
                                className={styles.voteBarFill}
                                style={{
                                    width: `${vote.score * 100}%`,
                                    background: vote.approved ? 'var(--accent-success)' : 'var(--accent-danger)',
                                }}
                            />
                        </div>
                        <div className={styles.voteMeta}>
                            <span className={styles.voteRegion}>{vote.region}</span>
                            <span className={styles.voteLatency}>{vote.latency}ms</span>
                        </div>
                        <p className={styles.voteReasoning}>{vote.reasoning}</p>

                        {vote.signature && (
                            <div className={styles.signatureRow}>
                                <span className={styles.signatureLabel}>Signature:</span>
                                <span className={styles.signatureValue} title={vote.signature}>
                                    {vote.signature.substring(0, 16)}...
                                </span>
                            </div>
                        )}
                        <div className={styles.voteTimestamp}>
                            {new Date(vote.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
