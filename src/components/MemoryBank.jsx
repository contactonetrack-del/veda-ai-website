import React, { useState, useEffect } from 'react';
import { Trash2, Database, Search, Cpu } from 'lucide-react';
import { getMemories, deleteMemory, clearMemory } from '../services/api'; // I need to add these to api.js
import './MemoryBank.css'; // I need to create this CSS

const MemoryBank = ({ user }) => {
    const [memories, setMemories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMemories();
        }
    }, [user]);

    const fetchMemories = async () => {
        setIsLoading(true);
        try {
            const data = await getMemories(user.id);
            setMemories(data);
        } catch (error) {
            console.error("Failed to load memories", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteMemory(user.id, id);
            setMemories(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Failed to delete memory", error);
        }
    };

    const handleClearAll = async () => {
        if (window.confirm("Are you sure you want to wipe all long-term memory? This cannot be undone.")) {
            try {
                await clearMemory(user.id);
                setMemories([]);
            } catch (error) {
                console.error("Failed to clear memory", error);
            }
        }
    };

    return (
        <div className="memory-bank-container">
            <div className="memory-header">
                <h3><Cpu size={20} /> Neural Memory Bank</h3>
                <button className="clear-btn" onClick={handleClearAll} title="Clear All Memory">
                    <Trash2 size={16} /> Wipe
                </button>
            </div>

            <div className="memory-stats">
                <span>{memories.length} Active Vectors</span>
            </div>

            <div className="memory-list">
                {isLoading ? (
                    <div className="loading-spinner">Accessing Neural Core...</div>
                ) : memories.length === 0 ? (
                    <div className="empty-state">No long-term memories stored yet.</div>
                ) : (
                    memories.map(mem => (
                        <div key={mem.id} className="memory-item">
                            <div className="memory-content">{mem.text}</div>
                            <div className="memory-meta">
                                <span className="memory-role">{mem.metadata?.role || 'assistant'}</span>
                                <span className="memory-date">
                                    {new Date(mem.created_at).toLocaleDateString()}
                                </span>
                                <button className="delete-mem-btn" onClick={() => handleDelete(mem.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MemoryBank;
