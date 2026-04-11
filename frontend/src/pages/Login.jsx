import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://g-trams-web2.onrender.com/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                
                // inalis na ang staff checking dito
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
            alert("Hindi maka-konekta sa server. Siguraduhing naka-run ang backend.");
        }
    };

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#2563eb', margin: 0 }}>G-TRAMS</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>Tricycle Franchise Management System</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label>
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />

                    <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />

                    <button type="submit" style={{ marginTop: '1rem', width: '100%' }}>
                        Log In
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <p style={{ margin: 0 }}>
                        Wala pang account? <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Mag-register dito</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}