'use client';

import { useState } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onSearch: (query: string) => void;
    loading?: boolean;
    placeholder?: string;
    large?: boolean;
}

export default function SearchBar({ onSearch, loading, placeholder, large }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`${styles.wrapper} ${large ? styles.large : ''} ${loading ? styles.loading : ''}`}>
            <div className={styles.inputContainer}>
                <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder || 'Describe what you need...'}
                    className={styles.input}
                    disabled={loading}
                />
                {loading && (
                    <div className={styles.spinner}>
                        <div className={styles.spinnerInner} />
                    </div>
                )}
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn} ${large ? 'btn-lg' : ''}`} disabled={loading || !query.trim()}>
                {loading ? 'Running Consensus...' : 'Search'}
            </button>
        </form>
    );
}
