import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiStrategiesService } from '../services/strategiesService';
import { Sparkles, Loader2, AlertTriangle, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

const AIStrategyGenerate = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const MIN_LENGTH = 10;
  const MAX_LENGTH = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (prompt.length < MIN_LENGTH || prompt.length > MAX_LENGTH) {
      setError({
        type: 'validation',
        message: `La descripción debe tener entre ${MIN_LENGTH} y ${MAX_LENGTH} caracteres.`
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aiStrategiesService.generateStrategy(prompt);
      setResult(data);
    } catch (err) {
      if (err.response?.status === 422) {
        setError({
          type: 'validation',
          message: 'No se pudo generar estrategia válida. Revisa tu descripción.',
          details: err.response?.data?.details
        });
      } else if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retry_after_seconds || 60;
        setError({
          type: 'rate_limit',
          message: `Demasiadas solicitudes. Espera ${retryAfter} segundos.`,
          retryAfter
        });
      } else {
        setError({
          type: 'server',
          message: 'Error del servidor. Intenta más tarde.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    handleSubmit({ preventDefault: () => {} });
  };

  const handleNavigateToStrategies = () => {
    navigate('/strategies');
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy': return 'text-green-600 bg-green-50';
      case 'sell': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Sparkles className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-800">Generate AI Strategy</h1>
      </div>

      {/* Form Section */}
      {!result && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Describe tu estrategia de trading
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ejemplo: Compra cuando RSI esté bajo 30 y el precio cruce por encima del EMA de 20 períodos"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={5}
                disabled={loading}
              />
              <div className="flex justify-between mt-2 text-sm">
                <span className={`${prompt.length < MIN_LENGTH || prompt.length > MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                  {prompt.length} / {MAX_LENGTH} caracteres
                </span>
                {prompt.length > 0 && prompt.length < MIN_LENGTH && (
                  <span className="text-red-500">Mínimo {MIN_LENGTH} caracteres</span>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-red-700 font-medium">{error.message}</p>
                  {error.details && (
                    <p className="text-red-600 text-sm mt-1">{JSON.stringify(error.details)}</p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || prompt.length < MIN_LENGTH || prompt.length > MAX_LENGTH}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generar Estrategia</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Loading Section */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">AI procesando tu estrategia...</p>
          <p className="text-sm text-gray-400 mt-2">Esto puede tomar hasta 30 segundos</p>
        </div>
      )}

      {/* Success Section */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Success Message */}
          {result.saved ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium">Estrategia creada y guardada exitosamente</p>
                <p className="text-green-600 text-sm mt-1">Tu estrategia ya está activa y lista para usar</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-yellow-700 font-medium">Estrategia generada pero no guardada</p>
                <p className="text-yellow-600 text-sm mt-1">Hubo un problema al guardar en la base de datos</p>
              </div>
            </div>
          )}

          {/* Strategy Details */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nombre</h3>
              <p className="text-xl font-semibold text-gray-800 mt-1">{result.name}</p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Descripción</h3>
              <p className="text-gray-700 mt-1">{result.description}</p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Acción</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold uppercase mt-1 ${getActionColor(result.action)}`}>
                {result.action}
              </span>
            </div>

            {result.validation_errors && result.validation_errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-700 mb-2">Errores de validación</h3>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {result.validation_errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {result.saved ? (
              <button
                onClick={handleNavigateToStrategies}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span>Ver Estrategias</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Reintentar Guardar</span>
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span>Nueva Estrategia</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
        <h4 className="font-medium mb-2">Indicadores soportados</h4>
        <p className="mb-2">Puedes crear estrategias usando: RSI, SMA, EMA, MACD, price_change, price_percentage_change</p>
        <p className="text-xs text-blue-600">Operadores: &lt;, &lt;=, &gt;, &gt;=, ==, !=, cross_above, cross_below</p>
      </div>
    </div>
  );
};

export default AIStrategyGenerate;
