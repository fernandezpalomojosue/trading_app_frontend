import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3 } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">Trading App</h1>
          </div>
          
          <div className="flex space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Resumen</span>
            </Link>
            <Link
              to="/assets"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Activos</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
