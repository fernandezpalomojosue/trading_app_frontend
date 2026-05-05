import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { strategyService } from '../services/api';
import { ArrowLeft, Beaker, Loader2, AlertTriangle } from 'lucide-react';

const StrategyTest = () => {
  const { id } = useParams();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStrategy();
  }, [id]);

  const loadStrategy = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await strategyService.getStrategyById(id);
      setStrategy(data);
    } catch (err) {
      setError('Error al cargar la estrategia');
      console.error('Failed to load strategy:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
        <Link
          to="/strategies"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-purple-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a estrategias</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Beaker className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Test Strategy</h1>
        </div>
        <Link
          to="/strategies"
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Link>
      </div>

      {/* Strategy Info */}
      {strategy && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{strategy.name}</h2>
          <p className="text-gray-600 mb-4">{strategy.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>ID: {strategy.id}</span>
            <span className={`inline-flex px-2 py-1 rounded-full ${
              strategy.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {strategy.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      )}

      {/* Placeholder for Test Interface */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <Beaker className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Strategy Testing Interface</h3>
        <p className="text-gray-500 mb-4">This is a placeholder for the strategy testing functionality.</p>
        <p className="text-sm text-gray-400">
          Future features: backtesting, paper trading, performance metrics
        </p>
      </div>
    </div>
  );
};

export default StrategyTest;
