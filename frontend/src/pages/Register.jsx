import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// I-import din yung video dito
import bgVideo from '../assets/gasanview.mp4'; 

export default function Register() {
    const [formData, setFormData] = useState({
        name: '', address: '', email: '', password: '', role: 'operator'
    });
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
                alert('Registration Successful!');
                localStorage.setItem('token', data.token);
                navigate('/operator-dashboard');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error("error registering:", error);
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            
            {/* BACKGROUND VIDEO */}
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: -2 }}
            >
                <source src={bgVideo} type="video/mp4" />
            </video>

            {/* DARK OVERLAY */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: -1 }}></div>

            <div className="card" style={{ width: '100%', maxWidth: '600px', zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#2563eb', margin: 0 }}>G-TRAMS</h2>
                    <p style={{ margin: 0 }}>Gumawa ng Operator Account</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="form-grid">
                        <div className="span-2">
                            <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Buong Pangalan</label>
                            <input type="text" name="name" placeholder="Hal: Juan Dela Cruz" value={formData.name} onChange={handleChange} required />
                        </div>
                        
                        <div className="span-2">
                            <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Address (Barangay, Gasan)</label>
                            <input type="text" name="address" placeholder="Hal: Poblacion Dos, Gasan" value={formData.address} onChange={handleChange} required />
                        </div>
                        
                        <div>
                            <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Email Address</label>
                            <input type="email" name="email" placeholder="juan@gmail.com" value={formData.email} onChange={handleChange} required />
                        </div>
                        
                        <div>
                            <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Password</label>
                            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength="6" />
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '1.5rem', width: '100%' }}>I-submit at Mag-register</button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <p style={{ margin: 0 }}>May account ka na? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Mag-login dito</Link></p>
                </div>
            </div>
        </div>
    );
}