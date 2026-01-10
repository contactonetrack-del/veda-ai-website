/**
 * Profile Page
 * Port of mobile ProfileScreen with Settings and Account Management
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    ArrowLeft,
    User,
    Settings,
    Moon,
    Sun,
    Bell,
    Globe,
    Shield,
    FileText,
    LogOut,
    ChevronRight,
    Crown,
    Sparkles
} from 'lucide-react';
import './ProfilePage.css';
import LanguageSelector from '../components/LanguageSelector'; // Reusing existing component

function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <header className="profile-header glass">
                <button className="back-btn" onClick={() => navigate('/chat')}>
                    <ArrowLeft size={24} />
                </button>
                <h1>My Profile</h1>
                <div className="header-spacer"></div>
            </header>

            <main className="profile-content">
                {/* User Card */}
                <section className="user-card glass">
                    <div className="user-avatar-container">
                        <div className="user-avatar">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" />
                            ) : (
                                <User size={40} />
                            )}
                        </div>
                        {user.isGuest ? (
                            <div className="badge guest">
                                <Sparkles size={12} /> Guest
                            </div>
                        ) : (
                            <div className="badge premium">
                                <Crown size={12} /> Premium
                            </div>
                        )}
                    </div>

                    <div className="user-info">
                        <h2>{user.displayName || (user.isGuest ? 'Guest User' : 'User')}</h2>
                        <p>{user.email || 'No email linked'}</p>
                    </div>

                    {!user.isGuest && (
                        <button className="edit-profile-btn">
                            Edit Profile
                        </button>
                    )}
                </section>

                {/* Settings Settings */}
                <section className="settings-section">
                    <h3>App Settings</h3>

                    <div className="settings-card glass">
                        {/* Theme Toggle */}
                        <div className="setting-item" onClick={toggleTheme}>
                            <div className="setting-icon color-purple">
                                {isDark ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div className="setting-label">
                                <span>App Theme</span>
                                <span className="setting-value">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                            </div>
                            <div className={`toggle-switch ${isDark ? 'active' : ''}`}>
                                <div className="toggle-thumb"></div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="setting-item">
                            <div className="setting-icon color-pink">
                                <Bell size={20} />
                            </div>
                            <div className="setting-label">
                                <span>Notifications</span>
                                <span className="setting-value">On</span>
                            </div>
                            <div className="toggle-switch active">
                                <div className="toggle-thumb"></div>
                            </div>
                        </div>

                        {/* Language */}
                        <div className="setting-item">
                            <div className="setting-icon color-blue">
                                <Globe size={20} />
                            </div>
                            <div className="setting-label">
                                <span>Language</span>
                                <span className="setting-value">Select App Language</span>
                            </div>
                            {/* We can embed the selector or just show it */}
                            <div className="language-wrapper">
                                {/* Using a simplified version or the generic component */}
                                <Globe size={16} className="lang-icon-small" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Support & Legal */}
                <section className="settings-section">
                    <h3>Support & Legal</h3>

                    <div className="settings-card glass">
                        <div className="setting-item" onClick={() => window.open('/privacy', '_blank')}>
                            <div className="setting-icon color-green">
                                <Shield size={20} />
                            </div>
                            <div className="setting-label">
                                <span>Privacy Policy</span>
                            </div>
                            <ChevronRight size={20} className="arrow-icon" />
                        </div>

                        <div className="setting-item" onClick={() => window.open('/terms', '_blank')}>
                            <div className="setting-icon color-orange">
                                <FileText size={20} />
                            </div>
                            <div className="setting-label">
                                <span>Terms of Service</span>
                            </div>
                            <ChevronRight size={20} className="arrow-icon" />
                        </div>
                    </div>
                </section>

                {/* Logout */}
                <button className="logout-btn-large" onClick={handleLogout}>
                    <LogOut size={20} />
                    Log Out
                </button>

                <p className="version-text">VEDA AI v1.0.2</p>
            </main>
        </div>
    );
}

export default ProfilePage;
