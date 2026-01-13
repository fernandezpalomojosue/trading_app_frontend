import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MarketOverview from './pages/MarketOverview';
import AssetsList from './pages/AssetsList';
import AssetDetail from './pages/AssetDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<MarketOverview />} />
            <Route path="/assets" element={<AssetsList />} />
            <Route path="/assets/:symbol" element={<AssetDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
