import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        password: '',
        role: 'operator' 
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
                
                // admin na lang ang chinecheck dito
                if (data.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/operator-dashboard');
                }
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error("error registering:", error);
        }
    };

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#2563eb', margin: 0 }}>G-TRAMS</h2>
                    <p style={{ margin: 0 }}>Gumawa ng Bagong Account</p>
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
                        
                        <div className="span-2">
                            <label style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Uri ng Account</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="operator">Tricycle Operator</option>
                                {/* inalis na ang staff option dito */}
                                <option value="admin">Administrator (Vice Mayor's Office)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '1.5rem', width: '100%' }}>
                        I-submit at Mag-register
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <p style={{ margin: 0 }}>May account ka na? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Mag-login dito</Link></p>
                </div>
            </div>
        </div>
    );
}