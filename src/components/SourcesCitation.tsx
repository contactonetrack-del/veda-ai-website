import React from 'react';
import { ExternalLink, Globe, AlertTriangle, Search, Activity, Wrench } from 'lucide-react';

interface Source {
    url: string;
    title?: string;
    favicon?: string;
}

interface SourcesCitationProps {
    sources: Source[];
    isFallback?: boolean;
    fallbackReason?: string;
    verified?: boolean;
    confidence?: number;
}

export function SourcesCitation({
    sources = [],
    isFallback = false,
    fallbackReason = '',
    verified = false,
    confidence = 0.0
}: SourcesCitationProps) {
    const citableSources = sources.filter(s => s.url);

    if (citableSources.length === 0 && !isFallback) {
        return null;
    }

    return (
        <div className="mt-2 text-sm">
            {verified && (confidence || 0) >= 0.6 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-xs font-medium mb-2 border border-emerald-900/50">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Fact-Checked ({Math.round((confidence || 0) * 100)}% confidence)</span>
                </div>
            )}

            {citableSources.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400 uppercase tracking-wider text-xs font-bold">
                        <Globe size={12} />
                        <span>Sources</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {citableSources.map((source, index) => (
                            <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition-colors group"
                                title={source.title}
                            >
                                <div className="w-5 h-5 flex items-center justify-center bg-slate-700 rounded text-slate-400 text-xs font-mono group-hover:bg-slate-600">
                                    {source.favicon ? (
                                        <img
                                            src={source.favicon}
                                            alt=""
                                            className="w-4 h-4 rounded-sm"
                                            onError={(e: any) => e.target.style.display = 'none'}
                                        />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className="flex-1 truncate text-slate-300 group-hover:text-emerald-300 font-medium text-xs">
                                    {source.title || new URL(source.url).hostname}
                                </span>
                                <ExternalLink size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {isFallback && (
                <div className="mt-2 flex items-center gap-2 text-yellow-500 bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-900/30 text-xs">
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

export function AgentBadge({ agent, intent }: { agent: string; intent?: string }) {
    const getAgentStyle = () => {
        switch (intent) {
            case 'search': return 'bg-blue-900/50 text-blue-400 border-blue-800';
            case 'wellness': return 'bg-emerald-900/50 text-emerald-400 border-emerald-800';
            case 'tool': return 'bg-purple-900/50 text-purple-400 border-purple-800';
            case 'research': return 'bg-orange-900/50 text-orange-400 border-orange-800';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    const getAgentIcon = () => {
        switch (intent) {
            case 'search': return <Search size={10} />;
            case 'wellness': return <Activity size={10} />;
            case 'tool': return <Wrench size={10} />;
            case 'research': return <Globe size={10} />;
            default: return null;
        }
    };

    const getAgentLabel = () => {
        if (!agent) return null;
        return agent.replace('Agent', '');
    };

    if (!agent) return null;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getAgentStyle()}`}>
            {getAgentIcon()}
            {getAgentLabel()}
        </span>
    );
}
