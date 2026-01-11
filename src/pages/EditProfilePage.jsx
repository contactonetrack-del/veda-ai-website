/**
 * Edit Profile Page
 * Allow users to update their profile information
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
    ArrowLeft,
    User,
    Camera,
    Save,
    Mail,
    Phone,
    MapPin,
    Loader2
} from 'lucide-react';
import './EditProfilePage.css';

function EditProfilePage() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phone: '',
        location: '',
        bio: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                email: user.email || '',
                phone: user.phoneNumber || '',
                location: '',
                bio: ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!auth.currentUser) return;

        setLoading(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName: formData.displayName
            });

            // Refresh user context
            if (refreshUser) refreshUser();

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.isGuest) {
        return (
            <div className="edit-profile-page">
                <header className="edit-header glass">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Edit Profile</h1>
                    <div className="header-spacer"></div>
                </header>
                <div className="guest-notice">
                    <User size={48} />
                    <h2>Guest Account</h2>
                    <p>Sign up to create and edit your profile</p>
                    <button className="signup-btn" onClick={() => navigate('/')}>
                        Sign Up Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-profile-page">
            <header className="edit-header glass">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Edit Profile</h1>
                <button
                    className={`save-btn ${saved ? 'saved' : ''}`}
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? <Loader2 size={20} className="spin" /> :
                        saved ? '✓ Saved' : <><Save size={18} /> Save</>}
                </button>
            </header>

            <main className="edit-content">
                {/* Avatar Section */}
                <section className="avatar-section">
                    <div className="avatar-container">
                        <div className="avatar-large">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" />
                            ) : (
                                <User size={60} />
                            )}
                        </div>
                        <button className="change-photo-btn">
                            <Camera size={18} />
                            Change Photo
                        </button>
                    </div>
                </section>

                {/* Form Section */}
                <section className="form-section">
                    <div className="input-group">
                        <label>
                            <User size={16} />
                            Display Name
                        </label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            placeholder="Your name"
                        />
                    </div>

                    <div className="input-group">
                        <label>
                            <Mail size={16} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="disabled"
                        />
                        <span className="helper-text">Email cannot be changed</span>
                    </div>

                    <div className="input-group">
                        <label>
                            <Phone size={16} />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>

                    <div className="input-group">
                        <label>
                            <MapPin size={16} />
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, Country"
                        />
                    </div>

                    <div className="input-group">
                        <label>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            rows={3}
                        />
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="danger-section">
                    <h3>Danger Zone</h3>
                    <button className="delete-account-btn">
                        Delete Account
                    </button>
                    <p className="danger-text">This action cannot be undone</p>
                </section>
            </main>
        </div>
    );
}

export default EditProfilePage;
