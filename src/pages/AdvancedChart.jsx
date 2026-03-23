import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketService } from '../services/api';
import { indicatorsService } from '../services/indicatorsService';
import { ArrowLeft, BarChart3, TrendingUp, Activity } from 'lucide-react';
import CandlestickChart from '../components/Charts/CandlestickChart';
import ErrorDisplay from '../components/ErrorDisplay';

const AdvancedChart = () => {
  const { symbol } = useParams();
  const [asset, setAsset] = useState(null);
  const [candles, setCandles] = useState([]);
  const [timespan, setTimespan] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indicators, setIndicators] = useState({
    ema: null,
    sma: null,
    rsi: null,
    macd: null,
  });
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);

  const timespans = [
    { value: 'day', label: '1D' },
    { value: 'week', label: '1W' },
    { value: 'month', label: '1M' },
    { value: 'year', label: '1Y' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch asset details and candles
        const [assetData, candlesData] = await Promise.all([
          marketService.getAssetDetails(symbol),
          marketService.getCandles(symbol, timespan),
        ]);

        setAsset(assetData);
        setCandles(candlesData);
        
        // Fetch indicators
        await fetchIndicators();
      } catch (err) {
        setError({
          type: 'network',
          message: 'Failed to load chart data',
          details: err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchIndicators = async () => {
      try {
        setIndicatorsLoading(true);
        
        const [emaData, smaData, rsiData, macdData] = await Promise.all([
          indicatorsService.getEMA(symbol, { timespan }),
          indicatorsService.getSMA(symbol, { timespan }),
          indicatorsService.getRSI(symbol, { timespan }),
          indicatorsService.getMACD(symbol, { timespan }),
        ]);

        setIndicators({
          ema: emaData,
          sma: smaData,
          rsi: rsiData,
          macd: macdData,
        });
      } catch (err) {
        console.error('Failed to load indicators:', err);
        // Don't set error state, just log it - indicators are optional
      } finally {
        setIndicatorsLoading(false);
      }
    };

    fetchData();
  }, [symbol, timespan]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <ErrorDisplay error={error} />
        <Link 
          to={`/assets/${symbol}`} 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Asset Detail</span>
        </Link>
      </div>
    );
  }

  const currentPrice = asset?.details?.market_data?.price || 0;
  const dailyChange = asset?.details?.market_data?.change || 0;
  const dailyChangePercent = asset?.details?.market_data?.change_percent || 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={`/assets/${symbol}`} 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Asset Detail</span>
          </Link>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900">{symbol}</h1>
          {asset && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-semibold text-gray-800">
                ${currentPrice.toFixed(2)}
              </span>
              <span className={`text-sm font-medium ${
                dailyChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Title */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">Advanced Chart</h2>
      </div>

      {/* Time Span Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Timeframe:</span>
        {timespans.map((span) => (
          <button
            key={span.value}
            onClick={() => setTimespan(span.value)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              timespan === span.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {span.label}
          </button>
        ))}
      </div>

      {/* Candlestick Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <CandlestickChart data={candles} height={500} />
      </div>

      {/* Key Stats */}
      {candles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Open</p>
            <p className="text-lg font-semibold text-gray-900">
              ${candles[candles.length - 1]?.open?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">High</p>
            <p className="text-lg font-semibold text-gray-900">
              ${candles[candles.length - 1]?.high?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Low</p>
            <p className="text-lg font-semibold text-gray-900">
              ${candles[candles.length - 1]?.low?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Close</p>
            <p className="text-lg font-semibold text-gray-900">
              ${candles[candles.length - 1]?.close?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Volume</p>
            <p className="text-lg font-semibold text-gray-900">
              {candles[candles.length - 1]?.volume?.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      )}

      {/* Technical Indicators */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">Technical Indicators</h3>
        </div>

        {indicatorsLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* EMA */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">EMA (14)</p>
              <p className="text-lg font-semibold text-gray-900">
                {indicators.ema?.last_value?.toFixed(2) || '--'}
              </p>
              {indicators.ema?.signal && (
                <p className={`text-xs ${
                  indicators.ema.signal === 'bullish' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {indicators.ema.signal.toUpperCase()}
                </p>
              )}
            </div>

            {/* SMA */}
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">SMA (14)</p>
              <p className="text-lg font-semibold text-gray-900">
                {indicators.sma?.last_value?.toFixed(2) || '--'}
              </p>
              {indicators.sma?.signal && (
                <p className={`text-xs ${
                  indicators.sma.signal === 'bullish' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {indicators.sma.signal.toUpperCase()}
                </p>
              )}
            </div>

            {/* RSI */}
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">RSI (14)</p>
              <p className="text-lg font-semibold text-gray-900">
                {indicators.rsi?.last_value?.toFixed(2) || '--'}
              </p>
              {indicators.rsi?.signal && (
                <p className={`text-xs ${
                  indicators.rsi.signal === 'overbought' ? 'text-red-600' : 
                  indicators.rsi.signal === 'oversold' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {indicators.rsi.signal.toUpperCase()}
                </p>
              )}
            </div>

            {/* MACD */}
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">MACD</p>
              <p className="text-lg font-semibold text-gray-900">
                {indicators.macd?.last_value?.macd?.toFixed(3) || '--'}
              </p>
              {indicators.macd?.signal && (
                <p className={`text-xs ${
                  indicators.macd.signal === 'bullish' ? 'text-green-600' : 'text-red-600'
                }`}>
                  Signal: {indicators.macd.signal.toUpperCase()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedChart;
