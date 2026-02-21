'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const DOC_SECTIONS = [
    {
        id: 'introduction',
        title: 'Introduction',
        content: (
            <>
                <h1 className={styles.sectionTitle}>Introduction to <em>ToolMesh</em></h1>
                <p className={styles.paragraph}>
                    ToolMesh is a decentralized marketplace for Model Context Protocol (MCP) tools,
                    secured by the Cortensor consensus network. It provides developers and AI users
                    with a trustless environment to discover, verify, and configure AI tools.
                </p>
                <div className={styles.infoBox}>
                    <strong>Core Mission:</strong> To bridge the gap between decentralized consensus
                    and practical AI utility through a verified registry of MCP tools.
                </div>
            </>
        )
    },
    {
        id: 'architecture',
        title: 'Architecture',
        content: (
            <>
                <h2 className={styles.sectionTitle}>Integrated <em>Architecture</em></h2>
                <p className={styles.paragraph}>
                    The ToolMesh architecture consists of three primary layers that work in tandem
                    to ensure tool stability and security.
                </p>
                <div className={styles.steps}>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>01</div>
                        <div className={styles.stepContent}>
                            <h3>Tool Registry</h3>
                            <p>A global database of tool metadata, schemas, and execution parameters.</p>
                        </div>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>02</div>
                        <div className={styles.stepContent}>
                            <h3>Cortensor Network</h3>
                            <p>A decentralized validation layer where nodes test tools and provide proof of utility.</p>
                        </div>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>03</div>
                        <div className={styles.stepContent}>
                            <h3>Discovery Client</h3>
                            <p>The ToolMesh frontend where users interact with verified tools and generate configs.</p>
                        </div>
                    </div>
                </div>
            </>
        )
    },
    {
        id: 'mcp-standard',
        title: 'MCP Standard',
        content: (
            <>
                <h2 className={styles.sectionTitle}>The <em>MCP</em> Standard</h2>
                <p className={styles.paragraph}>
                    ToolMesh strictly follows the Model Context Protocol (MCP) standard developed by Anthropic.
                    This ensures total compatibility with clients like Claude Desktop and Cursor.
                </p>
                <div className={styles.terminal}>
                    <div className={styles.terminalHeader}>
                        <div className={styles.terminalDots}>
                            <span className={styles.tDot}></span>
                            <span className={styles.tDot}></span>
                            <span className={styles.tDot}></span>
                        </div>
                        <span className={styles.terminalTitle}>mcp-config.json</span>
                    </div>
                    <div className={styles.terminalBody}>
                        <pre className={styles.code}>
                            {`{
  "mcpServers": {
    "toolmesh-verified": {
      "command": "npx",
      "args": ["-y", "@toolmesh/sdk", "run"],
      "env": {
        "API_KEY": "YOUR_KEY"
      }
    }
  }
}`}
                        </pre>
                    </div>
                </div>
            </>
        )
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        content: (
            <>
                <h2 className={styles.sectionTitle}>Getting <em>Started</em></h2>
                <p className={styles.paragraph}>
                    To begin using ToolMesh, navigate to the <strong>Discover</strong> page to find tools
                    verified by the Cortensor network. Once you find a tool, click the &quot;Configure&quot;
                    button to generate your setup script.
                </p>
                <ul className={styles.list}>
                    <li>Browse verified tools in the Discover tab.</li>
                    <li>Inspect consensus evidence for security assurance.</li>
                    <li>Generate client-specific JSON configurations.</li>
                    <li>Import directly into your favorite AI host.</li>
                </ul>
            </>
        )
    }
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState('introduction');

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -80% 0px',
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        DOC_SECTIONS.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className={styles.docsLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarSection}>
                    <h3 className={styles.sidebarLabel}>ToolMesh Docs</h3>
                    <nav className={styles.sidebarNav}>
                        {DOC_SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setActiveSection(section.id);
                                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`${styles.navItem} ${activeSection === section.id ? styles.navActive : ''}`}
                            >
                                {section.title}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className={styles.sidebarFooter}>
                    <div className={styles.footerNote}>Version 1.0.4 - Mesh Protocol v1.0</div>
                </div>
            </aside>

            <main className={styles.content}>
                {DOC_SECTIONS.map(section => (
                    <section key={section.id} id={section.id} className={styles.docSection}>
                        {section.content}
                        <div className={styles.divider} />
                    </section>
                ))}
            </main>
        </div>
    );
}
