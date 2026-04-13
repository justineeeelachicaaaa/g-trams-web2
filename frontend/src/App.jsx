import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // IDAGDAG ITO
import AdminDashboard from './pages/AdminDashboard'; 
import OperatorDashboard from './pages/OperatorDashboard'; 
import ForgotPassword from './pages/ForgotPassword';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/operator-dashboard" element={<OperatorDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  );
}

export default App;