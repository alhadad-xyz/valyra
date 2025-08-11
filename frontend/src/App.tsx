import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { useRole } from './contexts/RoleContext';
import HeroSection from './components/HeroSection';
import { RoleSelection } from './components/RoleSelection';
import { ProtectedRoute } from './components/ProtectedRoute';
import BuyerDashboard from './buyer/BuyerDashboard';
import SellerDashboard from './seller/SellerDashboard';

function App() {
  const { isAuthenticated } = useAuth();
  const { isRoleSelected } = useRole();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HeroSection />} />
          
          <Route 
            path="/role-selection" 
            element={
              isAuthenticated ? (
                isRoleSelected ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <RoleSelection />
                )
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          <Route 
            path="/seller/dashboard" 
            element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/buyer/dashboard" 
            element={
              <ProtectedRoute>
                <BuyerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireRole={false}>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

const DashboardRedirect: React.FC = () => {
  const { role } = useRole();
  
  if (role === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  } else if (role === 'buyer') {
    return <Navigate to="/buyer/dashboard" replace />;
  }
  
  return <Navigate to="/role-selection" replace />;
};

export default App;