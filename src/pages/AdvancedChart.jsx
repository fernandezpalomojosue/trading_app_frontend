import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketService } from '../services/api';
import { indicatorsService } from '../services/indicatorsService';
import { ArrowLeft, BarChart3, TrendingUp, Activity } from 'lucide-react';
import CandlestickChart from '../components/Charts/CandlestickChart';
import RSIChart from '../components/Charts/RSIChart';
import MACDChart from '../components/Charts/MACDChart';
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
  const [signal, setSignal] = useState({
    order_signal: null,
    signal_reason: null,
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
        // Add 25 buffer candles for indicator calculation
        let limit;
        const endDate = new Date();
        let startDate = new Date();
        
        if (timespan === 'day') {
          limit = 100 + 25;
          startDate.setDate(endDate.getDate() - 125); 
        } else if (timespan === 'week') {
          limit = 50 + 25;
          startDate.setDate(endDate.getDate() - (365 + 175)); 
        } else if (timespan === 'month') {
          limit = 20 + 25;
          startDate.setMonth(endDate.getMonth() - (24 + 25)); 
        } else if (timespan === 'year') {
          limit = 2 + 25;
          startDate.setFullYear(endDate.getFullYear() - (5 + 25)); 
        }
        
        const startDateStr = startDate.toISOString().split('T')[0];

        // Fetch candles with buffer for indicators
        const candlesData = await marketService.getCandles(symbol, timespan, 1, limit, startDateStr, null);
        setCandles(candlesData);
        
        // Fetch indicators with 100 points always
        await fetchIndicators(startDateStr, 150, candlesData);
        
        // Fetch signal separately
        await fetchSignal();
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

    const fetchIndicators = async (startDateStr, indicatorLimit, candlesData) => {
      try {
        setIndicatorsLoading(true);
        
        // Fetch all indicators with 100 points
        const data = await indicatorsService.getAllIndicators(symbol, { 
          timespan,
          start_date: startDateStr,
          limit: indicatorLimit,
        });
        
        if (data) {
          const lastResult = data[data.length - 1];
          
          setIndicators({
            ema: { last_value: lastResult.ema },
            sma: { last_value: lastResult.sma },
            rsi: { last_value: lastResult.rsi },
            macd: { 
              last_value: {
                macd: lastResult.macd,
                signal: lastResult.macd_signal,
                histogram: lastResult.macd_histogram,
              }
            },
            history: data,
            candleTimestamps: (candlesData.results || candlesData).map(c => c.t || c.timestamp),
          });
        }
      } catch (err) {
        console.error('Failed to load indicators:', err);
        // Don't set error state, just log it - indicators are optional
      } finally {
        setIndicatorsLoading(false);
      }
    };

    const fetchSignal = async () => {
      try {
        const signalData = await marketService.getSignal(symbol);
        setSignal({
          order_signal: signalData.signal,
          signal_reason: signalData.reason,
        });
      } catch (err) {
        console.error('Failed to load signal:', err);
        // Don't set error state, just log it - signal is optional
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

      {/* Charts Stack */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        {/* Main Candlestick Chart */}
        <CandlestickChart data={candles.results || candles} indicators={indicators} height={400} />
        
        {/* RSI Chart */}
        <RSIChart data={indicators.history} height={120} />
        
        {/* MACD Chart */}
        <MACDChart data={indicators.history} height={120} />
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

            {/* Trading Signal */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Trading Signal</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Recommendation:</span>
                  <span className={`text-sm font-bold uppercase ${
                    signal.order_signal === 'buy' ? 'text-green-600' :
                    signal.order_signal === 'sell' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {signal.order_signal || '--'}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-600">Analysis:</span>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {signal.signal_reason || '--'}
                  </p>
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
