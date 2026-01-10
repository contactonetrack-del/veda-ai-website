/**
 * Snap Your Thali Page
 * AI-powered food analysis using Gemini 1.5 Flash Vision
 * Features: Image Upload, Nutritional Analysis, Health Tips
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X, Loader, Utensils, Flame, Droplets } from 'lucide-react';
import { analyzeFoodImage } from '../services/api';
import './SnapThaliPage.css';

function SnapThaliPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setupImage(file);
        }
    };

    const setupImage = (file) => {
        // Validate size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image too large. Please upload photo under 5MB.');
            return;
        }

        setImage(file);
        setError(null);
        setResult(null);

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!previewUrl) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            // Get base64 string without prefix
            const base64Image = previewUrl.split(',')[1];
            const data = await analyzeFoodImage(base64Image);
            setResult(data);
        } catch (err) {
            setError(err.message || "Failed to analyze image. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => {
        setImage(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="snap-thali-page">
            <header className="snap-header glass">
                <button className="back-btn" onClick={() => navigate('/tools')}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Snap Your Thali</h1>
                <div className="header-spacer"></div>
            </header>

            <main className="snap-content">
                {/* Upload Section */}
                {!result && (
                    <section className="upload-section glass">
                        {!previewUrl ? (
                            <div
                                className="upload-area"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <div className="upload-icon-circle">
                                    <Camera size={48} />
                                </div>
                                <h3>Take a Photo or Upload</h3>
                                <p>Snap your meal to get instant calorie & nutrition info</p>
                                <button className="upload-btn">
                                    <Upload size={20} /> Select Image
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                    hidden
                                />
                            </div>
                        ) : (
                            <div className="preview-area">
                                <div className="image-container">
                                    <img src={previewUrl} alt="Meal Preview" />
                                    <button className="remove-btn" onClick={reset}>
                                        <X size={20} />
                                    </button>
                                </div>

                                {error && (
                                    <div className="error-banner">
                                        <X size={16} /> {error}
                                    </div>
                                )}

                                <button
                                    className={`analyze-btn ${isAnalyzing ? 'loading' : ''}`}
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader size={20} className="spin" />
                                            Analyzing Meal...
                                        </>
                                    ) : (
                                        <>
                                            <Utensils size={20} />
                                            Analyze Nutrition
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* Results Section */}
                {result && (
                    <div className="results-container fade-in">
                        {/* Summary Cards */}
                        <div className="nutrition-cards">
                            <div className="nutri-card glass highlight">
                                <div className="nutri-icon"><Flame size={24} /></div>
                                <div className="nutri-value">{result.totalCalories}</div>
                                <div className="nutri-label">Calories</div>
                            </div>
                            <div className="nutri-card glass">
                                <div className="nutri-icon">P</div>
                                <div className="nutri-value">{result.totalProtein}g</div>
                                <div className="nutri-label">Protein</div>
                            </div>
                            <div className="nutri-card glass">
                                <div className="nutri-icon">C</div>
                                <div className="nutri-value">{result.totalCarbs}g</div>
                                <div className="nutri-label">Carbs</div>
                            </div>
                            <div className="nutri-card glass">
                                <div className="nutri-icon"><Droplets size={24} /></div>
                                <div className="nutri-value">{result.totalFat}g</div>
                                <div className="nutri-label">Fats</div>
                            </div>
                        </div>

                        {/* Food List */}
                        <section className="food-list glass">
                            <h3>🍽️ Food Breakdown</h3>
                            <div className="food-items">
                                {result.foods.map((food, idx) => (
                                    <div key={idx} className="food-item">
                                        <div className="food-info">
                                            <span className="food-name">{food.name} <span className="hindi">({food.nameHindi})</span></span>
                                            <span className="food-portion">{food.portion}</span>
                                        </div>
                                        <div className="food-cals">
                                            {food.calories} kcal
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Analysis / Tips */}
                        <section className="tips-section glass">
                            <h3>🥗 Health Insights</h3>
                            <p>{result.healthTips}</p>
                        </section>

                        <button className="reset-btn-link" onClick={reset}>
                            Analyze Another Meal
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default SnapThaliPage;
