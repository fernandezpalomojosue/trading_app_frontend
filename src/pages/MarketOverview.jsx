import React, { useState, useEffect } from 'react';
import { marketService } from '../services/api';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

const MarketOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await marketService.getMarketOverview('stocks');
        setOverview(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar el resumen del mercado');
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen del Mercado</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Top Ganadores</p>
                <p className="text-2xl font-bold text-green-800">{overview.top_gainers?.length || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Top Perdedores</p>
                <p className="text-2xl font-bold text-red-800">{overview.top_losers?.length || 0}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Más Activos</p>
                <p className="text-2xl font-bold text-purple-800">{overview.most_active?.length || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🚀 Top Ganadores</h3>
            <div className="space-y-2">
              {overview.top_gainers?.slice(0, 10).map((asset, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                  <span className="font-medium text-gray-800">{asset.symbol}</span>
                  <span className="text-green-600 font-semibold">+{asset.change_percent?.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-3">📉 Top Perdedores</h3>
            <div className="space-y-2">
              {overview.top_losers?.slice(0, 10).map((asset, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                  <span className="font-medium text-gray-800">{asset.symbol}</span>
                  <span className="text-red-600 font-semibold">{asset.change_percent?.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">⚡ Más Activos</h3>
            <div className="space-y-2">
              {overview.most_active?.slice(0, 10).map((asset, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                  <span className="font-medium text-gray-800">{asset.symbol}</span>
                  <span className="text-purple-600 font-semibold">{asset.volume?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
