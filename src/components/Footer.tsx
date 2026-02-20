import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.left}>
                    <span className={styles.brand}>ToolMesh</span>
                    <span className={styles.separator}>·</span>
                    <span className={styles.tagline}>Decentralized MCP Marketplace</span>
                </div>
                <div className={styles.right}>
                    <span className={styles.powered}>
                        Powered by{' '}
                        <a href="https://cortensor.network" target="_blank" rel="noopener noreferrer" className={styles.cortensor}>
                            Cortensor
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
