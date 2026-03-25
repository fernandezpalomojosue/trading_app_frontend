import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

const CandlestickChart = ({ data, height = 500 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) {
      console.log('Chart container ref is null');
      return;
    }

    console.log('Creating chart, container dimensions:', 
      chartContainerRef.current.clientWidth, 
      chartContainerRef.current.clientHeight
    );

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
    console.log('Data effect triggered, data:', data);
    console.log('Is array:', Array.isArray(data));
    console.log('Length:', data?.length);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('Data validation failed, returning early');
      return;
    }
    
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) {
      console.log('Series refs not ready');
      return;
    }

    console.log('Processing', data.length, 'candles');

    // Format data for candlesticks - support both formats (t/o/h/l/c/v and timestamp/open/high/low/close/volume)
    const candleData = data.map(candle => ({
      time: Math.floor((candle.t || candle.timestamp) / 1000), // Convert ms to seconds
      open: candle.o ?? candle.open,
      high: candle.h ?? candle.high,
      low: candle.l ?? candle.low,
      close: candle.c ?? candle.close,
    }));

    console.log('First candle:', candleData[0]);
    console.log('Last candle:', candleData[candleData.length - 1]);

    // Format data for volume (color based on close vs open)
    const volumeData = data.map(candle => ({
      time: Math.floor((candle.t || candle.timestamp) / 1000),
      value: candle.v ?? candle.volume,
      color: (candle.c ?? candle.close) >= (candle.o ?? candle.open) ? '#22c55e' : '#ef4444',
    }));

    console.log('Setting data to series...');
    candlestickSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
    console.log('Data set successfully');

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
      console.log('Fitted content');
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
