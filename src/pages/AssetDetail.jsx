import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketService } from '../services/api';
import { portfolioService } from '../services/portfolioService';
import { TrendingUp, TrendingDown, ArrowLeft, Activity, DollarSign, TrendingUp as BuyIcon, TrendingDown as SellIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BuyModal from '../components/Trading/BuyModal';
import SellModal from '../components/Trading/SellModal';
import ErrorDisplay from '../components/ErrorDisplay';

const AssetDetail = () => {
  const { symbol } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candles, setCandles] = useState([]);
  const [timespan, setTimespan] = useState('day');
  const [chartLoading, setChartLoading] = useState(false);
  
  // Trading state
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [userHoldings, setUserHoldings] = useState(null);
  const [tradingError, setTradingError] = useState(null);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        // Usar el endpoint específico para obtener detalles del activo
        const assetData = await marketService.getAssetDetails(symbol);
        setAsset(assetData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los detalles del activo');
        setLoading(false);
      }
    };

    const fetchUserHoldings = async () => {
      try {
        const holdings = await portfolioService.getHoldings();
        const userHolding = holdings.find(h => h.symbol === symbol);
        setUserHoldings(userHolding);
      } catch (err) {
        // Don't set main error for holdings fetch failure
        console.error('Failed to fetch user holdings:', err);
      }
    };

    fetchAssetDetails();
    fetchUserHoldings();
  }, [symbol]);

  useEffect(() => {
    const fetchCandles = async () => {
      try {
        setChartLoading(true);
        let limit = 5000;
        
        const endDate = new Date();
        let startDate = new Date();
        
        if (timespan === 'day') {
          startDate.setDate(endDate.getDate() - 12); 
        } else if (timespan === 'week') {
          startDate.setDate(endDate.getDate() - 69); 
        } else if (timespan === 'month') {
          startDate.setMonth(endDate.getMonth() - 9); 
        } else if (timespan === 'year') {
          startDate.setFullYear(endDate.getFullYear() - 2); 
        }
        
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const candleData = await marketService.getCandles(symbol, timespan, 1, 5000, startDateStr, null);
        
        const formattedData = candleData.results?.map((candle, index) => ({
          index: index,
          timestamp: candle.t,
          date: new Date(candle.t).toLocaleDateString('es-ES'),
          close: candle.c,
          open: candle.o,
          high: candle.h,
          low: candle.l,
          volume: candle.v
        })) || [];
        
        setCandles(formattedData);
        setChartLoading(false);
      } catch (err) {
        console.error('Error al cargar los datos del gráfico:', err);
        setChartLoading(false);
      }
    };

    if (symbol) {
      fetchCandles();
    }
  }, [symbol, timespan]);

  // Trading functions
  const handleBuy = async (symbol, quantity, price) => {
    try {
      await portfolioService.buyStock(symbol, quantity, price);
      setTradingError(null);
      // Refresh user holdings
      const holdings = await portfolioService.getHoldings();
      const userHolding = holdings.find(h => h.symbol === symbol);
      setUserHoldings(userHolding);
      return { success: true };
    } catch (err) {
      setTradingError(err);
      throw err;
    }
  };

  const handleSell = async (symbol, quantity, price) => {
    try {
      await portfolioService.sellStock(symbol, quantity, price);
      setTradingError(null);
      // Refresh user holdings
      const holdings = await portfolioService.getHoldings();
      const userHolding = holdings.find(h => h.symbol === symbol);
      setUserHoldings(userHolding);
      return { success: true };
    } catch (err) {
      setTradingError(err);
      throw err;
    }
  };

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

  if (!asset) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        Activo no encontrado
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <Link 
        to="/assets" 
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Assets</span>
      </Link>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{asset.symbol}</h1>
            <p className="text-lg text-gray-600">{asset.name}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-800">${asset.details?.market_data?.price?.toFixed(2)}</p>
            <p className={`text-lg font-semibold ${
              asset.details?.market_data?.change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {asset.details?.market_data?.change > 0 ? '+' : ''}{asset.details?.market_data?.change?.toFixed(2)} ({asset.details?.market_data?.change_percent?.toFixed(2)}%)
            </p>
            
            {/* Trading Buttons */}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => setBuyModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <BuyIcon className="h-4 w-4" />
                <span>Buy</span>
              </button>
              <button
                onClick={() => setSellModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                disabled={!userHoldings || userHoldings.quantity <= 0}
              >
                <SellIcon className="h-4 w-4" />
                <span>Sell</span>
              </button>
            </div>
            
            {/* User Holdings Info */}
            {userHoldings && userHoldings.quantity > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                You own {userHoldings.quantity.toFixed(6)} shares
              </div>
            )}
          </div>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Daily Volume</p>
                <p className="text-2xl font-bold text-blue-800">{asset.details?.market_data?.volume?.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Daily Change</p>
                <p className={`text-2xl font-bold ${
                  asset.details?.market_data?.change > 0 ? 'text-green-800' : 'text-red-800'
                }`}>
                  {asset.details?.market_data?.change > 0 ? '+' : ''}{asset.details?.market_data?.change?.toFixed(2)}
                </p>
              </div>
              {asset.details?.market_data?.change > 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">% Change</p>
                <p className={`text-2xl font-bold ${
                  asset.details?.market_data?.change_percent > 0 ? 'text-purple-800' : 'text-red-800'
                }`}>
                  {asset.details?.market_data?.change_percent > 0 ? '+' : ''}{asset.details?.market_data?.change_percent?.toFixed(2)}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Currency</p>
              <p className="font-medium text-gray-800">{asset.currency?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                asset.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {asset.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {asset.details?.market_cap && (
              <div>
                <p className="text-sm text-gray-500">Market Cap</p>
                <p className="font-medium text-gray-800">${(asset.details.market_cap / 1000000000).toFixed(2)}B</p>
              </div>
            )}
            {asset.details?.primary_exchange && (
              <div>
                <p className="text-sm text-gray-500">Exchange</p>
                <p className="font-medium text-gray-800">{asset.details.primary_exchange}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información extendida */}
        {asset.details && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Acerca de {asset.name}</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">{asset.details.description}</p>
              {asset.details.homepage_url && (
                <div className="mt-4">
                  <a 
                    href={asset.details.homepage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Sitio web →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gráfico de precios */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Gráfico de Precios</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimespan('day')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                timespan === 'day' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setTimespan('week')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                timespan === 'week' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setTimespan('month')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                timespan === 'month' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setTimespan('year')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                timespan === 'year' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Año
            </button>
          </div>
        </div>
        
        {chartLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={candles}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="index" 
                interval={0} // Mostrar todas las etiquetas
                tickFormatter={(value) => {
                  if (candles[value]) {
                    return candles[value].date;
                  }
                  return '';
                }}
              />
              <YAxis 
                domain={['dataMin - 0.5', 'dataMax + 0.5']} // Dar más espacio
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                width={60} // Más ancho para las etiquetas
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow">
                        <p className="font-semibold">{data.date}</p>
                        <p className="text-green-600">Precio: ${data.close.toFixed(2)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Trading Error Display */}
      {tradingError && (
        <ErrorDisplay 
          error={tradingError} 
          onDismiss={() => setTradingError(null)}
          className="mb-6"
        />
      )}

      {/* Trading Modals */}
      <BuyModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        asset={asset}
        onBuySuccess={handleBuy}
      />

      <SellModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        asset={asset}
        userHoldings={userHoldings}
        onSellSuccess={handleSell}
      />
    </div>
  );
};

export default AssetDetail;
