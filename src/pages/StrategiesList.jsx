import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { strategyService } from '../services/api';
import { List, Loader2, AlertTriangle, ToggleLeft, ToggleRight, Sparkles, Plus } from 'lucide-react';

const StrategiesList = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  useEffect(() => {
    loadStrategies();
  }, [filter]);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        skip: 0,
        limit: 50,
      };

      if (filter === 'active') {
        params.active_only = true;
      } else if (filter === 'inactive') {
        params.active_only = false;
      }

      const data = await strategyService.getUserStrategies(params);
      setStrategies(data.items || []);
    } catch (err) {
      setError('Error al cargar las estrategias');
      console.error('Failed to load strategies:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStrategy = async (id, currentStatus) => {
    try {
      await strategyService.updateStrategy(id, { is_active: !currentStatus });
      // Reload strategies to show updated status
      loadStrategies();
    } catch (err) {
      console.error('Failed to toggle strategy:', err);
      alert('Error al actualizar estrategia');
    }
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy': return 'text-green-600 bg-green-50';
      case 'sell': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getFilterCount = (type) => {
    if (type === 'all') return strategies.length;
    if (type === 'active') return strategies.filter(s => s.is_active).length;
    if (type === 'inactive') return strategies.filter(s => !s.is_active).length;
    return 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <List className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">My Strategies</h1>
        </div>
        <Link
          to="/strategies/generate"
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Sparkles className="h-5 w-5" />
          <span>Generate with AI</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label} ({getFilterCount(key)})
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && strategies.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <List className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No strategies yet</h3>
          <p className="text-gray-500 mb-6">Create your first strategy using AI</p>
          <Link
            to="/strategies/generate"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            <span>Generate Strategy</span>
          </Link>
        </div>
      )}

      {/* Strategies List */}
      {!loading && strategies.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {strategies.map((strategy) => (
                <tr key={strategy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{strategy.name}</div>
                    <div className="text-xs text-gray-500">ID: {strategy.id?.slice(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {strategy.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStrategy(strategy.id, strategy.is_active)}
                      className="flex items-center space-x-2"
                    >
                      {strategy.is_active ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                      )}
                      <span className={`text-sm ${strategy.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                        {strategy.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/strategies/${strategy.id}`}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StrategiesList;
