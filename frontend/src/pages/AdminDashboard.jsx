import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('admin'); 
    
    const [franchises, setFranchises] = useState([]);
    const [users, setUsers] = useState([]); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filterToda, setFilterToda] = useState('All'); 
    const [selectedFranchise, setSelectedFranchise] = useState(null); 

    const navigate = useNavigate();
    const token = localStorage.getItem('token'); 

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            fetchFranchises();
            fetchUsers();
        }
    }, [navigate, token]);

    const fetchFranchises = async () => {
        try {
            const res = await fetch('https://g-trams-web2.onrender.com/api/v1/franchises', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setFranchises(data);
        } catch (error) {
            console.error("error fetching data:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            // inayos na yung route dito papuntang /auth
            const res = await fetch('https://g-trams-web2.onrender.com/api/v1/auth', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("error fetching users:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/login');
    };

    const handleStatusChange = async (id, newStatus) => {
        let reason = '';
        if (newStatus === 'Cancelled') {
            reason = window.prompt("bakit mo ika-cancel? ilagay ang rason:");
            if (reason === null || reason.trim() === '') {
                alert("kailangan maglagay ng rason pag magka-cancel.");
                return; 
            }
        }

        try {
            const res = await fetch(`https://g-trams-web2.onrender.com/api/v1/franchises/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus, cancelReason: reason }) 
            });
            if (res.ok) fetchFranchises();
        } catch (error) {
            console.error("error updating status:", error);
        }
    };

    const checkExpiryStatus = (dateApplied) => {
        const applied = new Date(dateApplied);
        const expiry = new Date(applied.setFullYear(applied.getFullYear() + 1));
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { label: 'Expired', color: '#ef4444', days: diffDays };
        if (diffDays <= 30) return { label: 'Expiring Soon', color: '#f59e0b', days: diffDays };
        return { label: 'Valid', color: '#10b981', days: diffDays };
    };

    const totalFranchises = franchises.length;
    const pendingFranchises = franchises.filter(f => f.status === 'Pending').length;
    const expiredFranchises = franchises.filter(f => f.status === 'Expired').length;
    const cancelledFranchises = franchises.filter(f => f.status === 'Cancelled').length;
    const renewalApps = franchises.filter(f => f.applicationType === 'Renewal').length;
    const activeFranchises = franchises.filter(f => f.status === 'Active').length; 

    const uniqueTodas = ['All', ...new Set(franchises.map(f => f.todaName))];

    const todaChartData = uniqueTodas.filter(t => t !== 'All').map(toda => ({
        name: toda,
        value: franchises.filter(f => f.todaName === toda).length
    }));
    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const filteredFranchises = franchises.filter(franchise => {
        const searchMatch = (franchise.operator?.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                            (franchise.plateNo.toLowerCase().includes(searchTerm.toLowerCase()));
        const todaMatch = filterToda === 'All' ? true : franchise.todaName === filterToda;
        return searchMatch && todaMatch;
    });

    const sortedFranchises = [...filteredFranchises].sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return 0; 
    });

    return (
        <div className="admin-layout">
            <div className="sidebar no-print">
                <div className="sidebar-title">G-TRAMS</div>
                <button className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
                    📋 Admin Dashboard
                </button>
                <button className={`nav-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                    📊 Analytics
                </button>
                <button className={`nav-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    👥 User Management
                </button>
                
                <div style={{ flex: 1 }}></div>
                <button className="danger" onClick={handleLogout} style={{ width: '100%', padding: '12px' }}>Log Out</button>
            </div>

            <div className="admin-content">
                
                {activeTab === 'admin' && (
                    <div>
                        <h2 style={{ color: '#0f172a', marginTop: 0 }}>Admin Dashboard</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Manage all tricycle franchise records and applications.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #2563eb' }}>
                                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#2563eb' }}>{totalFranchises}</h3>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>Total</p>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
                                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#f59e0b' }}>{pendingFranchises}</h3>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>Pending</p>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #8b5cf6' }}>
                                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#8b5cf6' }}>{renewalApps}</h3>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>Renewals</p>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
                                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#ef4444' }}>{expiredFranchises}</h3>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>Expired</p>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #64748b' }}>
                                <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#64748b' }}>{cancelledFranchises}</h3>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>Cancelled</p>
                            </div>
                        </div>

                        <div className="card table-responsive">
                            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Franchise Master List</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => window.print()} style={{ backgroundColor: '#10b981' }}>I-print (PDF)</button>
                                    <select value={filterToda} onChange={(e) => setFilterToda(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px' }}>
                                        {uniqueTodas.map(toda => <option key={toda} value={toda}>{toda === 'All' ? 'Lahat ng TODA' : toda}</option>)}
                                    </select>
                                    <input type="text" placeholder="🔍 Hanapin..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ margin: 0 }}/>
                                </div>
                            </div>

                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px' }}>Operator Name</th>
                                        <th style={{ padding: '12px' }}>Plate No.</th>
                                        <th style={{ padding: '12px' }}>Type</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                        <th style={{ padding: '12px' }}>Expiry Warning</th>
                                        <th className="no-print" style={{ padding: '12px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedFranchises.map(franchise => {
                                        const expiryInfo = checkExpiryStatus(franchise.dateApplied);
                                        return (
                                            <tr key={franchise._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px' }}><strong>{franchise.operator?.name || 'Unknown'}</strong></td>
                                                <td style={{ padding: '12px' }}>{franchise.plateNo}</td>
                                                
                                                <td style={{ padding: '12px', fontSize: '0.9rem', color: '#64748b' }}>
                                                    {franchise.applicationType === 'Renewal' ? 'Renewal' : 'New'}
                                                </td>

                                                <td style={{ padding: '12px' }}>
                                                    <span className={`badge ${franchise.status.toLowerCase()}`}>{franchise.status}</span>
                                                    {franchise.status === 'Cancelled' && franchise.cancelReason && (
                                                        <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '6px', fontStyle: 'italic', maxWidth: '200px' }}>
                                                            "{franchise.cancelReason}"
                                                        </div>
                                                    )}
                                                </td>
                                                
                                                <td style={{ padding: '12px', color: expiryInfo.color, fontWeight: 'bold' }}>
                                                    {expiryInfo.label} {expiryInfo.days > 0 && `(${expiryInfo.days} days left)`}
                                                </td>

                                                <td className="no-print" style={{ padding: '12px', display: 'flex', gap: '5px' }}>
                                                    <button onClick={() => setSelectedFranchise(franchise)} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Details</button>
                                                    <select value={franchise.status} onChange={(e) => handleStatusChange(franchise._id, e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Active">Approve</option>
                                                        <option value="Expired">Expired</option>
                                                        <option value="Cancelled">Cancel</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div>
                        <h2 style={{ color: '#0f172a', marginTop: 0 }}>Analytics Dashboard</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Graphical representation ng mga data.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                            <div className="card">
                                <h3>Franchises per TODA</h3>
                                <div style={{ height: '350px', marginTop: '1rem' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={todaChartData} cx="50%" cy="50%" outerRadius={120} fill="#8884d8" dataKey="value" label>
                                                {todaChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="card">
                                <h3>Status Overview</h3>
                                <div style={{ height: '350px', marginTop: '1rem' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            {name: 'Active', count: activeFranchises}, 
                                            {name: 'Pending', count: pendingFranchises}, 
                                            {name: 'Expired', count: expiredFranchises},
                                            {name: 'Cancelled', count: cancelledFranchises}
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" stroke="#64748b" />
                                            <YAxis stroke="#64748b" />
                                            <RechartsTooltip cursor={{fill: 'transparent'}}/>
                                            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="card table-responsive">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ color: '#0f172a', marginTop: 0, marginBottom: '5px' }}>System Users</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>Manage registered operators and staff.</p>
                            </div>
                            <span style={{ backgroundColor: '#e2e8f0', padding: '5px 10px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Total Users: {users.length}
                            </span>
                        </div>
                        
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px' }}>Name</th>
                                    <th style={{ padding: '12px' }}>Email</th>
                                    <th style={{ padding: '12px' }}>Address</th>
                                    <th style={{ padding: '12px' }}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px' }}><strong>{user.name}</strong></td>
                                            <td style={{ padding: '12px', color: '#64748b' }}>{user.email}</td>
                                            <td style={{ padding: '12px' }}>{user.address || 'N/A'}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: 'bold',
                                                    backgroundColor: user.role === 'admin' ? '#fee2e2' : '#dbeafe',
                                                    color: user.role === 'admin' ? '#ef4444' : '#2563eb'
                                                }}>
                                                    {user.role ? user.role.toUpperCase() : 'OPERATOR'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
            
            {selectedFranchise && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}>
                        <button onClick={() => setSelectedFranchise(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                        
                        <h2 style={{ color: '#0f172a', marginTop: 0 }}>Franchise Details</h2>
                        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                            <span className={`badge ${selectedFranchise.status.toLowerCase()}`}>{selectedFranchise.status}</span>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>
                                ({selectedFranchise.applicationType === 'Renewal' ? 'Renewal Application' : 'New Application'})
                            </span>
                        </div>
                        
                        <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />

                        {selectedFranchise.status === 'Cancelled' && selectedFranchise.cancelReason && (
                            <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fca5a5' }}>
                                <p style={{ margin: 0, color: '#991b1b', fontSize: '0.95rem' }}>
                                    <strong>Cancellation Reason:</strong> {selectedFranchise.cancelReason}
                                </p>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Operator Information</h4>
                                <p style={{margin: '0 0 5px 0'}}><strong>Name:</strong> {selectedFranchise.operator?.name}</p>
                                <p style={{margin: '0 0 5px 0'}}><strong>Email:</strong> {selectedFranchise.operator?.email}</p>
                            </div>
                            
                            <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Tricycle Details</h4>
                            </div>
                            <p style={{margin: '0'}}><strong>Plate No:</strong> {selectedFranchise.plateNo}</p>
                            <p style={{margin: '0'}}><strong>TODA:</strong> {selectedFranchise.todaName}</p>
                            <p style={{margin: '0'}}><strong>Unit:</strong> {selectedFranchise.make} {selectedFranchise.made}</p>

                            {selectedFranchise.orCrUrl && (
                                <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Uploaded Document</h4>
                                    <a href={selectedFranchise.orCrUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>View LTO OR/CR / Clearance</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}