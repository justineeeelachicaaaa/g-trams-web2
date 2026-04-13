import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/gasan-logo.png'; 

export default function ForgotPassword() {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                alert('OTP sent! Paki-check ang iyong email.');
                setStep(2);
            } else {
                alert(data.message || 'Error sending OTP.');
            }
        } catch (err) {
            alert('Cannot connect to server.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Password reset successful! Pwede ka na mag-login.');
                navigate('/login');
            } else {
                alert(data.message || 'Invalid OTP.');
            }
        } catch (err) {
            alert('Cannot connect to server.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <img src={logoImg} alt="Logo" style={{ width: '70px', marginBottom: '10px' }} />
                <h2 style={{ color: '#2563eb', margin: 0, marginBottom: '20px' }}>Forgot Password</h2>
                
                {step === 1 ? (
                    <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <label style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@gmail.com" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '15px' }} />
                        <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Send Reset OTP</button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>Napadala na ang OTP sa <strong>{email}</strong>.</p>
                        
                        <label style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>6-Digit OTP</label>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="123456" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '15px' }} />
                        
                        <label style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="New Password" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '15px' }} />
                        
                        <button type="submit" style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Reset Password</button>
                    </form>
                )}

                <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 'bold' }}>⬅ Back to Login</Link>
                </div>
            </div>
        </div>
    );
}