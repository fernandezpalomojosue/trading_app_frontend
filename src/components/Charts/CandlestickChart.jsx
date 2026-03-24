import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

const CandlestickChart = ({ data, height = 500 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
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

    // Create candlestick series using correct v5 API: chart.addSeries(CandlestickSeries, options)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Create volume series (histogram) using correct v5 API: chart.addSeries(HistogramSeries, options)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
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

    return () => {
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0 || !candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    // Format data for candlesticks
    const candleData = data.map(candle => ({
      time: Math.floor(candle.timestamp / 1000), // Convert ms to seconds
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    // Format data for volume (color based on close vs open)
    const volumeData = data.map(candle => ({
      time: Math.floor(candle.timestamp / 1000),
      value: candle.volume,
      color: candle.close >= candle.open ? '#22c55e' : '#ef4444',
    }));

    candlestickSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ width: '100%', height: height }}
    />
  );
};

export default CandlestickChart;
