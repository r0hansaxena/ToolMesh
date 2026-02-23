"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const DOC_SECTIONS = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <>
        <h1 className={styles.sectionTitle}>
          The <em>ToolMesh</em> Paradigm
        </h1>
        <p className={styles.paragraph}>
          ToolMesh represents a fundamental shift in how agentic tools are
          discovered and integrated. Unlike traditional registries that rely on
          centralized curation, ToolMesh operates as a decentralized discovery
          layer for the Model Context Protocol (MCP).
        </p>
        <p className={styles.paragraph}>
          In an ecosystem of rapidly evolving LLM capabilities, the bottleneck
          is no longer the model itself, but the quality and security of the
          tools it accesses. ToolMesh addresses this by utilizing the Cortensor
          network to provide real-time, consensus-driven validation for any
          networked tool.
        </p>
      </>
    ),
  },
  {
    id: "step-1-discover",
    title: "Discovery",
    content: (
      <>
        <h2 className={styles.sectionTitle}>
          Mesh-Based <em>Discovery</em>
        </h2>
        <p className={styles.paragraph}>
          Discovery on ToolMesh is not a static lookup. It is a dynamic process
          where a query is broadcast across the discovery mesh. The network
          performs multi-vector analysis on live repositories, analyzing not
          just manifests, but actual code structures and execution patterns.
        </p>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>01</div>
            <div className={styles.stepContent}>
              <h3>Vector-Space Analysis</h3>
              <p>
                Queries are transformed into embeddings and matched against a
                multi-dimensional index of tool capabilities.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>02</div>
            <div className={styles.stepContent}>
              <h3>Live Registry Synchronization</h3>
              <p>
                The mesh maintains zero-latency synchronization with primary and
                community-led registries, ensuring definitions are never stale.
              </p>
            </div>
          </div>
        </div>
        <div className={`${styles.alert} ${styles.alertInfo}`}>
          <span className={styles.alertIcon}>INTENT</span>
          <span className={styles.alertContent}>
            The discovery engine prioritizes functional compatibility and
            security posture over simple keyword matches.
          </span>
        </div>
      </>
    ),
  },
  {
    id: "step-2-verify",
    title: "Verification",
    content: (
      <>
        <h2 className={styles.sectionTitle}>
          Consensus <em>Validation</em>
        </h2>
        <p className={styles.paragraph}>
          Validation is the core of the ToolMesh trust model. Instead of relying
          on a single audit, recommendations are finalized through a
          Byzantine-fault-tolerant consensus mechanism.
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Node Heterogeneity</strong> 7 independent validator nodes
            with diverse geographic and hardware profiles perform parallel
            audits.
          </li>
          <li>
            <strong>Evidence Bundle Generation</strong> Each node produces a
            detailed report including integrity scores, latency metrics, and
            reasoning strings.
          </li>
          <li>
            <strong>Threshold Consensus</strong> A requisite 75% agreement is
            typically required for a tool to achieve a &quot;High
            Confidence&quot; status.
          </li>
        </ul>
        <p className={styles.paragraph}>
          This multi-node approach ensures that single-model biases or transient
          network issues do not compromise the integrity of the tool
          recommendations.
        </p>
      </>
    ),
  },
  {
    id: "step-3-configure",
    title: "Integration",
    content: (
      <>
        <h2 className={styles.sectionTitle}>
          Automated <em>Provisioning</em>
        </h2>
        <p className={styles.paragraph}>
          Integration converts a verified tool discovery into an actionable
          configuration for any MCP-compatible host. The platform abstracts away
          the complexities of environment variables, npx-based execution, and
          security contexts.
        </p>

        <h3 className={styles.subTitle}>Standardized Manifests</h3>
        <p className={styles.paragraph}>
          The generated output adheres to the universal MCP configuration
          schema, allowing for seamless injection into any compatible
          environment.
        </p>

        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalDots}>
              <span className={styles.tDot}></span>
              <span className={styles.tDot}></span>
              <span className={styles.tDot}></span>
            </div>
            <span className={styles.terminalTitle}>mcp_configuration.json</span>
          </div>
          <div className={styles.terminalBody}>
            <pre className={styles.code}>
              {`{
                "mcpServers": {
                  "verified-resource-name": {
                    command: "node_executor",
                    args: ["manifest_uri", "--mode=secure"],
                    env: {
                      RUNTIME_CONTEXT: "provisioned",
                    },
                  },
                },
              }`}
            </pre>
          </div>
        </div>

        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <span className={styles.alertIcon}>IMPORT</span>
          <span className={styles.alertContent}>
            Ensure the host process is refreshed after injection to serialize
            new tool definitions into the active context.
          </span>
        </div>
      </>
    ),
  },
  {
    id: "architecture",
    title: "Topology",
    content: (
      <>
        <h2 className={styles.sectionTitle}>
          System <em>Topology</em>
        </h2>
        <p className={styles.paragraph}>
          The ToolMesh architecture is designed for high-availability
          decentralized discovery. It operates as a middle-layer between
          fragmented tool sources and unified agentic hosts.
        </p>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>Layer 1</div>
            <div className={styles.stepContent}>
              <h3>Ingestion Layer</h3>
              <p>
                Asynchronous workers scraping registries and normalizing
                heterogeneous tool definitions.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>Layer 2</div>
            <div className={styles.stepContent}>
              <h3>The Mesh</h3>
              <p>
                Cortensor nodes executing validator logic and reaching consensus
                on tool integrity.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>Layer 3</div>
            <div className={styles.stepContent}>
              <h3>API Gateway</h3>
              <p>
                RESTful interface serving verified evidence bundles and
                configuration templates.
              </p>
            </div>
          </div>
        </div>
      </>
    ),
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -79% 0px", // Creates a 1% "sensor line" near the top
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

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
            {DOC_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document
                    .getElementById(section.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`${styles.navItem} ${activeSection === section.id ? styles.navActive : ""}`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.footerNote}>
            Version 1.0.4 - Mesh Protocol v1.0
          </div>
        </div>
      </aside>

      <main className={styles.content}>
        {DOC_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={styles.docSection}
          >
            {section.content}
            <div className={styles.divider} />
          </section>
        ))}
      </main>
    </div>
  );
}
