import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, BarChart3, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">Trading App</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
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
                <div className="flex items-center space-x-3 pl-6 border-l border-gray-300">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Resumen</span>
                  </Link>
                  <Link
                    to="/assets"
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span>Activos</span>
                  </Link>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-700 font-medium">{user?.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
