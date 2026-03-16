import React from 'react';

const PortfolioSummary = ({ summary }) => {
  console.log('DEBUG PortfolioSummary - summary:', summary);
  
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
    console.log('DEBUG formatCurrency - amount:', amount, 'type:', typeof amount);
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    console.log('DEBUG formatPercentage - percentage:', percentage, 'type:', typeof percentage);
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      return <span className="text-gray-600">0.00%</span>;
    }
    const sign = percentage >= 0 ? '+' : '';
    const color = percentage >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={color}>
        {sign}{Number(percentage).toFixed(2)}%
      </span>
    );
  };

  const summaryCards = [
    {
      title: 'Total Portfolio Value',
      value: (() => {
        console.log('DEBUG - total_portfolio_value:', summary.total_portfolio_value);
        return formatCurrency(summary.total_portfolio_value || 0);
      })(),
      subtitle: 'All assets combined'
    },
    {
      title: 'Cash Balance',
      value: (() => {
        console.log('DEBUG - cash_balance:', summary.cash_balance);
        return formatCurrency(summary.cash_balance || 0);
      })(),
      subtitle: 'Available for trading'
    },
    {
      title: 'Unrealized P&L',
      value: (() => {
        console.log('DEBUG - total_unrealized_pnl:', summary.total_unrealized_pnl);
        return formatCurrency(summary.total_unrealized_pnl || 0);
      })(),
      subtitle: (() => {
        console.log('DEBUG - unrealized_pnl_percentage:', summary.unrealized_pnl_percentage);
        return formatPercentage(summary.unrealized_pnl_percentage || 0);
      })()
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
