import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketService } from '../services/api';
import { indicatorsService } from '../services/indicatorsService';
import { ArrowLeft, BarChart3, TrendingUp, Activity } from 'lucide-react';
import CandlestickChart from '../components/Charts/CandlestickChart';
import ErrorDisplay from '../components/ErrorDisplay';

const AdvancedChart = () => {
  const { symbol } = useParams();
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

        // Calculate date range and limit based on timespan
        let limit;
        const endDate = new Date();
        let startDate = new Date();
        
        if (timespan === 'day') {
          limit = 100;
          startDate.setDate(endDate.getDate() - 120); 
        } else if (timespan === 'week') {
          limit = 50;
          startDate.setDate(endDate.getDate() - 365); 
        } else if (timespan === 'month') {
          limit = 20;
          startDate.setMonth(endDate.getMonth() - 24); 
        } else if (timespan === 'year') {
          limit = 2;
          startDate.setFullYear(endDate.getFullYear() - 5); 
        }
        
        const startDateStr = startDate.toISOString().split('T')[0];

        // Fetch candles with adjusted limit
        const candlesData = await marketService.getCandles(symbol, timespan, 1, limit, startDateStr, null);
        setCandles(candlesData);
        
        // Fetch indicators with same limit
        await fetchIndicators(startDateStr, limit);
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

    const fetchIndicators = async (startDateStr, limit) => {
      try {
        setIndicatorsLoading(true);
        
        // Fetch all indicators with adjusted limit
        const data = await indicatorsService.getAllIndicators(symbol, { 
          timespan,
          start_date: startDateStr,
          limit: limit,
        });
        
        if (data && data.results && data.results.length > 0) {
          const lastResult = data.results[data.results.length - 1];
          
          setIndicators({
            ema: { last_value: lastResult.ema },
            sma: { last_value: lastResult.sma },
            rsi: { last_value: lastResult.rsi },
            macd: { 
              last_value: {
                macd: lastResult.macd,
                signal: lastResult.signal,
                histogram: lastResult.histogram,
              }
            },
            history: data.results,
          });
        }
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

  const candleArray = candles.results || candles;
  const lastClose = candleArray[candleArray.length - 1]?.c ?? candleArray[candleArray.length - 1]?.close ?? 0;
  const prevClose = candleArray.length > 1 ? (candleArray[candleArray.length - 2]?.c ?? candleArray[candleArray.length - 2]?.close ?? lastClose) : lastClose;
  const dailyChange = lastClose - prevClose;
  const dailyChangePercent = prevClose > 0 ? (dailyChange / prevClose) * 100 : 0;

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
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-semibold text-gray-800">
              ${lastClose.toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${
              dailyChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%)
            </span>
          </div>
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
        <CandlestickChart data={candles.results || candles} height={500} />
      </div>

      {/* Key Stats */}
      {(candles.results?.length || candles.length) > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Open</p>
            <p className="text-lg font-semibold text-gray-900">
              ${((candles.results || candles)[(candles.results || candles).length - 1]?.o ?? (candles.results || candles)[(candles.results || candles).length - 1]?.open)?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">High</p>
            <p className="text-lg font-semibold text-gray-900">
              ${((candles.results || candles)[(candles.results || candles).length - 1]?.h ?? (candles.results || candles)[(candles.results || candles).length - 1]?.high)?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Low</p>
            <p className="text-lg font-semibold text-gray-900">
              ${((candles.results || candles)[(candles.results || candles).length - 1]?.l ?? (candles.results || candles)[(candles.results || candles).length - 1]?.low)?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Close</p>
            <p className="text-lg font-semibold text-gray-900">
              ${((candles.results || candles)[(candles.results || candles).length - 1]?.c ?? (candles.results || candles)[(candles.results || candles).length - 1]?.close)?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Volume</p>
            <p className="text-lg font-semibold text-gray-900">
              {((candles.results || candles)[(candles.results || candles).length - 1]?.v ?? (candles.results || candles)[(candles.results || candles).length - 1]?.volume)?.toLocaleString() || '0'}
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
              <p className="text-sm text-orange-600 font-medium">MACD (12,26,9)</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">MACD:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {indicators.macd?.last_value?.macd?.toFixed(3) || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Signal:</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {indicators.macd?.last_value?.signal?.toFixed(3) || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Histogram:</span>
                  <span className={`text-sm font-semibold ${
                    indicators.macd?.last_value?.histogram > 0 ? 'text-green-600' : 
                    indicators.macd?.last_value?.histogram < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {indicators.macd?.last_value?.histogram?.toFixed(3) || '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedChart;
