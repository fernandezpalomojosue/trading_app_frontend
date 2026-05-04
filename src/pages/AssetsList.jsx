import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketService, favoritesService } from '../services/strategiesService';
import { Search, TrendingUp, TrendingDown, Star } from 'lucide-react';

const AssetsList = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  const toggleFavorite = async (symbol) => {
    const isFavorite = favorites.has(symbol);
    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(symbol);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(symbol);
          return newFavorites;
        });
      } else {
        await favoritesService.addFavorite(symbol);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.add(symbol);
          return newFavorites;
        });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const fetchAssets = async (page = 0, search = '') => {
    try {
      setLoading(true);
      const data = await marketService.getAssets('stocks', 50, page * 50);
      
      if (page === 0) {
        setAssets(data);
      } else {
        setAssets(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 50);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los activos');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // Load user favorites on mount
    const loadFavorites = async () => {
      try {
        const data = await favoritesService.getFavorites();
        if (data.favorites) {
          setFavorites(new Set(data.favorites.map(f => f.symbol)));
        }
      } catch (err) {
        console.error('Failed to load favorites:', err);
      }
    };
    loadFavorites();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(0);
    
    if (term.length > 2 || term.length === 0) {
      fetchAssets(0, term);
    }
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchAssets(nextPage, searchTerm);
  };

  const filteredAssets = assets.filter(asset =>
    asset.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && assets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Assets List</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Símbolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Favorites
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    <Link 
                      to={`/assets/${asset.symbol}`}
                      className="text-green-600 hover:text-green-800 hover:underline"
                    >
                      {asset.symbol}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleFavorite(asset.symbol)}
                      className={`inline-flex items-center justify-center p-1 rounded transition-colors ${
                        favorites.has(asset.symbol) 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-gray-400 hover:text-gray-500'
                      }`}
                    >
                      <Star 
                        className="h-5 w-5" 
                        fill={favorites.has(asset.symbol) ? "currentColor" : "none"}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsList;
