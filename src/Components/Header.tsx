import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Smartphone, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600';
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <Smartphone className="h-8 w-8 text-indigo-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">GameToAPK</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className={`font-medium transition-colors duration-200 ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/upload" className={`font-medium transition-colors duration-200 ${isActive('/upload')}`}>
              Upload
            </Link>
            <Link to="/downloads" className={`font-medium transition-colors duration-200 ${isActive('/downloads')}`}>
              Downloads
            </Link>
          </nav>

          <button 
            className="md:hidden focus:outline-none" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`font-medium py-2 ${isActive('/')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/upload" 
                className={`font-medium py-2 ${isActive('/upload')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Upload
              </Link>
              <Link 
                to="/downloads" 
                className={`font-medium py-2 ${isActive('/downloads')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Downloads
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;