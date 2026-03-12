import React, { useState } from 'react';
import TradeModal from './TradeModal';

const SellModal = ({ isOpen, onClose, asset, userHoldings, onSellSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentPrice = asset?.details?.market_data?.price || 0;
  const totalAmount = quantity && currentPrice ? quantity * currentPrice : 0;
  const maxQuantity = userHoldings?.quantity || 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (parseFloat(quantity) > maxQuantity) {
      setError(`You only have ${formatNumber(maxQuantity)} shares available`);
      return;
    }

    setLoading(true);
    
    try {
      const result = await onSellSuccess(asset.symbol, parseFloat(quantity));
      onClose();
      setQuantity('');
    } catch (err) {
      setError(err.message || 'Failed to place sell order');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || (value >= 0 && !isNaN(value))) {
      setQuantity(value);
      setError('');
    }
  };

  const handleMaxClick = () => {
    setQuantity(maxQuantity.toString());
    setError('');
  };

  return (
    <TradeModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sell ${asset?.symbol}`}
      onSubmit={handleSubmit}
      submitText={`Sell ${asset?.symbol}`}
      submitDisabled={!quantity || parseFloat(quantity) <= 0 || parseFloat(quantity) > maxQuantity}
      loading={loading}
    >
      <div className="space-y-4">
        {/* Asset Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Asset</p>
              <p className="font-semibold text-gray-900">{asset?.symbol}</p>
              <p className="text-sm text-gray-600">{asset?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="font-semibold text-gray-900">{formatCurrency(currentPrice)}</p>
            </div>
          </div>
        </div>

        {/* Available Holdings */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Available Shares</p>
              <p className="font-semibold text-blue-800">{formatNumber(maxQuantity)}</p>
            </div>
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Max
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity to Sell
          </label>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            placeholder="0"
            min="0"
            max={maxQuantity}
            step="0.01"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Order Summary */}
        {quantity && parseFloat(quantity) > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity to sell:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per share:</span>
                <span className="font-medium">{formatCurrency(currentPrice)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-red-200">
                <span className="font-medium text-red-800">Total Proceeds:</span>
                <span className="font-bold text-red-800">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Risk Warning */}
        <div className="bg-yellow-50 p-3 rounded-md">
          <p className="text-xs text-yellow-800">
            This is a market order. The order will be executed at the current market price.
          </p>
        </div>
      </div>
    </TradeModal>
  );
};

export default SellModal;
