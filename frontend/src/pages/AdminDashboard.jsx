import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// icons and images
import dashboardIcon from '../assets/dashboard-icon.png';
import analyticsIcon from '../assets/analytics-icon.png';
import usersIcon from '../assets/users-icon.png';
import searchIcon from '../assets/search-icon.png';
import masterlistIcon from '../assets/masterlist-icon.png';
import scheduleIcon from '../assets/schedule-icon.png';
import printerIcon from '../assets/printer.png';

// loading gif reference
import loadingGif from '../assets/loading.gif'; 

export default function AdminDashboard() {
    // loading screen state
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('admin'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [franchises, setFranchises] = useState([]);
    const [users, setUsers] = useState([]); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filterToda, setFilterToda] = useState('All'); 
    const [historyLogs, setHistoryLogs] = useState([]); 
    const [reports, setReports] = useState([]); 
    
    const [analyticsMonth, setAnalyticsMonth] = useState('All');
    
    const [selectedFranchise, setSelectedFranchise] = useState(null); 
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewModalData, setViewModalData] = useState({ status: '', eSigned: false, releaseDate: '' });
    const [userModal, setUserModal] = useState({ isOpen: false, mode: 'view', data: null });
    const [passwordPrompt, setPasswordPrompt] = useState({ isOpen: false, action: null, password: '' });
    const [replyModal, setReplyModal] = useState({ isOpen: false, reportId: null, responseText: '' });

    const [formData, setFormData] = useState({ operator: '', plateNo: '', todaName: '', zone: '', make: '', made: '', motorNo: '', chassisNo: '', dateApplied: new Date().toISOString().split('T')[0], cedulaDate: '', cedulaAddress: '', cedulaSerialNo: '', applicationType: 'New', status: 'Active' });
    const [userFormData, setUserFormData] = useState({ name: '', email: '', role: '', address: '' });
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [calendarForm, setCalendarForm] = useState({ date: '', status: 'Available', note: '' });

    const navigate = useNavigate();
    const token = localStorage.getItem('token'); 

    // update api base url
    const API_BASE_URL = 'https://g-trams-web2.onrender.com/api/v1';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // fetch data with loading state
    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            const loadAllData = async () => {
                setIsLoading(true); 
                try {
                    // fetch all data concurrently using live api link
                    await Promise.all([
                        fetchFranchises(),
                        fetchUsers(),
                        fetchCalendarEvents(),
                        fetchReports()
                    ]);
                } catch (error) {
                    console.error("error loading data", error);
                } finally {
                    setIsLoading(false); 
                }
            };
            loadAllData();
        }
    }, [navigate, token]);

    // history log processing
    useEffect(() => {
        let logs = [];
        franchises.forEach(f => {
            if (f.updatedAt || f.dateApplied) {
                logs.push({ id: `f-upd-${f._id}`, title: `Franchise: ${f.plateNo}`, desc: `Status marked as ${f.status}`, date: new Date(f.updatedAt || f.dateApplied), color: f.status === 'Active' ? '#2FA084' : f.status === 'Pending' ? '#f59e0b' : '#ef4444' });
            }
        });
        users.forEach(u => {
            if (u.createdAt) { logs.push({ id: `u-${u._id}`, title: `New User Registration`, desc: `${u.name} registered as ${u.role}`, date: new Date(u.createdAt), color: '#3b82f6' }); }
        });
        logs.sort((a, b) => b.date - a.date);
        setHistoryLogs(logs.slice(0, 15));
    }, [franchises, users]);

    const fetchReports = async () => {
        const res = await fetch(`${API_BASE_URL}/reports`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setReports(await res.json());
    };

    const fetchCalendarEvents = async () => {
        const res = await fetch(`${API_BASE_URL}/calendar`, { headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) setCalendarEvents(await res.json());
    };

    const fetchFranchises = async () => {
        const res = await fetch(`${API_BASE_URL}/franchises`, { headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) setFranchises(await res.json());
    };

    const fetchUsers = async () => {
        const res = await fetch(`${API_BASE_URL}/auth`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setUsers(await res.json());
    };

    // event handlers using live link
    const handleAddEvent = async (e) => { e.preventDefault(); try { const res = await fetch(`${API_BASE_URL}/calendar`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(calendarForm) }); if(res.ok) { alert('Saved!'); setCalendarForm({ date: '', status: 'Available', note: '' }); fetchCalendarEvents(); } } catch (e) { console.error(e); } };
    const handleDeleteEvent = async (id) => { if(!window.confirm("Delete this schedule?")) return; try { const res = await fetch(`${API_BASE_URL}/calendar/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if(res.ok) fetchCalendarEvents(); } catch(e) { console.error(e); } };
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // image url logic for render environment
    const getImageUrl = (path) => { if (!path) return ''; return path.startsWith('http') ? path : `https://g-trams-web2.onrender.com/${path.replace(/\\/g, '/')}`; };
    
    const switchTab = (tab) => { setActiveTab(tab); setIsSidebarOpen(false); };
    
    const handleAdvancedApproval = async (e) => { e.preventDefault(); let reason = ''; if (viewModalData.status === 'Cancelled') { reason = window.prompt("Please enter the reason for cancellation:"); if (!reason) return; } try { const res = await fetch(`${API_BASE_URL}/franchises/${selectedFranchise._id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: viewModalData.status, cancelReason: reason, eSigned: viewModalData.eSigned, releaseDate: viewModalData.releaseDate }) }); if (res.ok) { alert(`Updated Successfully!`); fetchFranchises(); setSelectedFranchise(null); } } catch (e) { console.error(e); } };
    
    const handleAdminReply = async (e) => { e.preventDefault(); try { const res = await fetch(`${API_BASE_URL}/reports/${replyModal.reportId}/respond`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ response: replyModal.responseText }) }); if (res.ok) { alert('Reply sent!'); setReplyModal({ isOpen: false, reportId: null, responseText: '' }); fetchReports(); } } catch (error) { console.error(error); } };
    
    const openViewModal = (franchise) => { setSelectedFranchise(franchise); setViewModalData({ status: franchise.status, eSigned: franchise.eSigned || false, releaseDate: franchise.releaseDate || '' }); };
    const openAddModal = () => { setFormData({ operator: '', plateNo: '', todaName: '', zone: '', make: '', made: '', motorNo: '', chassisNo: '', dateApplied: new Date().toISOString().split('T')[0], cedulaDate: '', cedulaAddress: '', cedulaSerialNo: '', applicationType: 'New', status: 'Active' }); setEditingId(null); setShowFormModal(true); };
    const openEditModal = (franchise) => { setFormData({ operator: franchise.operator?._id || '', plateNo: franchise.plateNo || '', todaName: franchise.todaName || '', zone: franchise.zone || '', make: franchise.make || '', made: franchise.made || '', motorNo: franchise.motorNo || '', chassisNo: franchise.chassisNo || '', dateApplied: franchise.dateApplied ? new Date(franchise.dateApplied).toISOString().split('T')[0] : '', cedulaDate: franchise.cedulaDate ? new Date(franchise.cedulaDate).toISOString().split('T')[0] : '', cedulaAddress: franchise.cedulaAddress || '', cedulaSerialNo: franchise.cedulaSerialNo || '', applicationType: franchise.applicationType || 'New', status: franchise.status || 'Active' }); setEditingId(franchise._id); setShowFormModal(true); };
    
    const handleSaveFranchise = async (e) => { e.preventDefault(); const url = editingId ? `${API_BASE_URL}/franchises/${editingId}` : `${API_BASE_URL}/franchises`; const method = editingId ? 'PUT' : 'POST'; try { const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) }); if (res.ok) { alert(`Saved!`); setShowFormModal(false); fetchFranchises(); } else { alert('Failed.'); } } catch (e) { console.error(e); } };
    
    const handleVerifyPassword = async (e) => { e.preventDefault(); try { const res = await fetch(`${API_BASE_URL}/auth/verify-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ password: passwordPrompt.password }) }); if (res.ok) { const { action } = passwordPrompt; setPasswordPrompt({ isOpen: false, action: null, password: '' }); if (action.type === 'delete') { await fetch(`${API_BASE_URL}/auth/${action.target._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchUsers(); } else if (action.type === 'edit') { setUserFormData({ name: action.target.name, email: action.target.email, role: action.target.role, address: action.target.address || '' }); setUserModal({ isOpen: true, mode: 'edit', data: action.target }); } else if (action.type === 'deleteFranchise') { await fetch(`${API_BASE_URL}/franchises/${action.target._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchFranchises(); } else if (action.type === 'editFranchise') { openEditModal(action.target); } } else { alert('Incorrect Admin Password.'); } } catch (e) { console.error(e); } };
    
    const handleSaveUser = async (e) => { e.preventDefault(); try { const res = await fetch(`${API_BASE_URL}/auth/${userModal.data._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(userFormData) }); if (res.ok) { alert('Updated!'); setUserModal({ isOpen: false, mode: 'view', data: null }); fetchUsers(); } } catch (e) { console.error(e); } };
    
    const getExpiryDate = (dateApplied) => { if (!dateApplied) return 'N/A'; const applied = new Date(dateApplied); return new Date(applied.setFullYear(applied.getFullYear() + 1)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); };
    const checkExpiryStatus = (dateApplied) => { const applied = new Date(dateApplied); const diffDays = Math.ceil((new Date(applied.setFullYear(applied.getFullYear() + 1)) - new Date()) / (1000 * 60 * 60 * 24)); if (diffDays < 0) return { label: 'Expired', color: 'var(--danger)' }; if (diffDays <= 30) return { label: 'Expiring Soon', color: 'var(--warning)' }; return { label: 'Valid', color: 'var(--success)' }; };
    const handlePrintPermit = (franchise) => { const printContent = document.getElementById(`print-permit-${franchise._id}`); const originalBody = document.body.innerHTML; document.body.innerHTML = printContent.innerHTML; window.print(); document.body.innerHTML = originalBody; window.location.reload(); };

    // data processing for analytics
    const analyticsFiltered = franchises.filter(f => { if (analyticsMonth === 'All') return true; const date = new Date(f.dateApplied || f.createdAt); return date.getMonth().toString() === analyticsMonth; });
    const uniqueTodas = ['All', ...new Set(franchises.map(f => f.todaName))];
    const todaChartData = [...new Set(analyticsFiltered.map(f => f.todaName))].map(toda => ({ name: toda, value: analyticsFiltered.filter(f => f.todaName === toda).length })).filter(d => d.value > 0);
    const statusChartData = [ { name: 'Active', count: analyticsFiltered.filter(f => f.status === 'Active').length }, { name: 'Pending', count: analyticsFiltered.filter(f => f.status === 'Pending').length }, { name: 'Expired', count: analyticsFiltered.filter(f => f.status === 'Expired').length }, { name: 'Cancelled', count: analyticsFiltered.filter(f => f.status === 'Cancelled').length } ].filter(d => d.count > 0); 
    const typeChartData = [ { name: 'New App', value: analyticsFiltered.filter(f => f.applicationType === 'New').length }, { name: 'Renewal', value: analyticsFiltered.filter(f => f.applicationType === 'Renewal').length } ].filter(d => d.value > 0);
    const getMonthName = (monthValue) => { if (monthValue === 'All') return 'All Time'; const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; return months[parseInt(monthValue)]; };

    const COLORS = ['#1F6F5F', '#2FA084', '#6FCF97', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];
    const TYPE_COLORS = ['#3b82f6', '#8b5cf6']; 
    const sortedFranchises = franchises.filter(f => (f.operator?.name.toLowerCase().includes(searchTerm.toLowerCase())) || (f.plateNo.toLowerCase().includes(searchTerm.toLowerCase()))).sort((a, b) => (a.status === 'Pending' ? -1 : 1));

    // design styles
    const modernCard = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #f1f5f9' };
    const modernTableWrapper = { overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' };
    const thStyle = { backgroundColor: '#f8fafc', padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' };
    const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem', whiteSpace: 'nowrap' };
    const actionBtn = { padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px', fontWeight: '500', transition: 'all 0.2s', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };
    const closeBtnStyle = { fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '3px', cursor: 'pointer', border: 'none', background: 'none', color: '#64748b' };

    // loading screen view
    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
                <img src={loadingGif} alt="Loading..." style={{ width: '150px', height: 'auto', objectFit: 'contain' }} />
                <h3 style={{ color: '#1F6F5F', marginTop: '1rem', fontFamily: 'sans-serif' }}>Loading G-TRAMS Data...</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Please wait while we connect to the server.</p>
            </div>
        );
    }

    return (
        <div className="admin-layout" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: isMobile ? 'block' : 'flex' }}>
            
            {/* mobile header */}
            {isMobile && (
                <div className="mobile-header no-print" style={{ backgroundColor: '#1F6F5F', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div className="flex-row gap-1" style={{ alignItems: 'center' }}>
                        <h3 className="m-0" style={{ fontSize: '1.2rem', fontWeight: '600' }}>G-TRAMS Admin</h3>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer' }}>&#9776;</button>
                </div>
            )}

            {isMobile && <div className={`mobile-overlay no-print ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40, display: isSidebarOpen ? 'block' : 'none' }}></div>}

            {/* sidebar component */}
            <div className={`sidebar-container no-print ${isSidebarOpen ? 'open' : ''}`} style={{ backgroundColor: '#ffffff', boxShadow: '2px 0 8px rgba(0,0,0,0.05)', zIndex: 50, display: (!isMobile || isSidebarOpen) ? 'flex' : 'none', flexDirection: 'column', width: isMobile ? '250px' : '260px', height: '100vh', position: isMobile ? 'fixed' : 'sticky', top: 0, left: 0, transition: 'transform 0.3s ease' }}>
                <div className="sidebar-title flex-column gap-1" style={{ alignItems: 'center', marginBottom: '2rem', padding: '2rem 1rem 0' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #2FA084', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <img src={usersIcon} style={{ width: '40px', opacity: 0.6 }} alt="Admin" />
                    </div>
                    <h3 className="m-0 text-center" style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: '700' }}>Admin Portal</h3>
                </div>

                <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => switchTab('admin')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={dashboardIcon} width="20" height="20" alt="Dashboard" style={{marginRight: '8px'}} /> Dashboard</button>
                    <button className={`nav-button ${activeTab === 'masterlist' ? 'active' : ''}`} onClick={() => switchTab('masterlist')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={masterlistIcon} width="20" height="20" alt="Masterlist" style={{marginRight: '8px'}} /> Masterlist</button>
                    <button className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => switchTab('calendar')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={scheduleIcon} width="20" height="20" alt="Schedule" style={{marginRight: '8px'}} /> Schedule</button>
                    <button className={`nav-button ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => switchTab('reports')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={analyticsIcon} width="20" height="20" alt="Reports" style={{marginRight: '8px'}} /> Feedback Desk</button>
                    <button className={`nav-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => switchTab('analytics')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={analyticsIcon} width="20" height="20" alt="Analytics" style={{marginRight: '8px'}} /> Analytics</button>
                    <button className={`nav-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => switchTab('users')} style={{ borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}><img src={usersIcon} width="20" height="20" alt="Users" style={{marginRight: '8px'}} /> Users</button>
                </div>
                <div style={{ flex: 1 }}></div>
                <div style={{ padding: '1rem' }}>
                    <button className="btn-danger w-100" onClick={handleLogout} style={{ borderRadius: '8px', padding: '0.8rem', fontWeight: '600' }}>Log Out</button>
                </div>
            </div>

            {/* main content area */}
            <div className="content-container" style={{ flex: 1, padding: isMobile ? '1rem' : '2rem', maxWidth: '1400px', width: '100%', overflowX: 'hidden' }}>
                
                {/* admin overview tab */}
                {activeTab === 'admin' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 className="m-0 text-primary no-print" style={{ fontSize: '1.8rem' }}>Dashboard Overview</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }} className="no-print">
                            <div style={{...modernCard, borderTop: '4px solid #2FA084', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                <h3 className="m-0" style={{ fontSize: '2.5rem', color: '#2FA084', fontWeight: '700' }}>{franchises.filter(f => f.status === 'Active').length}</h3>
                                <p className="text-muted m-0 mt-1 font-bold" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>Active Units</p>
                            </div>
                            <div style={{...modernCard, borderTop: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                <h3 className="m-0" style={{ fontSize: '2.5rem', color: '#3b82f6', fontWeight: '700' }}>{franchises.filter(f => f.applicationType === 'New').length}</h3>
                                <p className="text-muted m-0 mt-1 font-bold" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>New Apps</p>
                            </div>
                            <div style={{...modernCard, borderTop: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                <h3 className="m-0" style={{ fontSize: '2.5rem', color: '#f59e0b', fontWeight: '700' }}>{franchises.filter(f => f.status === 'Pending').length}</h3>
                                <p className="text-muted m-0 mt-1 font-bold" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>Pending</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }} className="no-print">
                            <div style={{ ...modernCard, padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <h3 className="m-0" style={{ color: '#1e293b' }}>Recent Applications</h3>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                                        <thead><tr><th style={thStyle}>Operator</th><th style={thStyle}>Plate No.</th><th style={thStyle}>Status</th><th style={thStyle} className="text-center">Action</th></tr></thead>
                                        <tbody>
                                            {franchises.filter(f => f.status === 'Pending').slice(0, 5).map(f => (
                                                <tr key={f._id}>
                                                    <td style={{...tdStyle, fontWeight: '600'}}>{f.operator?.name || 'Unknown'}</td><td style={tdStyle}>{f.plateNo}</td>
                                                    <td style={tdStyle}><span className={`badge ${f.status.toLowerCase()}`}>{f.status}</span></td>
                                                    <td style={tdStyle} className="text-center">
                                                        <button onClick={() => openViewModal(f)} className="btn-primary" style={{...actionBtn, margin: '0 auto'}}>Review</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ ...modernCard, display: 'flex', flexDirection: 'column' }}>
                                <h3 className="m-0 mb-1" style={{ color: '#1e293b' }}>System History</h3>
                                <div style={{ flex: 1, maxHeight: '400px', overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {historyLogs.map((log) => (
                                        <div key={log.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: `4px solid ${log.color}` }}>
                                            <div className="flex-between"><p className="font-bold m-0" style={{ color: log.color, fontSize: '0.9rem' }}>{log.title}</p><span className="text-muted" style={{ fontSize: '0.75rem' }}>{log.date.toLocaleDateString()}</span></div>
                                            <p className="text-muted m-0 mt-1" style={{ fontSize: '0.85rem' }}>{log.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* analytics section tab */}
                {activeTab === 'analytics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="flex-between flex-wrap gap-2">
                            <h2 className="m-0 text-primary">Data Insights</h2>
                            <div className="flex-row gap-1">
                                <button onClick={() => window.print()} style={{...actionBtn, backgroundColor: '#64748b', color: 'white'}}><img src={printerIcon} width="16" alt="Print" /> Print</button>
                                <select value={analyticsMonth} onChange={(e) => setAnalyticsMonth(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <option value="All">All Time</option><option value="0">Jan</option><option value="1">Feb</option><option value="2">Mar</option><option value="3">Apr</option><option value="4">May</option><option value="5">Jun</option><option value="6">Jul</option><option value="7">Aug</option><option value="8">Sep</option><option value="9">Oct</option><option value="10">Nov</option><option value="11">Dec</option>
                                </select>
                            </div>
                        </div>

                        {analyticsFiltered.length === 0 ? (
                            <div style={modernCard} className="text-center p-2"><p className="text-muted m-0">No data recorded for this period.</p></div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                <div style={{...modernCard, minWidth: 0 }}>
                                    <h3 style={{ textAlign: 'center' }}>Distribution Per TODA</h3>
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="99%" height="100%">
                                            <PieChart>
                                                <Pie data={todaChartData} cx="50%" cy="45%" outerRadius={90} dataKey="value" label>
                                                    {todaChartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <RechartsTooltip /><Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div style={{...modernCard, gridColumn: '1 / -1', minWidth: 0 }}>
                                    <h3>Application Status Summary</h3>
                                    <div style={{ height: '350px' }}>
                                        <ResponsiveContainer width="99%" height="100%">
                                            <BarChart data={statusChartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" /><YAxis />
                                                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                                                <Bar dataKey="count" fill="#2FA084" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* user management tab */}
                {activeTab === 'users' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 className="m-0 text-primary">User Accounts</h2>
                        <div style={modernTableWrapper}>
                            <table style={{ width: '100%', minWidth: '700px' }}>
                                <thead><tr><th style={thStyle}>Profile</th><th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Role</th><th style={thStyle}>Actions</th></tr></thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td style={tdStyle}><img src={getImageUrl(user.profilePic)} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="pfp" /></td>
                                            <td style={{...tdStyle, fontWeight: '600'}}>{user.name}</td>
                                            <td style={tdStyle}>{user.email}</td>
                                            <td style={tdStyle}><span className="badge">{user.role}</span></td>
                                            <td style={tdStyle}>
                                                <div className="flex-row gap-1">
                                                    <button onClick={() => promptAdminAction('edit', user)} className="btn-warning" style={actionBtn}>Edit</button>
                                                    <button onClick={() => promptAdminAction('delete', user)} className="btn-danger" style={actionBtn}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* application review modal */}
            {selectedFranchise && (
                <div className="modal-overlay">
                    <div style={{...modernCard, maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                        <button onClick={() => setSelectedFranchise(null)} style={closeBtnStyle}>&times;</button>
                        <h2>Application Review</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div><strong>Plate No:</strong> {selectedFranchise.plateNo}</div>
                            <div><strong>Operator:</strong> {selectedFranchise.operator?.name}</div>
                            <div><strong>TODA:</strong> {selectedFranchise.todaName}</div>
                        </div>
                        <form onSubmit={handleAdvancedApproval} style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                            <label>Update Status</label>
                            <select value={viewModalData.status} onChange={(e) => setViewModalData({...viewModalData, status: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <option value="Pending">Pending</option><option value="Active">Approve</option><option value="Cancelled">Decline</option>
                            </select>
                            <button type="submit" className="btn-primary w-100" style={{ padding: '0.8rem' }}>Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}