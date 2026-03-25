import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';

const CandlestickChart = ({ data, indicators, height = 500 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const emaSeriesRef = useRef(null);
  const smaSeriesRef = useRef(null);
  const macdSeriesRef = useRef(null);
  const macdSignalSeriesRef = useRef(null);

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

    // Create EMA line series
    const emaSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      title: 'EMA',
      priceScaleId: 'right',
    });
    emaSeriesRef.current = emaSeries;

    // Create SMA line series
    const smaSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'SMA',
      priceScaleId: 'right',
    });
    smaSeriesRef.current = smaSeries;

    // Create MACD line series (on separate scale)
    const macdSeries = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      title: 'MACD',
      priceScaleId: 'macd',
    });
    macdSeriesRef.current = macdSeries;

    const macdSignalSeries = chart.addSeries(LineSeries, {
      color: '#ec4899',
      lineWidth: 2,
      title: 'Signal',
      priceScaleId: 'macd',
    });
    macdSignalSeriesRef.current = macdSignalSeries;

    // MACD scale at bottom
    chart.priceScale('macd').applyOptions({
      scaleMargins: {
        top: 0.85,
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

  useEffect(() => {
    // Update indicator lines when indicators change
    if (!indicators?.history || indicators.history.length === 0) return;
    if (!emaSeriesRef.current || !smaSeriesRef.current) return;

    const emaData = indicators.history.map(item => ({
      time: Math.floor((item.t || item.timestamp) / 1000),
      value: item.ema,
    })).filter(item => item.value != null);

    const smaData = indicators.history.map(item => ({
      time: Math.floor((item.t || item.timestamp) / 1000),
      value: item.sma,
    })).filter(item => item.value != null);

    const macdData = indicators.history.map(item => ({
      time: Math.floor((item.t || item.timestamp) / 1000),
      value: item.macd,
    })).filter(item => item.value != null);

    const macdSignalData = indicators.history.map(item => ({
      time: Math.floor((item.t || item.timestamp) / 1000),
      value: item.signal,
    })).filter(item => item.value != null);

    if (emaSeriesRef.current) emaSeriesRef.current.setData(emaData);
    if (smaSeriesRef.current) smaSeriesRef.current.setData(smaData);
    if (macdSeriesRef.current) macdSeriesRef.current.setData(macdData);
    if (macdSignalSeriesRef.current) macdSignalSeriesRef.current.setData(macdSignalData);
  }, [indicators]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ width: '100%', height: height, minWidth: '100%' }}
    />
  );
};

export default CandlestickChart;
