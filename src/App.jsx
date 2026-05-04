import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import MarketOverview from './pages/MarketOverview';
import AssetsList from './pages/AssetsList';
import AssetDetail from './pages/AssetDetail';
import AdvancedChart from './pages/AdvancedChart';
import Portfolio from './pages/Portfolio';
import Login from './pages/Login';
import Register from './pages/Register';
import ErrorTestPage from './pages/ErrorTestPage';
import AIStrategyGenerate from './pages/AIStrategyGenerate';
import StrategiesList from './pages/StrategiesList';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/test-errors" element={<ErrorTestPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MarketOverview />
                </ProtectedRoute>
              } />
              <Route path="/portfolio" element={
                <ProtectedRoute>
                  <Portfolio />
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
              <Route path="/assets/:symbol/advanced-chart" element={
                <ProtectedRoute>
                  <AdvancedChart />
                </ProtectedRoute>
              } />
              <Route path="/strategies" element={
                <ProtectedRoute>
                  <StrategiesList />
                </ProtectedRoute>
              } />
              <Route path="/strategies/generate" element={
                <ProtectedRoute>
                  <AIStrategyGenerate />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
