import React, { useEffect, useRef } from 'react';
import { createChart, LineSeries, HistogramSeries } from 'lightweight-charts';

const MACDChart = ({ data, height = 150 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const macdSeriesRef = useRef(null);
  const signalSeriesRef = useRef(null);
  const histogramSeriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
      rightPriceScale: {
        borderColor: '#e0e0e0',
      },
      timeScale: {
        borderColor: '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
        visible: true, // Show time scale on bottom chart
      },
      height: height,
    });

    chartRef.current = chart;

    // MACD line
    const macdSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      title: 'MACD',
    });
    macdSeriesRef.current = macdSeries;

    // Signal line
    const signalSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'Signal',
    });
    signalSeriesRef.current = signalSeries;

    // Histogram
    const histogramSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    histogramSeriesRef.current = histogramSeries;

    return () => {
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    if (!data || data.length === 0 || !macdSeriesRef.current) return;

    const macdData = data
      .map(item => ({
        time: Math.floor((item.t || item.timestamp) / 1000),
        value: item.macd,
      }))
      .filter(item => item.value != null);

    const signalData = data
      .map(item => ({
        time: Math.floor((item.t || item.timestamp) / 1000),
        value: item.signal,
      }))
      .filter(item => item.value != null);

    const histogramData = data
      .map(item => ({
        time: Math.floor((item.t || item.timestamp) / 1000),
        value: item.histogram,
        color: item.histogram >= 0 ? '#22c55e' : '#ef4444',
      }))
      .filter(item => item.value != null);

    if (macdData.length > 0) {
      macdSeriesRef.current.setData(macdData);
    }
    if (signalData.length > 0) {
      signalSeriesRef.current.setData(signalData);
    }
    if (histogramData.length > 0) {
      histogramSeriesRef.current.setData(histogramData);
    }

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div className="w-full">
      <div className="text-sm font-medium text-gray-600 mb-1">MACD (12,26,9)</div>
      <div 
        ref={chartContainerRef} 
        style={{ width: '100%', height: height }}
      />
    </div>
  );
};

export default MACDChart;
