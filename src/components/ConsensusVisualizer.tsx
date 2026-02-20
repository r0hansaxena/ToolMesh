'use client';

import { useState, useEffect } from 'react';
import styles from './ConsensusVisualizer.module.css';

interface ConsensusVisualizerProps {
    running: boolean;
    nodesCount?: number;
    completedIn?: number;
    averageLatency?: number;
    agreementPct?: number;
}

const NODE_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta'];
const NODE_REGIONS = ['US-E', 'EU-W', 'AS-SE', 'US-W', 'EU-C', 'SA-E', 'AU-E'];

export default function ConsensusVisualizer({
    running,
    nodesCount = 7,
    completedIn,
    averageLatency,
    agreementPct,
}: ConsensusVisualizerProps) {
    const [activeNodes, setActiveNodes] = useState<boolean[]>(new Array(nodesCount).fill(false));
    const [phase, setPhase] = useState<'idle' | 'connecting' | 'voting' | 'consensus'>('idle');

    useEffect(() => {
        if (!running) {
            if (completedIn) {
                setPhase('consensus');
                setActiveNodes(new Array(nodesCount).fill(true));
            }
            return;
        }

        setPhase('connecting');
        const timers: NodeJS.Timeout[] = [];

        // Activate nodes one by one
        for (let i = 0; i < nodesCount; i++) {
            timers.push(
                setTimeout(() => {
                    setActiveNodes((prev) => {
                        const next = [...prev];
                        next[i] = true;
                        return next;
                    });
                }, 200 + i * 150)
            );
        }

        // Switch to voting phase
        timers.push(setTimeout(() => setPhase('voting'), 200 + nodesCount * 150 + 300));

        // Switch to consensus
        timers.push(setTimeout(() => setPhase('consensus'), 200 + nodesCount * 150 + 900));

        return () => timers.forEach(clearTimeout);
    }, [running, nodesCount, completedIn]);

    if (phase === 'idle' && !completedIn) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.statusRow}>
                    <div className={`${styles.statusDot} ${styles[phase]}`} />
                    <span className={styles.statusText}>
                        {phase === 'connecting' && 'Connecting to Cortensor nodes...'}
                        {phase === 'voting' && 'Nodes voting on recommendations...'}
                        {phase === 'consensus' && 'Consensus reached'}
                    </span>
                </div>
                {completedIn && (
                    <div className={styles.stats}>
                        <span className={styles.stat}>{completedIn}ms</span>
                        <span className={styles.statDivider}>·</span>
                        <span className={styles.stat}>{averageLatency}ms avg</span>
                        {agreementPct && (
                            <>
                                <span className={styles.statDivider}>·</span>
                                <span className={styles.stat}>{agreementPct}% agree</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.nodesGrid}>
                {Array.from({ length: nodesCount }).map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.node} ${activeNodes[i] ? styles.nodeActive : ''} ${phase === 'consensus' ? styles.nodeComplete : ''}`}
                    >
                        <div className={styles.nodePulse} />
                        <div className={styles.nodeCore} />
                        <div className={styles.nodeInfo}>
                            <span className={styles.nodeName}>{NODE_NAMES[i]}</span>
                            <span className={styles.nodeRegion}>{NODE_REGIONS[i]}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Connection lines SVG */}
            <svg className={styles.connections} viewBox="0 0 700 60" preserveAspectRatio="none">
                {phase !== 'idle' && (
                    <>
                        <line x1="50" y1="30" x2="650" y2="30" className={`${styles.connectionLine} ${phase !== 'connecting' ? styles.lineActive : ''}`} />
                        {[150, 250, 350, 450, 550].map((x, i) => (
                            <circle key={i} cx={x} cy="30" r="3" className={`${styles.connectionDot} ${activeNodes[i + 1] ? styles.dotActive : ''}`} />
                        ))}
                    </>
                )}
            </svg>
        </div>
    );
}
