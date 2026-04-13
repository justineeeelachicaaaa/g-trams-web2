import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bgVideo from '../assets/gasanview.mp4'; 
import logoImg from '../assets/gasan-logo.png'; 
import openEyeIcon from '../assets/openeye.png';
import closeEyeIcon from '../assets/closeeye.png';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return alert("Hindi magkapareho ang Password at Confirm Password.");
        }

        try {
            const response = await fetch('http://localhost:3000/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: formData.name,
                    address: formData.address,
                    email: formData.email, 
                    password: formData.password,
                    role: 'operator' 
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Pwede ka na mag-login.');
                navigate('/login'); 
            } else {
                alert(data.message || 'Registration failed. Maaaring nagamit na ang email na ito.');
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Cannot connect to the server. Please make sure the backend is running.");
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            
            <video autoPlay loop muted playsInline style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: -2 }}>
                <source src={bgVideo} type="video/mp4" />
            </video>

            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: -1 }}></div>

            <div className="card" style={{ width: '100%', maxWidth: '450px', zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src={logoImg} alt="Municipal Logo" style={{ width: '70px', height: 'auto', marginBottom: '10px' }} />
                    {/* BAGONG KULAY (Dark Teal) */}
                    <h2 style={{ color: '#1F6F5F', margin: 0, fontWeight: '800' }}>Register Account</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Gumawa ng account para makapag-apply ng prangkisa</p>
                </div>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    <label style={{ marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Full Name</label>
                    <input type="text" name="name" placeholder="Juan Dela Cruz" value={formData.name} onChange={handleChange} required style={{ marginBottom: '10px' }} />

                    <label style={{ marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Home Address</label>
                    <input type="text" name="address" placeholder="Barangay, Gasan, Marinduque" value={formData.address} onChange={handleChange} required style={{ marginBottom: '10px' }} />

                    <label style={{ marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label>
                    <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required style={{ marginBottom: '10px' }} />

                    <label style={{ marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
                    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password"
                            placeholder="Create a password" 
                            value={formData.password} 
                            onChange={handleChange} 
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

                    <label style={{ marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Confirm Password</label>
                    <input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required style={{ marginBottom: '15px' }} />

                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '12px' }}>Create Account</button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <p style={{ margin: 0 }}>
                        {/* BAGONG KULAY PARA SA LINK (Medium Teal) */}
                        Already have an account? <Link to="/login" style={{ color: '#2FA084', textDecoration: 'none', fontWeight: '600' }}>Log In here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}