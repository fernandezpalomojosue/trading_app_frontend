import React, { useState } from 'react';
import TradeModal from './TradeModal';

const BuyModal = ({ isOpen, onClose, asset, onBuySuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentPrice = asset?.details?.market_data?.price || 0;
  const totalAmount = quantity && currentPrice ? quantity * currentPrice : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    
    try {
      const result = await onBuySuccess(asset.symbol, parseFloat(quantity), currentPrice);
      onClose();
      setQuantity('');
    } catch (err) {
      setError(err.message || 'Failed to place buy order');
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

  return (
    <TradeModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Buy ${asset?.symbol}`}
      onSubmit={handleSubmit}
      submitText={`Buy ${asset?.symbol}`}
      submitDisabled={!quantity || parseFloat(quantity) <= 0}
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

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            placeholder="0"
            min="0"
            step="0.01"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Order Summary */}
        {quantity && parseFloat(quantity) > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per share:</span>
                <span className="font-medium">{formatCurrency(currentPrice)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-green-200">
                <span className="font-medium text-green-800">Total Amount:</span>
                <span className="font-bold text-green-800">{formatCurrency(totalAmount)}</span>
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

export default BuyModal;
