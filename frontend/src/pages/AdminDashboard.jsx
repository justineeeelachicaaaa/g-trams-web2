import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import dashboardIcon from '../assets/dashboard-icon.png';
import analyticsIcon from '../assets/analytics-icon.png';
import usersIcon from '../assets/users-icon.png';
import searchIcon from '../assets/search-icon.png';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('admin'); 
    
    const [franchises, setFranchises] = useState([]);
    const [users, setUsers] = useState([]); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filterToda, setFilterToda] = useState('All'); 
    const [selectedFranchise, setSelectedFranchise] = useState(null); 

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        operator: '', 
        plateNo: '',
        todaName: '',
        make: '',
        made: '',
        applicationType: 'New',
        status: 'Active'
    });

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
            const res = await fetch('http://localhost:3000/api/v1/franchises', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setFranchises(data);
        } catch (error) {
            console.error("error fetching data:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/auth', { headers: { 'Authorization': `Bearer ${token}` } });
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
            reason = window.prompt("Bakit mo ika-cancel? Ilagay ang rason:");
            if (reason === null || reason.trim() === '') {
                alert("Kailangan maglagay ng rason pag magka-cancel.");
                return; 
            }
        }

        try {
            const res = await fetch(`http://localhost:3000/api/v1/franchises/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus, cancelReason: reason }) 
            });
            if (res.ok) {
                alert(`Status successfully changed to ${newStatus}`);
                fetchFranchises();
            }
        } catch (error) {
            console.error("error updating status:", error);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAddModal = () => {
        setFormData({ operator: '', plateNo: '', todaName: '', make: '', made: '', applicationType: 'New', status: 'Active' });
        setEditingId(null);
        setShowFormModal(true);
    };

    const openEditModal = (franchise) => {
        setFormData({
            operator: franchise.operator?._id || '',
            plateNo: franchise.plateNo || '',
            todaName: franchise.todaName || '',
            make: franchise.make || '',
            made: franchise.made || '',
            applicationType: franchise.applicationType || 'New',
            status: franchise.status || 'Active'
        });
        setEditingId(franchise._id);
        setShowFormModal(true);
    };

    const handleSaveFranchise = async (e) => {
        e.preventDefault();
        const url = editingId 
            ? `http://localhost:3000/api/v1/franchises/${editingId}` 
            : 'http://localhost:3000/api/v1/franchises';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(`Franchise successfully ${editingId ? 'updated' : 'added'}!`);
                setShowFormModal(false);
                fetchFranchises();
            } else {
                alert('Failed to save franchise. Make sure to select an Operator.');
            }
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to completely delete this franchise? This action cannot be undone.")) return;
        
        try {
            const res = await fetch(`http://localhost:3000/api/v1/franchises/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Franchise deleted successfully.');
                fetchFranchises();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const getExpiryDate = (dateApplied) => {
        const applied = new Date(dateApplied);
        const expiry = new Date(applied.setFullYear(applied.getFullYear() + 1));
        return expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

    const recentApplications = [...franchises].sort((a, b) => new Date(b.createdAt || b.dateApplied) - new Date(a.createdAt || a.dateApplied)).slice(0, 5);
    const recentHistory = [...franchises].sort((a, b) => new Date(b.updatedAt || b.dateApplied) - new Date(a.updatedAt || a.dateApplied)).slice(0, 6);

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
                
                <button className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={dashboardIcon} alt="Dashboard" style={{ width: '22px', height: '22px' }} /> Dashboard
                </button>

                <button className={`nav-button ${activeTab === 'masterlist' ? 'active' : ''}`} onClick={() => setActiveTab('masterlist')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>📄</span> Masterlist
                </button>

                <button className={`nav-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={analyticsIcon} alt="Analytics" style={{ width: '22px', height: '22px' }} /> Analytics
                </button>
                <button className={`nav-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={usersIcon} alt="Users" style={{ width: '22px', height: '22px' }} /> Users
                </button>
                
                <div style={{ flex: 1 }}></div>
                <button className="danger" onClick={handleLogout} style={{ width: '100%', padding: '12px' }}>Log Out</button>
            </div>

            <div className="admin-content">
                
                {/* --- 1. ADMIN DASHBOARD OVERVIEW --- */}
                {activeTab === 'admin' && (
                    <div>
                        <h2 className="no-print" style={{ color: '#0f172a', marginTop: 0 }}>Dashboard Overview</h2>
                        <p className="no-print" style={{ color: '#64748b', marginBottom: '2rem' }}>Quick actions at summary ng system data.</p>
                        
                        {/* Summary Cards */}
                        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
                        </div>

                        {/* Recent Applications & Transaction History Grid */}
                        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                            
                            <div className="card">
                                <h3>Recent Applications</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Mabilisang pag-approve o pag-update ng status.</p>
                                
                                {recentApplications.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                        Walang recent applications. Maghintay ng Operator registration.
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #e2e8f0', fontSize: '0.9rem' }}>
                                                <th style={{ padding: '10px' }}>Operator</th>
                                                <th style={{ padding: '10px' }}>Plate No.</th>
                                                <th style={{ padding: '10px' }}>Status</th>
                                                <th style={{ padding: '10px', textAlign: 'center' }}>Quick Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentApplications.map(franchise => (
                                                <tr key={franchise._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '10px', fontSize: '0.95rem' }}><strong>{franchise.operator?.name || 'Unknown'}</strong></td>
                                                    <td style={{ padding: '10px', fontSize: '0.95rem' }}>{franchise.plateNo}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        <span className={`badge ${franchise.status.toLowerCase()}`}>{franchise.status}</span>
                                                    </td>
                                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                                        <select 
                                                            value={franchise.status} 
                                                            onChange={(e) => handleStatusChange(franchise._id, e.target.value)} 
                                                            style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', width: 'auto' }}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Active">Approve</option>
                                                            <option value="Expired">Expired</option>
                                                            <option value="Cancelled">Cancel</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="card">
                                <h3>Transaction History</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Mga pinakabagong update.</p>
                                
                                {recentHistory.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                        Walang transaction history.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {recentHistory.map((history, idx) => {
                                            const updateDate = new Date(history.updatedAt || history.dateApplied).toLocaleDateString();
                                            return (
                                                <div key={idx} style={{ padding: '10px', borderLeft: `4px solid ${history.status === 'Active' ? '#10b981' : history.status === 'Pending' ? '#f59e0b' : '#ef4444'}`, backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>Plate No: {history.plateNo}</p>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Status updated to: <strong>{history.status}</strong></p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{updateDate}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 2. FRANCHISE MASTERLIST --- */}
                {activeTab === 'masterlist' && (
                    <div className="card table-responsive">
                        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Franchise Master List</h3>
                            
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button onClick={() => window.print()} style={{ backgroundColor: '#64748b', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>🖨️ I-print All</button>
                                <button onClick={openAddModal} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>+ Add Franchise</button>
                                
                                <select value={filterToda} onChange={(e) => setFilterToda(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', width: 'auto' }}>
                                    {uniqueTodas.map(toda => <option key={toda} value={toda}>{toda === 'All' ? 'Lahat ng TODA' : toda}</option>)}
                                </select>
                                
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '0 10px', borderRadius: '6px' }}>
                                    <img src={searchIcon} alt="Search" style={{ width: '18px', height: '18px', opacity: 0.5 }} />
                                    <input 
                                        type="text" 
                                        placeholder="Hanapin..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        style={{ border: 'none', outline: 'none', margin: 0, padding: '0.5rem', backgroundColor: 'transparent' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'none' }} className="print-header">
                            <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>Municipality of Gasan</h2>
                            <h3 style={{ textAlign: 'center', marginTop: '0', color: '#64748b' }}>Tricycle Franchise Masterlist</h3>
                        </div>

                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px' }}>Operator Name</th>
                                    <th style={{ padding: '12px' }}>Plate No.</th>
                                    <th style={{ padding: '12px' }}>TODA</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Valid Until</th>
                                    <th className="no-print" style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedFranchises.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '1rem' }}>
                                            Wala pang laman ang Masterlist. I-click ang "+ Add Franchise" para mag-umpisa.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedFranchises.map(franchise => {
                                        const expiryInfo = checkExpiryStatus(franchise.dateApplied);
                                        return (
                                            <tr key={franchise._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px' }}><strong>{franchise.operator?.name || 'Unknown'}</strong></td>
                                                <td style={{ padding: '12px' }}>{franchise.plateNo}</td>
                                                <td style={{ padding: '12px' }}>{franchise.todaName}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span className={`badge ${franchise.status.toLowerCase()}`}>{franchise.status}</span>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{ display: 'block', fontWeight: 'bold' }}>{getExpiryDate(franchise.dateApplied)}</span>
                                                    <span style={{ fontSize: '0.8rem', color: expiryInfo.color }}>{expiryInfo.label}</span>
                                                </td>
                                                <td className="no-print" style={{ padding: '12px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                    <button onClick={() => setSelectedFranchise(franchise)} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>View</button>
                                                    <button onClick={() => openEditModal(franchise)} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
                                                    <button onClick={() => handleDelete(franchise._id)} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- 3. ANALYTICS & USERS (Retained) --- */}
                {activeTab === 'analytics' && (
                    <div>
                        <h2 style={{ color: '#0f172a', marginTop: 0 }}>Analytics Dashboard</h2>
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
                            <h2 style={{ margin: 0 }}>System Users</h2>
                            <span style={{ backgroundColor: '#e2e8f0', padding: '5px 10px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>Total: {users.length}</span>
                        </div>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px' }}>Name</th>
                                    <th style={{ padding: '12px' }}>Email</th>
                                    <th style={{ padding: '12px' }}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}><strong>{user.name}</strong></td>
                                        <td style={{ padding: '12px' }}>{user.email}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: user.role === 'admin' ? '#fee2e2' : '#dbeafe', color: user.role === 'admin' ? '#ef4444' : '#2563eb' }}>
                                                {user.role ? user.role.toUpperCase() : 'OPERATOR'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* EDIT/ADD MODAL (Original Simple Form) */}
            {showFormModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
                        <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Franchise' : 'Add New Franchise'}</h2>
                        <form onSubmit={handleSaveFranchise} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '1rem' }}>
                            <select name="operator" value={formData.operator} onChange={handleFormChange} required style={{ width: '100%', padding: '10px' }}>
                                <option value="" disabled>Pumili ng Operator...</option>
                                {users.filter(u => u.role === 'operator').map(user => (
                                    <option key={user._id} value={user._id}>{user.name}</option>
                                ))}
                            </select>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input type="text" name="plateNo" placeholder="Plate No." value={formData.plateNo} onChange={handleFormChange} required style={{ flex: 1, padding: '10px' }} />
                                <input type="text" name="todaName" placeholder="TODA Name" value={formData.todaName} onChange={handleFormChange} required style={{ flex: 1, padding: '10px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input type="text" name="make" placeholder="Make (e.g. Honda)" value={formData.make} onChange={handleFormChange} required style={{ flex: 1, padding: '10px' }} />
                                <input type="text" name="made" placeholder="Model/Year" value={formData.made} onChange={handleFormChange} required style={{ flex: 1, padding: '10px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <select name="applicationType" value={formData.applicationType} onChange={handleFormChange} style={{ flex: 1, padding: '10px' }}>
                                    <option value="New">New</option><option value="Renewal">Renewal</option>
                                </select>
                                <select name="status" value={formData.status} onChange={handleFormChange} style={{ flex: 1, padding: '10px' }}>
                                    <option value="Active">Active (Approve)</option><option value="Pending">Pending</option>
                                    <option value="Expired">Expired</option><option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowFormModal(false)} style={{ flex: 1, padding: '12px', background: '#e2e8f0', color: 'black' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white' }}>Save Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* FULL DETAILS VIEW MODAL w/ PRINT FUNCTION */}
            {selectedFranchise && (
                <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', position: 'relative' }}>
                        <button onClick={() => setSelectedFranchise(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'red', color: 'white', borderRadius: '50%', width: '30px', height: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>X</button>
                        
                        <h2 style={{ margin: '0 0 10px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Franchise Details</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#2563eb' }}>Operator Information</h4>
                                <p style={{ margin: 0 }}><strong>Name:</strong> {selectedFranchise.operator?.name}</p>
                                <p style={{ margin: 0 }}><strong>Email:</strong> {selectedFranchise.operator?.email}</p>
                            </div>

                            <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#10b981' }}>Tricycle Specifications</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <p style={{ margin: 0 }}><strong>Plate No:</strong> {selectedFranchise.plateNo}</p>
                                    <p style={{ margin: 0 }}><strong>TODA:</strong> {selectedFranchise.todaName}</p>
                                    <p style={{ margin: 0 }}><strong>Unit Make:</strong> {selectedFranchise.make}</p>
                                    <p style={{ margin: 0 }}><strong>Unit Model/Year:</strong> {selectedFranchise.made}</p>
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#f59e0b' }}>Application Status</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <p style={{ margin: 0 }}><strong>Type:</strong> {selectedFranchise.applicationType}</p>
                                    <p style={{ margin: 0 }}><strong>Status:</strong> <span className={`badge ${selectedFranchise.status.toLowerCase()}`}>{selectedFranchise.status}</span></p>
                                    <p style={{ margin: 0 }}><strong>Date Applied:</strong> {new Date(selectedFranchise.dateApplied || selectedFranchise.createdAt).toLocaleDateString()}</p>
                                    <p style={{ margin: 0 }}><strong>Valid Until:</strong> {getExpiryDate(selectedFranchise.dateApplied || selectedFranchise.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        {/* PRINT BUTTON - LALABAS LANG KAPAG ACTIVE(APPROVED) */}
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                            {selectedFranchise.status === 'Active' ? (
                                <button 
                                    onClick={() => {
                                        // Pagtago ng background modal, pag-print, tapos pagbalik
                                        const printContent = document.getElementById('print-permit');
                                        const originalBody = document.body.innerHTML;
                                        document.body.innerHTML = printContent.innerHTML;
                                        window.print();
                                        document.body.innerHTML = originalBody;
                                        window.location.reload(); // Kailangang i-reload para bumalik yung React state
                                    }} 
                                    style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', width: '100%' }}
                                >
                                    🖨️ Print Franchise Permit
                                </button>
                            ) : (
                                <p style={{ color: '#ef4444', fontStyle: 'italic', margin: 0, textAlign: 'center', width: '100%' }}>
                                    Hindi pwedeng i-print. Ang status ay kailangang 'Active'.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HIDDEN PRINT PERMIT TEMPLATE */}
            {selectedFranchise && (
                <div id="print-permit" style={{ display: 'none' }}>
                    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: 'black' }}>
                        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '30px' }}>
                            <h2>MUNICIPALITY OF GASAN</h2>
                            <h3>TRICYCLE FRANCHISE PERMIT</h3>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <p><strong>Operator Name:</strong> {selectedFranchise.operator?.name}</p>
                            <p><strong>Address:</strong> {selectedFranchise.operator?.address || 'Gasan, Marinduque'}</p>
                        </div>
                        
                        <div style={{ marginBottom: '30px' }}>
                            <p><strong>Plate Number:</strong> {selectedFranchise.plateNo}</p>
                            <p><strong>TODA / Route:</strong> {selectedFranchise.todaName}</p>
                            <p><strong>Make & Model:</strong> {selectedFranchise.make} - {selectedFranchise.made}</p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                            <p><strong>Date Issued:</strong> {new Date(selectedFranchise.dateApplied || selectedFranchise.createdAt).toLocaleDateString()}</p>
                            <p><strong>Valid Until:</strong> {getExpiryDate(selectedFranchise.dateApplied || selectedFranchise.createdAt)}</p>
                        </div>

                        <div style={{ marginTop: '80px', textAlign: 'right' }}>
                            <p>___________________________</p>
                            <p><strong>Municipal Mayor</strong></p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}