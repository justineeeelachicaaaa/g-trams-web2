import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bgVideo from '../assets/gasanview.mp4'; 
import logoImg from '../assets/gasan-logo.png'; 
import openEyeIcon from '../assets/openeye.png';
import closeEyeIcon from '../assets/closeeye.png';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', address: '', email: '', password: '', role: 'operator'
    });
    const [showPassword, setShowPassword] = useState(false);
    
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://g-trams-web2.onrender.com/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setShowOtpModal(true); 
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error("error registering:", error);
            alert("Cannot connect to the server. Please check your connection.");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://g-trams-web2.onrender.com/api/v1/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: otpCode })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Email verified successfully!');
                localStorage.setItem('token', data.token);
                
                if (data.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/operator-dashboard');
                }
            } else {
                alert(data.message || 'Invalid or expired OTP code');
            }
        } catch (error) {
            console.error("error verifying otp:", error);
            alert("Cannot connect to the server.");
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            
            <video autoPlay loop muted playsInline style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: -2 }}>
                <source src={bgVideo} type="video/mp4" />
            </video>

            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: -1 }}></div>

            <div className="card" style={{ width: '100%', maxWidth: '600px', zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src={logoImg} alt="Municipal Logo" style={{ width: '80px', height: 'auto', marginBottom: '10px' }} />
                    <h2 style={{ color: '#2563eb', margin: 0 }}>G-TRAMS</h2>
                    <p style={{ margin: 0 }}>Create an Operator Account</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="form-grid">
                        <div className="span-2">
                            <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Full Name</label>
                            <input type="text" name="name" placeholder="Ex: Juan Dela Cruz" value={formData.name} onChange={handleChange} required disabled={showOtpModal} />
                        </div>
                        
                        <div className="span-2">
                            <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Address (Barangay, Gasan)</label>
                            <input type="text" name="address" placeholder="Ex: Poblacion Dos, Gasan" value={formData.address} onChange={handleChange} required disabled={showOtpModal} />
                        </div>
                        
                        <div>
                            <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Email Address</label>
                            <input type="email" name="email" placeholder="juan@gmail.com" value={formData.email} onChange={handleChange} required disabled={showOtpModal} />
                        </div>
                        
                        <div>
                            <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Password</label>
                            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    placeholder="Enter password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required minLength="6"
                                    disabled={showOtpModal}
                                    style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box', margin: 0 }}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={showOtpModal}
                                    style={{ position: 'absolute', right: '12px', top: 0, bottom: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <img src={showPassword ? openEyeIcon : closeEyeIcon} alt="toggle" style={{ width: '20px', height: '20px', opacity: showOtpModal ? 0.3 : 0.6 }} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '1.5rem', width: '100%', opacity: showOtpModal ? 0.5 : 1 }} disabled={showOtpModal}>Submit and Register</button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <p style={{ margin: 0 }}>Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Log in here</Link></p>
                </div>
            </div>

            {showOtpModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '2rem', textAlign: 'center' }}>
                        <h3 style={{ color: '#0f172a', marginTop: 0 }}>Verify Your Email</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            We sent a 6-digit verification code to <strong>{formData.email}</strong>. Please enter it below to complete your registration.
                        </p>
                        
                        <form onSubmit={handleVerifyOtp}>
                            <input 
                                type="text" 
                                placeholder="Enter 6-digit OTP" 
                                value={otpCode} 
                                onChange={(e) => setOtpCode(e.target.value)} 
                                required 
                                maxLength="6"
                                style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                            <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>Verify and Log In</button>
                            <button type="button" onClick={() => setShowOtpModal(false)} style={{ width: '100%', marginTop: '0.5rem', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}