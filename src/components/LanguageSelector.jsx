/**
 * Language Selector Component
 * Zone-wise Indian language selector matching mobile app
 */

import { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByZone, getSavedLanguage, saveLanguage } from '../services/api';
import './LanguageSelector.css';

function LanguageSelector({ selectedLanguage, onLanguageChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const zones = getLanguageByZone();
    const currentLang = SUPPORTED_LANGUAGES[selectedLanguage];

    const handleSelect = (code) => {
        saveLanguage(code);
        onLanguageChange(code);
        setIsOpen(false);
    };

    // Language names in English for display
    const LANGUAGE_NAMES = {
        en: 'English',
        hi: 'Hindi (हिंदी)',
        bho: 'Bhojpuri (भोजपुरी) Beta',
        ta: 'Tamil (தமிழ்)',
        te: 'Telugu (తెలుగు)',
        kn: 'Kannada (ಕನ್ನಡ)',
        ml: 'Malayalam (മലയാളം)',
        bn: 'Bengali (বাংলা)',
        or: 'Odia (ଓଡ଼ିଆ)',
        mr: 'Marathi (मराठी)',
        gu: 'Gujarati (ગુજરાતી)',
    };

    return (
        <div className="language-selector">
            <button
                className="language-trigger glass"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Globe size={18} />
                <span>{currentLang?.flag} {LANGUAGE_NAMES[selectedLanguage]}</span>
                <ChevronDown size={16} className={isOpen ? 'rotated' : ''} />
            </button>

            {isOpen && (
                <div className="language-dropdown glass">
                    {Object.entries(zones).map(([zone, languages]) => (
                        languages.length > 0 && (
                            <div key={zone} className="language-zone">
                                <div className="zone-header">{zone} Zone</div>
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`language-option ${selectedLanguage === lang.code ? 'selected' : ''}`}
                                        onClick={() => handleSelect(lang.code)}
                                    >
                                        <span className="lang-flag">{lang.flag}</span>
                                        <span className="lang-name">{LANGUAGE_NAMES[lang.code]}</span>
                                        {selectedLanguage === lang.code && <Check size={16} className="check-icon" />}
                                    </button>
                                ))}
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSelector;
