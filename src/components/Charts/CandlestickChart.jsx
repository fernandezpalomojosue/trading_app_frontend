import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';

const CandlestickChart = ({ data, indicators, height = 500 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const emaSeriesRef = useRef(null);
  const smaSeriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#e0e0e0',
      },
      timeScale: {
        borderColor: '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
      height: height,
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Create volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeriesRef.current = volumeSeries;

    // Volume at bottom
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Create EMA line series
    const emaSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      title: 'EMA',
    });
    emaSeriesRef.current = emaSeries;

    // Create SMA line series
    const smaSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'SMA',
    });
    smaSeriesRef.current = smaSeries;

    return () => {
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    // Handle both direct array and {results: array} format
    const dataArray = data?.results || data;
    
    if (!dataArray || !Array.isArray(dataArray) || dataArray.length <= 25) return;
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    // Skip first 25 candles (where indicators have null values)
    const skipCount = 25;
    const trimmedData = dataArray.slice(skipCount);

    const candleData = trimmedData.map(candle => ({
      time: Math.floor((candle.t || candle.timestamp) / 1000),
      open: candle.o ?? candle.open,
      high: candle.h ?? candle.high,
      low: candle.l ?? candle.low,
      close: candle.c ?? candle.close,
    }));

    const volumeData = trimmedData.map(candle => ({
      time: Math.floor((candle.t || candle.timestamp) / 1000),
      value: candle.v ?? candle.volume,
      color: (candle.c ?? candle.close) >= (candle.o ?? candle.open) ? '#22c55e' : '#ef4444',
    }));

    candlestickSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    // Filter and plot indicators that match remaining candle timestamps
    if (indicators?.history && indicators.candleTimestamps && indicators.history.length > 0) {
      const trimmedTimestamps = indicators.candleTimestamps.slice(skipCount);
      const candleTimes = new Set(trimmedTimestamps.map(t => Math.floor(t / 1000)));
      
      const emaData = indicators.history
        .map(item => ({
          time: Math.floor((item.t || item.timestamp) / 1000),
          value: item.ema,
        }))
        .filter(item => candleTimes.has(item.time) && item.value != null);

      const smaData = indicators.history
        .map(item => ({
          time: Math.floor((item.t || item.timestamp) / 1000),
          value: item.sma,
        }))
        .filter(item => candleTimes.has(item.time) && item.value != null);

      if (emaSeriesRef.current && emaData.length > 0) {
        emaSeriesRef.current.setData(emaData);
      }
      if (smaSeriesRef.current && smaData.length > 0) {
        smaSeriesRef.current.setData(smaData);
      }
    }

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, indicators]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ width: '100%', height: height, minWidth: '100%' }}
    />
  );
};

export default CandlestickChart;
