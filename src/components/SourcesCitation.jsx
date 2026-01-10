/**
 * Sources Citation Component
 * Phase 1: Perplexity-class Intelligence
 * Displays web search sources/citations for AI responses
 */
import React from 'react';
import { ExternalLink, Globe, AlertTriangle, Search, Activity, Wrench } from 'lucide-react';
import './SourcesCitation.css';

/**
 * Display source citations from search results
 */
export function SourcesCitation({ sources = [], isFallback = false, fallbackReason = '' }) {
    // Filter out sources without URLs (like AI summaries)
    const citableSources = sources.filter(s => s.url);

    if (citableSources.length === 0 && !isFallback) {
        return null;
    }

    return (
        <div className="sources-container">
            {citableSources.length > 0 && (
                <>
                    <div className="sources-header">
                        <Globe size={12} />
                        <span>Sources</span>
                    </div>
                    <div className="sources-list">
                        {citableSources.map((source, index) => (
                            <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="source-chip"
                                title={source.title}
                            >
                                {source.favicon ? (
                                    <img
                                        src={source.favicon}
                                        alt=""
                                        className="source-favicon"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <span className="source-number">{index + 1}</span>
                                )}
                                <span className="source-title">
                                    {source.title || new URL(source.url).hostname}
                                </span>
                                <ExternalLink className="source-external-icon" />
                            </a>
                        ))}
                    </div>
                </>
            )}

            {isFallback && (
                <div className="fallback-notice">
                    <AlertTriangle size={14} />
                    <span>
                        {fallbackReason === 'search_quota_exceeded'
                            ? 'Search quota exceeded. Response based on AI knowledge.'
                            : 'Answered from AI knowledge base.'}
                    </span>
                </div>
            )}
        </div>
    );
}

/**
 * Agent badge to show which agent handled the query
 */
export function AgentBadge({ agent, intent }) {
    const getAgentStyle = () => {
        switch (intent) {
            case 'search':
                return 'search';
            case 'wellness':
                return 'wellness';
            case 'tool':
                return 'tools';
            default:
                return '';
        }
    };

    const getAgentIcon = () => {
        switch (intent) {
            case 'search':
                return <Search size={10} />;
            case 'wellness':
                return <Activity size={10} />;
            case 'tool':
                return <Wrench size={10} />;
            default:
                return null;
        }
    };

    const getAgentLabel = () => {
        if (!agent) return null;
        return agent.replace('Agent', '');
    };

    if (!agent) return null;

    return (
        <span className={`agent-badge ${getAgentStyle()}`}>
            {getAgentIcon()}
            {getAgentLabel()}
        </span>
    );
}

export default SourcesCitation;
