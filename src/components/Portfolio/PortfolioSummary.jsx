import React from 'react';

const PortfolioSummary = ({ summary }) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    const sign = percentage >= 0 ? '+' : '';
    const color = percentage >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={color}>
        {sign}{percentage.toFixed(2)}%
      </span>
    );
  };

  const summaryCards = [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(summary.total_portfolio_value || 0),
      subtitle: 'All assets combined'
    },
    {
      title: 'Cash Balance',
      value: formatCurrency(summary.cash_balance || 0),
      subtitle: 'Available for trading'
    },
    {
      title: 'Unrealized P&L',
      value: formatCurrency(summary.unrealized_pl || 0),
      subtitle: formatPercentage(summary.unrealized_pl_percentage || 0)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {summaryCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {card.title}
          </h3>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {card.value}
          </div>
          <p className="text-sm text-gray-600">
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PortfolioSummary;
