import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { useRole } from './contexts/RoleContext';
import HeroSection from './components/HeroSection';
import { RoleSelection } from './components/RoleSelection';
import { ProtectedRoute } from './components/ProtectedRoute';
import BuyerDashboard from './buyer/BuyerDashboard';
import SellerDashboard from './seller/SellerDashboard';
import SellerListings from './seller/SellerListings';
import { CreateListing } from './pages/CreateListing';
import EditListingPage from './pages/EditListingPage';
import { ListingDetail } from './pages/ListingDetail';
import { Debug } from './pages/Debug';

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
            path="/seller" 
            element={
              <ProtectedRoute requireRole="seller">
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/seller/dashboard" 
            element={<Navigate to="/seller" replace />} 
          />
          
          <Route 
            path="/seller/listings" 
            element={
              <ProtectedRoute requireRole="seller">
                <SellerListings />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/seller/create-listing" 
            element={
              <ProtectedRoute requireRole="seller">
                <CreateListing />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/seller/edit-listing/:id" 
            element={
              <ProtectedRoute requireRole="seller">
                <EditListingPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/listing/:id" 
            element={
              <ProtectedRoute requireRole={false}>
                <ListingDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/buyer" 
            element={
              <ProtectedRoute requireRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/buyer/dashboard" 
            element={<Navigate to="/buyer" replace />} 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireRole={false}>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/debug" element={<Debug />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

const DashboardRedirect: React.FC = () => {
  const { role } = useRole();
  
  if (role === 'seller') {
    return <Navigate to="/seller" replace />;
  } else if (role === 'buyer') {
    return <Navigate to="/buyer" replace />;
  }
  
  return <Navigate to="/role-selection" replace />;
};

export default App;