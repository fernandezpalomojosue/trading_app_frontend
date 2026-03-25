import React, { useEffect, useRef } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';

const RSIChart = ({ data, height = 150 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const rsiSeriesRef = useRef(null);
  const upperLineRef = useRef(null);
  const lowerLineRef = useRef(null);

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
        minValue: 0,
        maxValue: 100,
      },
      timeScale: {
        borderColor: '#e0e0e0',
        timeVisible: false,
        secondsVisible: false,
        visible: false, // Hide time scale, show only on bottom chart
      },
      height: height,
    });

    chartRef.current = chart;

    // RSI line
    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      title: 'RSI',
    });
    rsiSeriesRef.current = rsiSeries;

    // Overbought line (70)
    const upperLine = chart.addSeries(LineSeries, {
      color: '#22c55e',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      title: '70',
      lastValueVisible: false,
    });
    upperLineRef.current = upperLine;

    // Oversold line (30)
    const lowerLine = chart.addSeries(LineSeries, {
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      title: '30',
      lastValueVisible: false,
    });
    lowerLineRef.current = lowerLine;

    return () => {
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    if (!data || data.length === 0 || !rsiSeriesRef.current) return;

    const rsiData = data
      .map(item => ({
        time: Math.floor((item.t || item.timestamp) / 1000),
        value: item.rsi,
      }))
      .filter(item => item.value != null);

    if (rsiData.length > 0) {
      rsiSeriesRef.current.setData(rsiData);

      // Set horizontal reference lines
      const times = rsiData.map(d => d.time);
      const upperData = times.map(t => ({ time: t, value: 70 }));
      const lowerData = times.map(t => ({ time: t, value: 30 }));

      upperLineRef.current?.setData(upperData);
      lowerLineRef.current?.setData(lowerData);
    }

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div className="w-full">
      <div className="text-sm font-medium text-gray-600 mb-1">RSI (14)</div>
      <div 
        ref={chartContainerRef} 
        style={{ width: '100%', height: height }}
      />
    </div>
  );
};

export default RSIChart;
