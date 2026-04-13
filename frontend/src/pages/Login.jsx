import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// assets
import logoImg from '../assets/gasan-logo.png';
import loadingGif from '../assets/loading.gif';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // loading state for the login process
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch('https://g-trams-web2.onrender.com/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // save the token to local storage
                localStorage.setItem('token', data.token);

                // strict routing based on the exact role string from the backend
                if (data.role === 'admin') {
                    navigate('/admin-dashboard');
                } else if (data.role === 'operator') {
                    navigate('/operator-dashboard');
                } else {
                    setErrorMessage('unauthorized role detected.');
                }
            } else {
                setErrorMessage(data.message || 'invalid email or password.');
            }
        } catch (error) {
            console.error('login error:', error);
            setErrorMessage('server is waking up or currently unavailable. please try again in a few seconds.');
        } finally {
            setIsLoading(false);
        }
    };

    // modern ui styles
    const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1rem' };
    const cardStyle = { backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
    const inputStyle = { width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' };
    const buttonStyle = { width: '100%', padding: '0.8rem', backgroundColor: '#2FA084', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '0.5rem' };

    // loading screen view
    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
                <img src={loadingGif} alt="loading..." style={{ width: '150px', height: 'auto', objectFit: 'contain' }} />
                <h3 style={{ color: '#1F6F5F', marginTop: '1rem', fontFamily: 'sans-serif' }}>Authenticating...</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', maxWidth: '300px' }}>
                    connecting to the secure server. this may take a few seconds if the server is waking up.
                </p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <img src={logoImg} alt="gasan logo" style={{ width: '80px', marginBottom: '1rem' }} />
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', textAlign: 'center' }}>G-TRAMS Portal</h2>
                <p style={{ margin: '0 0 2rem 0', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>login to access your dashboard</p>

                {errorMessage && (
                    <div style={{ width: '100%', padding: '0.8rem', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #fca5a5', boxSizing: 'border-box' }}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ width: '100%' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={inputStyle} 
                        placeholder="enter your email"
                    />

                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={inputStyle} 
                        placeholder="enter your password"
                    />

                    <button type="submit" style={buttonStyle}>Login</button>
                </form>

                <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <Link to="/forgot-password" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</Link>
                    <Link to="/register" style={{ color: '#64748b', textDecoration: 'none' }}>Create an account</Link>
                </div>
            </div>
        </div>
    );
}