'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import styles from './page.module.css';

const FEATURES = [
  {
    title: 'Decentralized Consensus',
    description: 'Every recommendation runs through 7 Cortensor nodes simultaneously. No single model bias.',
  },
  {
    title: 'Transparent Evidence',
    description: 'See which nodes agreed, confidence scores, and reasoning behind every decision.',
  },
  {
    title: 'One-Click Config',
    description: 'Generate ready-to-use JSON configs for Claude Desktop, Cursor, and more.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string) => {
    setLoading(true);
    router.push(`/discover?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            <span>NETWORK OPERATIONAL</span>
          </div>

          <h1 className={styles.headline}>
            Discover MCP Tools
            <br />
            <span className={styles.headlineItalic}>
              with <span className="accent-text">decentralized consensus.</span>
            </span>
          </h1>

          <p className={styles.subheadline}>
            The first trust-verified marketplace for AI tool discovery.
            <br />
            Powered by Cortensor&apos;s distributed inference network.
          </p>

          <div className={styles.ctaRow}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/discover')}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Start Discovering
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push('/docs')}>
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* ── Terminal Preview ──────────────────────────────────── */}
      <section className={styles.terminalSection}>
        <div className="container">
          <div className={styles.terminalGrid}>
            {/* Left terminal — search query */}
            <div className="terminal">
              <div className="terminal-header">
                <span className="terminal-dot" />
                <span className="terminal-dot" />
                <span className="terminal-dot" />
                <span className="terminal-title">search.ts</span>
              </div>
              <div className="terminal-body">
                <div><span className="keyword">import</span> {'{'} ToolMesh {'}'} <span className="keyword">from</span> <span className="string">&apos;@toolmesh/sdk&apos;</span>;</div>
                <br />
                <div><span className="keyword">const</span> mesh = <span className="keyword">new</span> <span className="highlight">ToolMesh</span>({'{'}</div>
                <div>&nbsp;&nbsp;network: <span className="string">&quot;cortensor_mainnet&quot;</span>,</div>
                <div>&nbsp;&nbsp;nodes: <span className="number">7</span>,  <span className="comment">{'// distributed consensus'}</span></div>
                <div>{'}'});</div>
                <br />
                <div><span className="keyword">const</span> results = <span className="keyword">await</span> mesh.<span className="highlight">discover</span>({'{'}</div>
                <div>&nbsp;&nbsp;query: <span className="string">&quot;database management tools&quot;</span>,</div>
                <div>&nbsp;&nbsp;minConfidence: <span className="number">0.75</span></div>
                <div>{'}'});</div>
              </div>
            </div>

            {/* Right terminal — CLI output */}
            <div className="terminal">
              <div className="terminal-header">
                <span className="terminal-dot" />
                <span className="terminal-dot" />
                <span className="terminal-dot" />
                <span className="terminal-title">toolmesh-cli</span>
              </div>
              <div className="terminal-body">
                <div><span className="prompt">&gt;</span> <span className="highlight">Initializing ToolMesh...</span></div>
                <div><span className="prompt">&gt;</span> Connected to Cortensor Network</div>
                <div><span className="prompt">&gt;</span> Broadcasting to <span className="number">7</span> nodes...</div>
                <div><span className="prompt">&gt;</span> Consensus reached in <span className="number">847</span>ms</div>
                <div><span className="prompt">&gt;</span> Agreement: <span className="string">94%</span> (<span className="number">6</span>/<span className="number">7</span> nodes)</div>
                <br />
                <div><span className="prompt">&gt;</span> <span className="highlight">Results:</span></div>
                <div><span className="prompt">&gt;</span> 1. PostgreSQL <span className="string">[93% confidence]</span></div>
                <div><span className="prompt">&gt;</span> 2. SQLite &nbsp;&nbsp;&nbsp;<span className="string">[87% confidence]</span></div>
                <div><span className="prompt">&gt;</span> 3. Redis &nbsp;&nbsp;&nbsp;&nbsp;<span className="string">[81% confidence]</span></div>
                <div><span className={styles.cursor}>▌</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureNumber}>{String(i + 1).padStart(2, '0')}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────── */}
      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>15+</span>
              <span className={styles.statLabel}>MCP Tools</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>7</span>
              <span className={styles.statLabel}>Consensus Nodes</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>&lt;1s</span>
              <span className={styles.statLabel}>Consensus Time</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>100%</span>
              <span className={styles.statLabel}>Auditable</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className={styles.bottomCta}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>
              Ready to build your <span className={styles.headlineItalic}>AI toolkit</span>?
            </h2>
            <p className={styles.ctaDesc}>
              Start discovering tools with trust-verified, decentralized recommendations.
            </p>
            <div className={styles.ctaSearch}>
              <SearchBar
                onSearch={handleSearch}
                loading={loading}
                placeholder="Describe what you need..."
                large
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
