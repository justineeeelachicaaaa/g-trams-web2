import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ICONS
import logoImg from '../assets/gasan-logo.png'; 
import dashboardIcon from '../assets/dashboard-icon.png';
import scheduleIcon from '../assets/schedule-icon.png';
import usersIcon from '../assets/users-icon.png';
import settingsIcon from '../assets/analytics-icon.png'; 
import printerIcon from '../assets/printer.png';

// LOADING GIF
import loadingGif from '../assets/loading.gif';

export default function OperatorDashboard() {
    const [isLoading, setIsLoading] = useState(true); // LOADING STATE
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [activeTab, setActiveTab] = useState('franchises'); 
    const [myFranchises, setMyFranchises] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [savedProfilePic, setSavedProfilePic] = useState(null); 
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [reports, setReports] = useState([]); 

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [formData, setFormData] = useState({ zone: '', made: '', make: '', motorNo: '', chassisNo: '', plateNo: '', todaName: '', cedulaDate: '', cedulaAddress: '', cedulaSerialNo: '' });
    const [orCrFile, setOrCrFile] = useState(null); 
    const [renewingId, setRenewingId] = useState(null);
    const [renewData, setRenewData] = useState({ cedulaSerialNo: '', cedulaDate: '', cedulaAddress: '' });
    const [profileData, setProfileData] = useState({ name: '', address: '' });
    const [profilePic, setProfilePic] = useState(null);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [reportForm, setReportForm] = useState({ subject: '', message: '' }); 

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // SABAY-SABAY NA FETCHING WITH LOADING SCREEN
    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            const loadAllData = async () => {
                setIsLoading(true);
                try {
                    await Promise.all([
                        fetchMyFranchises(),
                        fetchUser(),
                        fetchCalendarEvents(),
                        fetchReports()
                    ]);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadAllData();
        }
    }, [navigate, token]);

    const fetchUser = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/auth', { headers: { 'Authorization': `Bearer ${token}` } });
            const users = await res.json();
            const payload = JSON.parse(atob(token.split('.')[1]));
            const me = users.find(u => u._id === payload.id);
            if (me) { setUserName(me.name); setProfileData({ name: me.name, address: me.address }); if (me.profilePic) setSavedProfilePic(me.profilePic); }
        } catch (e) { console.error(e); }
    };

    const fetchMyFranchises = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/franchises/my-franchises', { headers: { 'Authorization': `Bearer ${token}` }});
            if(res.ok) setMyFranchises(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchCalendarEvents = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/calendar', { headers: { 'Authorization': `Bearer ${token}` } });
            if(res.ok) setCalendarEvents(await res.json());
        } catch(e) { console.error(e); }
    };

    const fetchReports = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/reports/my-reports', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setReports(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleRenewChange = (e) => setRenewData({ ...renewData, [e.target.name]: e.target.value });
    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const switchTab = (tab) => { setActiveTab(tab); setIsSidebarOpen(false); };

    const getImageUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `http://localhost:3000/${path.replace(/\\/g, '/')}`;
    };

    const canApply = myFranchises.length < 2;

    const handleApply = async (e) => {
        e.preventDefault();
        if (!canApply) return alert("Limit 2 units per operator.");
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
            if (orCrFile) submitData.append('orCrDocument', orCrFile);

            const res = await fetch('http://localhost:3000/api/v1/franchises', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: submitData });
            if (res.ok) { alert('Application Submitted Successfully!'); fetchMyFranchises(); setFormData({ zone: '', made: '', make: '', motorNo: '', chassisNo: '', plateNo: '', todaName: '', cedulaDate: '', cedulaAddress: '', cedulaSerialNo: '' }); setOrCrFile(null); } 
            else { alert('Error. Plate or Motor Number might already exist.'); }
        } catch (e) { console.error(e); }
    };

    const submitRenewal = async (e, id) => {
        e.preventDefault();
        try {
            const payload = { dateApplied: new Date().toISOString().split('T')[0], ...renewData };
            const res = await fetch(`http://localhost:3000/api/v1/franchises/${id}/renew`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
            if (res.ok) { alert('Renewal Application Sent!'); setRenewingId(null); setRenewData({ cedulaSerialNo: '', cedulaDate: '', cedulaAddress: '' }); fetchMyFranchises(); }
        } catch (e) { console.error(e); }
    };

    const handleCancelFranchise = async (id) => {
        const confirmCancel = window.confirm("Babala: Sigurado ka bang gusto mong i-cancel ang prangkisang ito? Hindi na ito mababawi.");
        if (!confirmCancel) return;
        const reason = window.prompt("Pakilagay ang rason kung bakit mo ika-cancel:");
        if (!reason || reason.trim() === '') return alert("Kailangan ng rason para ma-cancel ang prangkisa.");
        try {
            const res = await fetch(`http://localhost:3000/api/v1/franchises/${id}/cancel`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ cancelReason: reason }) });
            if (res.ok) { alert("Franchise Successfully Cancelled."); fetchMyFranchises(); }
        } catch (e) { console.error(e); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const formDataProfile = new FormData();
            formDataProfile.append('name', profileData.name); formDataProfile.append('address', profileData.address);
            if (profilePic) formDataProfile.append('profilePic', profilePic);
            const res = await fetch('http://localhost:3000/api/v1/auth/profile', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: formDataProfile });
            if (res.ok) { alert("Profile updated successfully!"); setProfilePic(null); fetchUser(); } else { alert("Failed to update profile."); }
        } catch (e) { console.error(e); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) return alert("Passwords do not match.");
        try {
            const res = await fetch('http://localhost:3000/api/v1/auth/change-password', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }) });
            if (res.ok) { alert('Password Updated!'); setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); } 
        } catch (e) { console.error(e); }
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/v1/reports', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(reportForm)
            });
            if (res.ok) { alert('Report successfully sent to Admin!'); setReportForm({ subject: '', message: '' }); fetchReports(); }
        } catch (error) { console.error(error); }
    };

    const getExpiryDate = (dateApplied) => {
        if (!dateApplied) return 'N/A';
        const applied = new Date(dateApplied);
        return new Date(applied.setFullYear(applied.getFullYear() + 1)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handlePrintPermit = (franchise) => {
        const printContent = document.getElementById(`print-permit-${franchise._id}`);
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalBody;
        window.location.reload(); 
    };

    // --- MODERN UI STYLES ---
    const modernCard = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #f1f5f9' };

    // =========================================================================
    // LOADING SCREEN VIEW
    // =========================================================================
    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
                <img src={loadingGif} alt="Loading..." style={{ width: '150px', height: 'auto', objectFit: 'contain' }} />
                <h3 style={{ color: '#1F6F5F', marginTop: '1rem', fontFamily: 'sans-serif' }}>Loading G-TRAMS...</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Please wait while we connect your data.</p>
            </div>
        );
    }

    return (
        <div className="admin-layout" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: isMobile ? 'block' : 'flex' }}>
            
            {/* MOBILE HEADER */}
            {isMobile && (
                <div className="mobile-header no-print" style={{ backgroundColor: '#1F6F5F', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div className="flex-row gap-1" style={{ alignItems: 'center' }}>
                        {savedProfilePic ? <img src={getImageUrl(savedProfilePic)} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} alt="Profile" /> : logoImg && <img src={logoImg} width="35" alt="Logo" />}
                        <h3 className="m-0" style={{ fontSize: '1.2rem', fontWeight: '600' }}>G-TRAMS</h3>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer' }}>☰</button>
                </div>
            )}

            {isMobile && <div className={`mobile-overlay no-print ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40, display: isSidebarOpen ? 'block' : 'none' }}></div>}

            {/* SIDEBAR */}
            <div className={`sidebar-container no-print ${isSidebarOpen ? 'open' : ''}`} style={{ backgroundColor: '#ffffff', boxShadow: '2px 0 8px rgba(0,0,0,0.05)', zIndex: 50, display: (!isMobile || isSidebarOpen) ? 'flex' : 'none', flexDirection: 'column', width: isMobile ? '250px' : '260px', height: '100vh', position: isMobile ? 'fixed' : 'sticky', top: 0, left: 0, transition: 'transform 0.3s ease' }}>
                <div className="sidebar-title flex-column gap-1" style={{ alignItems: 'center', marginBottom: '2rem', padding: '2rem 1rem 0' }}>
                    {savedProfilePic ? (
                        <img src={getImageUrl(savedProfilePic)} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2FA084', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #2FA084', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}><img src={usersIcon} style={{ width: '40px', opacity: 0.5 }} alt="Default" /></div>
                    )}
                    <h3 className="m-0 text-center" style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: '700' }}>{userName || 'Operator'}</h3>
                </div>

                <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className={`nav-button ${activeTab === 'franchises' ? 'active' : ''}`} onClick={() => switchTab('franchises')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={dashboardIcon} width="20" height="20" alt="Franchises" style={{marginRight: '8px'}} /> My Franchises</button>
                    <button className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => switchTab('calendar')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={scheduleIcon} width="20" height="20" alt="Schedule" style={{marginRight: '8px'}} /> Schedule</button>
                    <button className={`nav-button ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => switchTab('reports')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={settingsIcon} width="20" height="20" alt="Reports" style={{marginRight: '8px'}} /> Help & Feedback</button>
                    <button className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => switchTab('profile')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={usersIcon} width="20" height="20" alt="Profile" style={{marginRight: '8px'}} /> My Profile</button>
                    <button className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => switchTab('settings')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={settingsIcon} width="20" height="20" alt="Settings" style={{marginRight: '8px'}} /> Settings</button>
                </div>
                <div style={{ flex: 1 }}></div>
                <div style={{ padding: '1rem' }}>
                    <button className="btn-danger w-100" onClick={handleLogout} style={{ borderRadius: '8px', padding: '0.8rem', fontWeight: '600' }}>Log Out</button>
                </div>
            </div>

            {/* CONTENT CONTAINER */}
            <div className="content-container" style={{ flex: 1, padding: isMobile ? '1rem' : '2rem', maxWidth: '1400px', width: '100%', overflowX: 'hidden' }}>
                
                {activeTab === 'franchises' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 className="m-0 text-primary no-print" style={{ fontSize: '1.8rem' }}>Welcome, {userName || 'Operator'}!</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                            
                            {/* MY UNITS SECTION */}
                            <div style={modernCard}>
                                <div className="flex-between mb-2" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                                    <h3 className="m-0" style={{ color: '#1e293b' }}>My Units</h3>
                                    <span style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>{myFranchises.length} / 2 Units</span>
                                </div>
                                
                                {myFranchises.length === 0 ? (
                                    <div style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}><p className="text-muted m-0">No registered franchises yet.</p></div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {myFranchises.map(franchise => (
                                            <div key={franchise._id} style={{ backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '8px', borderLeft: `4px solid ${franchise.status === 'Active' ? '#2FA084' : franchise.status === 'Pending' ? '#f59e0b' : '#ef4444'}` }}>
                                                <div className="flex-between mb-1">
                                                    <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>{franchise.plateNo}</strong>
                                                    <span className={`badge ${franchise.status.toLowerCase()}`}>{franchise.status}</span>
                                                </div>
                                                <p style={{ margin: '0 0 0.3rem 0', color: '#475569', fontSize: '0.9rem' }}><strong>Unit:</strong> {franchise.make} {franchise.made}</p>
                                                <p style={{ margin: '0 0 0.3rem 0', color: '#475569', fontSize: '0.9rem' }}><strong>Zone:</strong> {franchise.zone} | <strong>TODA:</strong> {franchise.todaName}</p>
                                                <p style={{ margin: '0.5rem 0 0 0', color: '#2FA084', fontWeight: '600', fontSize: '0.95rem' }}>Valid Until: {getExpiryDate(franchise.dateApplied)}</p>

                                                {franchise.status === 'Active' && franchise.releaseDate && <p style={{ margin: '0.5rem 0 0 0', color: '#3b82f6', fontWeight: '600', fontSize: '0.9rem' }}>Estimated Release: {franchise.releaseDate}</p>}
                                                
                                                {franchise.status === 'Active' && (
                                                    <button onClick={() => handlePrintPermit(franchise)} className="btn-success w-100 mt-2" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <img src={printerIcon} width="18" height="18" style={{ filter: 'brightness(0) invert(1)' }} alt="Print" /> Print E-Permit
                                                    </button>
                                                )}
                                                
                                                {franchise.status === 'Cancelled' && franchise.cancelReason && (
                                                    <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', marginTop: '1rem', borderLeft: '3px solid #ef4444' }}>
                                                        <p style={{ margin: '0 0 0.3rem 0', fontWeight: '600', color: '#b91c1c', fontSize: '0.85rem', textTransform: 'uppercase' }}>Reason for Cancellation:</p>
                                                        <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.95rem' }}>{franchise.cancelReason}</p>
                                                    </div>
                                                )}

                                                {franchise.status !== 'Cancelled' && (<button onClick={() => handleCancelFranchise(franchise._id)} className="btn-danger w-100" style={{ marginTop: '0.8rem', padding: '0.6rem', borderRadius: '8px' }}>Cancel Application</button>)}
                                                
                                                {franchise.status === 'Expired' && renewingId !== franchise._id && (<button onClick={() => setRenewingId(franchise._id)} className="btn-warning w-100" style={{ marginTop: '0.8rem', padding: '0.8rem', borderRadius: '8px', fontWeight: '600' }}>Renew Franchise</button>)}

                                                {renewingId === franchise._id && (
                                                    <form onSubmit={(e) => submitRenewal(e, franchise._id)} style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                        <h4 style={{ margin: 0, color: '#1e293b' }}>Renewal Requirements</h4>
                                                        <input type="text" placeholder="New CTC No." name="cedulaSerialNo" value={renewData.cedulaSerialNo} onChange={handleRenewChange} required style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                                                        <input type="date" name="cedulaDate" value={renewData.cedulaDate} onChange={handleRenewChange} required style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                                                        <input type="text" placeholder="Place Issued" name="cedulaAddress" value={renewData.cedulaAddress} onChange={handleRenewChange} required style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button type="submit" className="btn-success" style={{ flex: 1, padding: '0.8rem', borderRadius: '6px', fontWeight: '600' }}>Submit</button>
                                                            <button type="button" onClick={() => setRenewingId(null)} className="btn-danger" style={{ flex: 1, padding: '0.8rem', borderRadius: '6px', fontWeight: '600' }}>Back</button>
                                                        </div>
                                                    </form>
                                                )}

                                                {/* Hidden Print Template */}
                                                <div id={`print-permit-${franchise._id}`} style={{ display: 'none' }}>
                                                    <div className="print-template">
                                                        <div className="print-header-section"><div className="print-header-content"><img src={printerIcon} alt="Logo" className="print-logo" /><h2 className="m-0">MUNICIPALITY OF GASAN</h2><h3 className="m-0">CERTIFICATE OF PUBLIC CONVENIENCE</h3><p className="text-sm">(FRANCHISE PERMIT)</p></div></div>
                                                        <div className="mb-2" style={{ marginTop: '30px' }}><p>Operator: {franchise.operator?.name}</p><p>Plate: {franchise.plateNo}</p><p>TODA: {franchise.todaName} - {franchise.zone}</p><p>Unit: {franchise.make} {franchise.made}</p><p>Motor/Chassis: {franchise.motorNo} / {franchise.chassisNo}</p></div>
                                                        <div className="flex-between mt-2" style={{ borderTop: '1px solid #ccc', paddingTop: '20px' }}><p>Issued: {new Date(franchise.dateApplied || franchise.createdAt).toLocaleDateString()}</p><p>Valid: {getExpiryDate(franchise.dateApplied || franchise.createdAt)}</p></div>
                                                        <div className="flex-between mt-3" style={{ paddingTop: '80px' }}><div className="signature-block text-center">{franchise.eSigned && <span className="e-sign-text">Approved e-Sign</span>}<p className="font-bold m-0" style={{ textDecoration: 'underline' }}>HON. VICE MAYOR</p><p className="m-0">Vice Mayor</p></div><div className="signature-block text-center">{franchise.eSigned && <span className="e-sign-text">Approved e-Sign</span>}<p className="font-bold m-0" style={{ textDecoration: 'underline' }}>HON. MAYOR</p><p className="m-0">Mayor</p></div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* APPLICATION FORM */}
                            <div style={modernCard}>
                                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '1rem' }}>
                                    <h3 className="m-0" style={{ color: '#1e293b' }}>Apply New Franchise</h3>
                                </div>
                                {!canApply ? (
                                    <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}><p style={{ margin: 0, color: '#b91c1c', fontWeight: '600' }}>Limit Reached: Maximum of 2 units per operator allowed.</p></div>
                                ) : (
                                    <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem' }}>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>TODA Name</label><input type="text" name="todaName" value={formData.todaName} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Zone</label><input type="text" name="zone" value={formData.zone} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Plate No.</label><input type="text" name="plateNo" value={formData.plateNo} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Year Made</label><input type="text" name="made" value={formData.made} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                            <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Brand / Make</label><input type="text" name="make" value={formData.make} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Motor No.</label><input type="text" name="motorNo" value={formData.motorNo} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Chassis No.</label><input type="text" name="chassisNo" value={formData.chassisNo} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                        </div>
                                        
                                        <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
                                        <h4 style={{ margin: 0, color: '#3b82f6' }}>Cedula Information</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem' }}>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>CTC No.</label><input type="text" name="cedulaSerialNo" value={formData.cedulaSerialNo} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Date Issued</label><input type="date" name="cedulaDate" value={formData.cedulaDate} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                            <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Place Issued</label><input type="text" name="cedulaAddress" value={formData.cedulaAddress} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                        </div>
                                        
                                        <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#3b82f6', marginBottom: '0.5rem' }}>Upload OR/CR Document (Image or PDF)</label>
                                            <input type="file" accept="image/*,.pdf" onChange={(e) => setOrCrFile(e.target.files[0])} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }} />
                                        </div>
                                        
                                        <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', marginTop: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>Submit Application</button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* REPORTS & FEEDBACK TAB */}
                {activeTab === 'reports' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 className="m-0 text-primary" style={{ fontSize: '1.8rem' }}>Help & Support Desk</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div style={modernCard}>
                                <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Submit a Ticket</h3>
                                <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>Subject</label><input type="text" value={reportForm.subject} onChange={(e) => setReportForm({...reportForm, subject: e.target.value})} placeholder="Ex. Inquiry about renewal" required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>Message</label><textarea rows="5" value={reportForm.message} onChange={(e) => setReportForm({...reportForm, message: e.target.value})} placeholder="Type your concern here..." required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}></textarea></div>
                                    <button type="submit" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: '600' }}>Send to Admin</button>
                                </form>
                            </div>
                            <div style={modernCard}>
                                <div className="flex-between mb-1" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}><h3 style={{ margin: 0, color: '#1e293b' }}>My Tickets</h3><span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>{reports.length}</span></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                                    {reports.length === 0 ? <p className="text-muted text-center">Wala ka pang naisusumiteng report.</p> : reports.map(r => (
                                        <div key={r._id} style={{ backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '8px', borderLeft: `4px solid ${r.status === 'Resolved' ? '#2FA084' : '#f59e0b'}` }}>
                                            <div className="flex-between mb-1"><h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>{r.subject}</h4><span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: r.status === 'Resolved' ? '#eaf6f3' : '#fef3c7', color: r.status === 'Resolved' ? '#2FA084' : '#d97706' }}>{r.status}</span></div>
                                            <p style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>{r.message}</p>
                                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Submitted: {new Date(r.createdAt).toLocaleDateString()}</div>
                                            {r.response && (
                                                <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6', marginTop: '0.8rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                    <p style={{ margin: '0 0 0.3rem 0', fontWeight: '600', color: '#3b82f6', fontSize: '0.8rem', textTransform: 'uppercase' }}>Admin Reply:</p>
                                                    <p style={{ margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: '1.4' }}>{r.response}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CALENDAR SCHEDULE */}
                {activeTab === 'calendar' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 className="m-0 text-primary" style={{ fontSize: '1.8rem' }}>Office Schedule</h2>
                        <div style={modernCard}>
                            {calendarEvents.length === 0 ? (<p className="text-muted text-center" style={{ padding: '2rem' }}>Walang nakatakdang schedule ngayon.</p>) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {calendarEvents.map((ev, idx) => (
                                        <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '8px', borderLeft: `5px solid ${ev.status === 'Available' ? '#2FA084' : ev.status === 'E-Sign Mode' ? '#f59e0b' : '#ef4444'}` }}>
                                            <h4 style={{ margin: '0 0 0.3rem 0', color: '#0f172a', fontSize: '1.1rem' }}>{ev.date} <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 'normal', marginLeft: '10px' }}>— {ev.status}</span></h4>
                                            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>{ev.note}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MY PROFILE */}
                {activeTab === 'profile' && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{...modernCard, width: '100%', maxWidth: '600px'}}>
                            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Profile Settings</h2>
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f1f5f9', border: '4px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {profilePic ? <img src={URL.createObjectURL(profilePic)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" /> : savedProfilePic ? <img src={getImageUrl(savedProfilePic)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Saved Profile" /> : <img src={usersIcon} style={{ width: '50px', opacity: 0.4 }} alt="Default" />}
                                    </div>
                                    <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', fontSize: '0.85rem' }} />
                                </div>
                                <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>Full Name</label><input type="text" name="name" value={profileData.name} onChange={handleProfileChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>Home Address</label><input type="text" name="address" value={profileData.address} onChange={handleProfileChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '8px', fontWeight: '600', marginTop: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>Save Profile Updates</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ACCOUNT SETTINGS (Password) */}
                {activeTab === 'settings' && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{...modernCard, width: '100%', maxWidth: '500px'}}>
                            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Security Settings</h2>
                            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>Current Password</label><input type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>New Password</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>Confirm New Password</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} /></div>
                                <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '8px', fontWeight: '600', marginTop: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>Update Security Info</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}