import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { executionPlansService, strategyService } from '../services/api';
import { ArrowLeft, Plus, X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

const EditExecutionPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [plan, setPlan] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stockInput, setStockInput] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [timeframe, setTimeframe] = useState('day');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);
  const [strategiesLoading, setStrategiesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const timeframes = [
    { value: 'minute', label: '1 Minute' },
    { value: 'hour', label: '1 Hour' },
    { value: '4hour', label: '4 Hours' },
    { value: 'day', label: '1 Day' },
  ];

  useEffect(() => {
    loadPlan();
    loadStrategies();
  }, [id]);

  const loadPlan = async () => {
    try {
      setPlanLoading(true);
      const data = await executionPlansService.getPlanById(id);
      setPlan(data);
      setSelectedStrategy(data.strategy_id);
      setStocks(data.stocks || []);
      setTimeframe(data.timeframe || 'day');
      setIsActive(data.is_active);
    } catch (err) {
      setError('Failed to load execution plan');
      console.error('Failed to load plan:', err);
    } finally {
      setPlanLoading(false);
    }
  };

  const loadStrategies = async () => {
    try {
      setStrategiesLoading(true);
      const data = await strategyService.getUserStrategies({ active_only: true });
      setStrategies(data.items || []);
    } catch (err) {
      console.error('Failed to load strategies:', err);
    } finally {
      setStrategiesLoading(false);
    }
  };

  const addStock = () => {
    const stock = stockInput.trim().toUpperCase();
    if (stock && /^[A-Z]{1,10}$/.test(stock) && !stocks.includes(stock)) {
      setStocks([...stocks, stock]);
      setStockInput('');
    }
  };

  const removeStock = (stockToRemove) => {
    setStocks(stocks.filter(stock => stock !== stockToRemove));
  };

  const handleStockKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStock();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStrategy || stocks.length === 0) {
      setError('Please select a strategy and add at least one stock');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const planData = {
        stocks: stocks,
        timeframe: timeframe,
        is_active: isActive,
      };

      await executionPlansService.updatePlan(id, planData);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/execution-plans');
      }, 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data?.detail || 'Validation failed. Check your inputs.');
      } else {
        setError('Failed to update execution plan. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (planLoading || strategiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate('/execution-plans')}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Back to Execution Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Execution Plan Updated!</h2>
          <p className="text-gray-600 mb-4">Your execution plan has been updated successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to execution plans list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/execution-plans')}
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Edit Execution Plan</h1>
      </div>

      {/* Plan Info */}
      {plan && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Strategy:</strong> {plan.strategy_name}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Plan ID: {plan.id}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Strategy Selection (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strategy
            </label>
            <select
              value={selectedStrategy}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            >
              <option value="">Select a strategy</option>
              {strategies.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name} - {strategy.description}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Strategy cannot be changed after plan creation</p>
          </div>

          {/* Stocks Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stocks * (1-100 symbols)
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  onKeyPress={handleStockKeyPress}
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addStock}
                  disabled={!stockInput.trim() || !/^[A-Za-z]{1,10}$/.test(stockInput)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              {/* Selected Stocks */}
              {stocks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {stocks.map((stock, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full"
                    >
                      <span>{stock}</span>
                      <button
                        type="button"
                        onClick={() => removeStock(stock)}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Enter stock symbols (1-10 letters, uppercase). Maximum 100 stocks.
              </p>
            </div>
          </div>

          {/* Timeframe Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeframe *
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {timeframes.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Active
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Inactive plans will not execute trades
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/execution-plans')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStrategy || stocks.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExecutionPlan;
