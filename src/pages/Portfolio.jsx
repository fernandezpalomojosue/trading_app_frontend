import React, { useState, useEffect } from 'react';
import { portfolioService } from '../services/portfolioService';
import PortfolioSummary from '../components/Portfolio/PortfolioSummary';
import HoldingsList from '../components/Portfolio/HoldingsList';
import TransactionHistory from '../components/Portfolio/TransactionHistory';
import ErrorDisplay from '../components/ErrorDisplay';
import { TrendingUp, RefreshCw } from 'lucide-react';

const Portfolio = () => {
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolioData = async () => {
    try {
      setError(null);
      
      // Fetch all portfolio data in parallel
      const [summaryData, holdingsData, transactionsData] = await Promise.all([
        portfolioService.getPortfolioSummary(),
        portfolioService.getHoldings(),
        portfolioService.getTransactions()
      ]);

      setSummary(summaryData);
      setHoldings(holdingsData);
      setTransactions(transactionsData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPortfolioData();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorDisplay 
          error={error} 
          onDismiss={() => setError(null)}
          className="mb-8"
        />
      )}

      {/* Portfolio Content */}
      <div className="space-y-8">
        <PortfolioSummary summary={summary} />
        <HoldingsList holdings={holdings} />
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
};

export default Portfolio;
