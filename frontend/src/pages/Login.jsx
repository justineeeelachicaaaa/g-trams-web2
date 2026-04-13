import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bgVideo from '../assets/gasanview.mp4'; 
import logoImg from '../assets/gasan-logo.png'; 
import openEyeIcon from '../assets/openeye.png';
import closeEyeIcon from '../assets/closeeye.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // NAKA-LOCALHOST NA ITO
            const response = await fetch('http://localhost:3000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                if (data.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/operator-dashboard');
                }
            } else {
                alert(data.message || 'Login failed. Please check your email and password.');
            }
        } catch (error) {
            console.error("error logging in:", error);
            alert("Cannot connect to the server. Please make sure the backend is running.");
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            
            <video autoPlay loop muted playsInline style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: -2 }}>
                <source src={bgVideo} type="video/mp4" />
            </video>

            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: -1 }}></div>

            <div className="card" style={{ width: '100%', maxWidth: '400px', zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src={logoImg} alt="Municipal Logo" style={{ width: '80px', height: 'auto', marginBottom: '10px' }} />
                    <h2 style={{ color: '#2563eb', margin: 0 }}>G-TRAMS</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>Gasan Tricycle Franchise Management System</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                    <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', marginTop: '10px' }}>Password</label>
                    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter your password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box', margin: 0 }}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', top: 0, bottom: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <img src={showPassword ? openEyeIcon : closeEyeIcon} alt="toggle" style={{ width: '20px', height: '20px', opacity: 0.6 }} />
                        </button>
                    </div>

                    {/* DITO YUNG NA-UPDATE NA FORGOT PASSWORD LINK */}
                    <div style={{ textAlign: 'right', marginTop: '5px' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none', fontWeight: 'bold' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" style={{ marginTop: '1rem', width: '100%' }}>Log In</button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <p style={{ margin: 0 }}>
                        Don't have an account yet? <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}