import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { executionPlansService } from '../services/api';
import { Play, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Loader2 } from 'lucide-react';

const ExecutionPlansList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await executionPlansService.getAllPlans();
      setPlans(data || []);
    } catch (err) {
      setError('Error al cargar los planes de ejecución');
      console.error('Failed to load execution plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlan = async (id, currentStatus) => {
    try {
      await executionPlansService.updatePlan(id, { is_active: !currentStatus });
      // Optimistic update
      setPlans(plans.map(plan => 
        plan.id === id ? { ...plan, is_active: !currentStatus } : plan
      ));
    } catch (err) {
      console.error('Failed to toggle plan:', err);
      alert('Error al actualizar plan');
      // Revert optimistic update
      loadPlans();
    }
  };

  const deletePlan = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan de ejecución?')) {
      return;
    }

    try {
      await executionPlansService.deletePlan(id);
      setPlans(plans.filter(plan => plan.id !== id));
    } catch (err) {
      console.error('Failed to delete plan:', err);
      alert('Error al eliminar plan');
    }
  };

  const getTimeframeColor = (timeframe) => {
    switch (timeframe) {
      case 'minute': return 'text-blue-600 bg-blue-50';
      case 'hour': return 'text-green-600 bg-green-50';
      case '4hour': return 'text-purple-600 bg-purple-50';
      case 'day': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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
          <Play className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Execution Plans</h1>
        </div>
        <Link
          to="/execution-plans/create"
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Plan</span>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && plans.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No execution plans yet</h3>
          <p className="text-gray-500 mb-6">Create your first execution plan to start trading with your strategies</p>
          <Link
            to="/execution-plans/create"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Plan</span>
          </Link>
        </div>
      )}

      {/* Plans List */}
      {!loading && plans.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stocks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeframe
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
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{plan.strategy_name}</div>
                    <div className="text-xs text-gray-500">ID: {plan.id?.slice(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {plan.stocks.slice(0, 3).map((stock, idx) => (
                        <span
                          key={idx}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                        >
                          {stock}
                        </span>
                      ))}
                      {plan.stocks.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          +{plan.stocks.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase ${getTimeframeColor(plan.timeframe)}`}>
                      {plan.timeframe}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePlan(plan.id, plan.is_active)}
                      className="flex items-center space-x-2"
                    >
                      {plan.is_active ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                      )}
                      <span className={`text-sm ${plan.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/execution-plans/${plan.id}/edit`}
                        className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
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

export default ExecutionPlansList;
