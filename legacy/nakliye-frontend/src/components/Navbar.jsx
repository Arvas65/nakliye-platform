import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  MessageCircle,
  Package,
  Plus,
  BarChart3
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, className = '', onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
      } ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Nakliye Platform
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/">Ana Sayfa</NavLink>
            <NavLink to="/cargo">Yük İlanları</NavLink>
            
            {user ? (
              <>
                <NavLink to="/dashboard">
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Dashboard
                </NavLink>
                
                {user.user_type === 'cargo_owner' && (
                  <NavLink to="/create-cargo">
                    <Plus className="h-4 w-4 inline mr-1" />
                    İlan Ver
                  </NavLink>
                )}
                
                <NavLink to="/offers">
                  <Package className="h-4 w-4 inline mr-1" />
                  Teklifler
                </NavLink>
                
                <NavLink to="/chat">
                  <MessageCircle className="h-4 w-4 inline mr-1" />
                  Mesajlar
                </NavLink>
                
                <NavLink to="/notifications">
                  <Bell className="h-4 w-4 inline mr-1" />
                  Bildirimler
                </NavLink>
                
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                  <NavLink to="/profile">
                    <User className="h-4 w-4 inline mr-1" />
                    {user.full_name || user.username}
                  </NavLink>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink to="/login">Giriş Yap</NavLink>
                <Button asChild>
                  <Link to="/register">Kayıt Ol</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink 
              to="/" 
              className="block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ana Sayfa
            </NavLink>
            <NavLink 
              to="/cargo" 
              className="block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Yük İlanları
            </NavLink>
            
            {user ? (
              <>
                <NavLink 
                  to="/dashboard" 
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Dashboard
                </NavLink>
                
                {user.user_type === 'cargo_owner' && (
                  <NavLink 
                    to="/create-cargo" 
                    className="block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    İlan Ver
                  </NavLink>
                )}
                
                <NavLink 
                  to="/offers" 
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  Teklifler
                </NavLink>
                
                <NavLink 
                  to="/chat" 
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageCircle className="h-4 w-4 inline mr-2" />
                  Mesajlar
                </NavLink>
                
                <NavLink 
                  to="/notifications" 
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Bell className="h-4 w-4 inline mr-2" />
                  Bildirimler
                </NavLink>
                
                <NavLink 
                  to="/profile" 
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Profil
                </NavLink>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <NavLink 
                  to="/login" 
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Giriş Yap
                </NavLink>
                <NavLink 
                  to="/register" 
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kayıt Ol
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

