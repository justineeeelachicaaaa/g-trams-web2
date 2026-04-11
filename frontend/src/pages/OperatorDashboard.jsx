import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OperatorDashboard() {
    const [activeTab, setActiveTab] = useState('franchises'); 
    const [myFranchises, setMyFranchises] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [formData, setFormData] = useState({
        zone: '', made: '', make: '', motorNo: '', chassisNo: '', plateNo: '',
        todaName: '', dateKinuha: '', address: '', serialNo: ''
    });
    const [orCrFile, setOrCrFile] = useState(null); 
    const [renewingId, setRenewingId] = useState(null);
    const [renewData, setRenewData] = useState({ serialNo: '', dateKinuha: '', address: '' });

    const [profileData, setProfileData] = useState({ name: '', address: '' });
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        if (!token) navigate('/login');
        else fetchMyFranchises();
    }, [navigate, token]);

    const fetchMyFranchises = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/franchises/my-franchises', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMyFranchises(data);
        } catch (error) {
            console.error("error fetching data:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleRenewChange = (e) => setRenewData({ ...renewData, [e.target.name]: e.target.value });
    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

    const canApply = myFranchises.length < 2;

    const handleApply = async (e) => {
        e.preventDefault();
        if (!canApply) return alert("hanggang dalawang (2) prangkisa lang ang pwede per operator.");

        try {
            const submitData = new FormData();
            submitData.append('todaName', formData.todaName);
            submitData.append('zone', formData.zone);
            submitData.append('plateNo', formData.plateNo);
            submitData.append('made', formData.made);
            submitData.append('make', formData.make);
            submitData.append('motorNo', formData.motorNo);
            submitData.append('chassisNo', formData.chassisNo);
            
            submitData.append('taxIdSedula', JSON.stringify({ 
                dateKinuha: formData.dateKinuha, address: formData.address, serialNo: formData.serialNo 
            }));

            if (orCrFile) submitData.append('orCrDocument', orCrFile);

            const res = await fetch('http://localhost:3000/api/v1/franchises', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: submitData
            });

            if (res.ok) {
                alert('Application Submitted!');
                fetchMyFranchises(); 
                setFormData({ zone: '', made: '', make: '', motorNo: '', chassisNo: '', plateNo: '', todaName: '', dateKinuha: '', address: '', serialNo: '' });
                setOrCrFile(null); 
            } else {
                const data = await res.json();
                alert(data.message || 'error sa pag-submit.');
            }
        } catch (error) {
            console.error('error applying:', error);
        }
    };

    const submitRenewal = async (e, id) => {
        e.preventDefault();
        try {
            const payload = {
                dateApplied: new Date().toISOString(),
                taxIdSedula: { serialNo: renewData.serialNo, dateKinuha: renewData.dateKinuha, address: renewData.address }
            };
            const res = await fetch(`http://localhost:3000/api/v1/franchises/${id}/renew`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert('Renewal request submitted!');
                setRenewingId(null);
                setRenewData({ serialNo: '', dateKinuha: '', address: '' });
                fetchMyFranchises();
            } else {
                alert('error submitting renewal.');
            }
        } catch (error) {
            console.error('error renewing:', error);
        }
    };

    const handleCancelFranchise = async (id) => {
        const reason = window.prompt("bakit mo ika-cancel ang prangkisang ito?");
        if (reason === null || reason.trim() === '') {
            alert("kailangan mong maglagay ng rason para makapag-cancel.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/api/v1/franchises/${id}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ cancelReason: reason })
            });

            if (res.ok) fetchMyFranchises();
        } catch (error) {
            console.error("error cancelling:", error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('address', profileData.address);
            if (profilePic) formData.append('profilePic', profilePic);

            const res = await fetch('http://localhost:3000/api/v1/auth/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                alert("profile updated!");
                setProfileData({ name: '', address: '' });
                setProfilePic(null);
            } else {
                alert("error updating profile.");
            }
        } catch (error) {
            console.error("error:", error);
        }
    };

    return (
        <div className="admin-layout">
            <div className="sidebar no-print">
                <div className="sidebar-title">G-TRAMS</div>
                <button className={`nav-button ${activeTab === 'franchises' ? 'active' : ''}`} onClick={() => setActiveTab('franchises')}>
                    🛺 My Franchises
                </button>
                <button className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                    👤 My Profile
                </button>
                
                <div style={{ flex: 1 }}></div>
                <button className="danger" onClick={handleLogout} style={{ width: '100%', padding: '12px' }}>Log Out</button>
            </div>

            <div className="admin-content">
                
                {activeTab === 'franchises' && (
                    <div>
                        <h2 style={{ color: '#0f172a', marginTop: 0 }}>My Franchises</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Pamahalaan ang iyong mga tricycle units. (Max 2 units per operator)</p>

                        <div className="main-grid">
                            <div className="card">
                                <h3 style={{ color: '#0f172a' }}>Mag-apply ng Prangkisa</h3>
                                
                                {!canApply ? (
                                    <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', border: '1px solid #fca5a5', marginTop: '1rem' }}>
                                        <p style={{ margin: 0, color: '#991b1b', fontWeight: 'bold' }}>Limit Reached: Hanggang dalawang (2) units lang ang pwedeng i-rehistro ng bawat operator.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApply} style={{ marginTop: '1rem' }}>
                                        <div className="form-grid">
                                            <div><label style={{color: '#334155'}}>TODA Name</label><input type="text" name="todaName" value={formData.todaName} onChange={handleChange} required /></div>
                                            <div><label style={{color: '#334155'}}>Zone</label><input type="text" name="zone" value={formData.zone} onChange={handleChange} required /></div>
                                            <div><label style={{color: '#334155'}}>Plate No.</label><input type="text" name="plateNo" value={formData.plateNo} onChange={handleChange} required /></div>
                                            <div><label style={{color: '#334155'}}>Made</label><input type="text" name="made" value={formData.made} onChange={handleChange} required /></div>
                                            <div className="span-2"><label style={{color: '#334155'}}>Make</label><input type="text" name="make" value={formData.make} onChange={handleChange} required /></div>
                                            <div><label style={{color: '#334155'}}>Motor No.</label><input type="text" name="motorNo" value={formData.motorNo} onChange={handleChange} required /></div>
                                            <div><label style={{color: '#334155'}}>Chassis No.</label><input type="text" name="chassisNo" value={formData.chassisNo} onChange={handleChange} required /></div>
                                        </div>
                                        <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0', borderStyle: 'solid' }} />
                                        <h4 style={{ marginBottom: '1rem', color: '#64748b' }}>Detalye ng Sedula</h4>
                                        <div className="form-grid">
                                            <div><label style={{color: '#334155'}}>Serial No.</label><input type="text" name="serialNo" value={formData.serialNo} onChange={handleChange} required /></div>
                                            <div><label style={{color: '#334155'}}>Date Kinuha</label><input type="date" name="dateKinuha" value={formData.dateKinuha} onChange={handleChange} required /></div>
                                            <div className="span-2"><label style={{color: '#334155'}}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} required /></div>
                                        </div>
                                        
                                        <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0', borderStyle: 'solid' }} />
                                        <div className="span-2">
                                            <label style={{ color: '#64748b', fontWeight: 'bold' }}>Upload LTO OR/CR o Barangay Clearance</label>
                                            <input type="file" accept="image/*,.pdf" onChange={(e) => setOrCrFile(e.target.files[0])} style={{ padding: '0.5rem 0', width: '100%' }} />
                                        </div>

                                        <button type="submit" style={{ width: '100%', marginTop: '1rem', backgroundColor: '#2563eb' }}>I-submit ang Application</button>
                                    </form>
                                )}
                            </div>

                            <div className="card" style={{ alignSelf: 'start' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ color: '#0f172a', margin: 0 }}>Listahan ng Units</h3>
                                    <span style={{ backgroundColor: '#e2e8f0', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>
                                        {myFranchises.length} / 2 Units
                                    </span>
                                </div>
                                
                                {myFranchises.length === 0 ? (
                                    <p style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b' }}>Wala ka pang naka-register na prangkisa.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                        {myFranchises.map(franchise => (
                                            <div key={franchise._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                                                
                                                <div style={{ marginBottom: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                        <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>{franchise.plateNo}</strong>
                                                        <span className={`badge ${franchise.status.toLowerCase()}`}>{franchise.status}</span>
                                                    </div>
                                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#475569' }}><strong>Unit:</strong> {franchise.make} {franchise.made}</p>
                                                    <p style={{ margin: '0', fontSize: '0.85rem', color: '#475569' }}><strong>Zone:</strong> {franchise.zone} | <strong>TODA:</strong> {franchise.todaName}</p>
                                                </div>

                                                {/* KUNG CANCELLED, IPAPAKITA YUNG RASON KUNG BAKIT */}
                                                {franchise.status === 'Cancelled' && franchise.cancelReason && (
                                                    <div style={{ backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', border: '1px solid #fca5a5', marginTop: '10px', marginBottom: '10px' }}>
                                                        <p style={{ margin: 0, color: '#991b1b', fontSize: '0.85rem' }}><strong>Rason ng Pag-cancel:</strong> {franchise.cancelReason}</p>
                                                    </div>
                                                )}
                                                
                                                {franchise.status !== 'Cancelled' && (
                                                    <button onClick={() => handleCancelFranchise(franchise._id)} style={{ width: '100%', backgroundColor: '#ef4444', fontSize: '0.85rem', padding: '6px', marginTop: '5px' }}>
                                                        I-Cancel ang Prangkisa
                                                    </button>
                                                )}

                                                {franchise.status === 'Expired' && renewingId !== franchise._id && (
                                                    <button onClick={() => setRenewingId(franchise._id)} style={{ width: '100%', backgroundColor: '#f59e0b', fontSize: '0.9rem', padding: '8px', marginTop: '10px' }}>Mag-Renew</button>
                                                )}

                                                {renewingId === franchise._id && (
                                                    <form onSubmit={(e) => submitRenewal(e, franchise._id)} style={{ marginTop: '10px', padding: '10px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '5px' }}>
                                                        <input type="text" name="serialNo" placeholder="Bagong Sedula Serial" value={renewData.serialNo} onChange={handleRenewChange} required style={{ padding: '6px', marginBottom: '8px' }}/>
                                                        <input type="date" name="dateKinuha" value={renewData.dateKinuha} onChange={handleRenewChange} required style={{ padding: '6px', marginBottom: '8px' }}/>
                                                        <input type="text" name="address" placeholder="Saan Kinuha?" value={renewData.address} onChange={handleRenewChange} required style={{ padding: '6px', marginBottom: '10px' }}/>
                                                        <div style={{ display: 'flex', gap: '5px' }}><button type="submit" style={{ flex: 1, padding: '6px', backgroundColor: '#10b981' }}>I-submit</button><button type="button" onClick={() => setRenewingId(null)} className="danger" style={{ flex: 1, padding: '6px' }}>Back</button></div>
                                                    </form>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0f172a', marginTop: 0 }}>My Profile</h2>
                        <p style={{ color: '#64748b' }}>I-update ang iyong personal na detalye at profile picture.</p>
                        <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />

                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #2563eb', marginBottom: '10px' }}>
                                    {profilePic ? (
                                        <img src={URL.createObjectURL(profilePic)} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '3rem' }}>👤</span>
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} style={{ width: '200px', padding: '5px', fontSize: '0.8rem' }} />
                            </div>

                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>Buong Pangalan</label>
                            <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} placeholder="Ilagay ang bagong pangalan..." />

                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155', marginTop: '10px' }}>Home Address</label>
                            <input type="text" name="address" value={profileData.address} onChange={handleProfileChange} placeholder="Ilagay ang bagong address..." />

                            <button type="submit" style={{ width: '100%', marginTop: '1rem', backgroundColor: '#2563eb' }}>
                                Save Profile Changes
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}