/**
 * Language Selector Component
 * Clean, flat list design without zone grouping
 */

import { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getSavedLanguage, saveLanguage } from '../services/api';
import './LanguageSelector.css';

// Clean language display names
const LANGUAGES = Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => ({
    code,
    name: lang.name,
    beta: lang.beta
}));

function LanguageSelector({ selectedLanguage, onLanguageChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

    const handleSelect = (code) => {
        saveLanguage(code);
        onLanguageChange(code);
        setIsOpen(false);
    };

    return (
        <div className="language-selector">
            <button
                className="language-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Globe size={18} />
                <span>{currentLang.name.split(' ')[0]}</span>
                <ChevronDown size={16} className={isOpen ? 'rotated' : ''} />
            </button>

            {isOpen && (
                <div className="language-dropdown">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className={`language-option ${selectedLanguage === lang.code ? 'selected' : ''}`}
                            onClick={() => handleSelect(lang.code)}
                        >
                            <span className="lang-name">{lang.name}</span>
                            {lang.beta && <span className="beta-badge">Beta</span>}
                            {selectedLanguage === lang.code && <Check size={16} className="check-icon" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSelector;
