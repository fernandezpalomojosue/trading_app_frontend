import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import MarketOverview from './pages/MarketOverview';
import AssetsList from './pages/AssetsList';
import AssetDetail from './pages/AssetDetail';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MarketOverview />
                </ProtectedRoute>
              } />
              <Route path="/assets" element={
                <ProtectedRoute>
                  <AssetsList />
                </ProtectedRoute>
              } />
              <Route path="/assets/:symbol" element={
                <ProtectedRoute>
                  <AssetDetail />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
