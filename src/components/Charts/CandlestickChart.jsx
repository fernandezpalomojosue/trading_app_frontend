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

    // Create candlestick series using correct v5 API: chart.addSeries(CandlestickSeries, options)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      priceScaleId: 'right',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Candlesticks occupy top 80% of chart
    candlestickSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.3,
      },
    });

    // Create volume series (histogram) using correct v5 API: chart.addSeries(HistogramSeries, options)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    volumeSeriesRef.current = volumeSeries;

    // Volume at bottom with its own scale
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.75,
        bottom: 0.05,
      },
    });

    return () => {
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    // Handle both direct array and {results: array} format
    const dataArray = data?.results || data;
    
    if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) return;
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    // Format data for candlesticks - support both formats (t/o/h/l/c/v and timestamp/open/high/low/close/volume)
    const candleData = dataArray.map(candle => ({
      time: Math.floor((candle.t || candle.timestamp) / 1000), // Convert ms to seconds
      open: candle.o ?? candle.open,
      high: candle.h ?? candle.high,
      low: candle.l ?? candle.low,
      close: candle.c ?? candle.close,
    }));

    // Format data for volume (color based on close vs open)
    const volumeData = dataArray.map(candle => ({
      time: Math.floor((candle.t || candle.timestamp) / 1000),
      value: candle.v ?? candle.volume,
      color: (candle.c ?? candle.close) >= (candle.o ?? candle.open) ? '#22c55e' : '#ef4444',
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
      style={{ width: '100%', height: height, minWidth: '100%' }}
    />
  );
};

export default CandlestickChart;
