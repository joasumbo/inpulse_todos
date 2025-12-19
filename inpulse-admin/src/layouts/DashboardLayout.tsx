import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Newspaper,
  MessageSquare,
  Menu as MenuIcon,
  ExternalLink,
  LogOut,
  Palette,
  Share2,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
  { icon: Palette, label: 'Aparência', path: '/appearance' },
  { icon: FileText, label: 'Páginas', path: '/pages' },
  { icon: Newspaper, label: 'Blog', path: '/blog' },
  { icon: MenuIcon, label: 'Menu & Navegação', path: '/menu' },
  { icon: Share2, label: 'Redes Sociais', path: '/social' },
  { icon: MessageSquare, label: 'Contatos', path: '/contacts' },
];

export function DashboardLayout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <img src="/inpulse_logo.png" alt="Inpulse" className="h-8 w-auto" />
                <h1 className="text-xl font-bold">INPULSE CMS</h1>
              </div>
            ) : (
              <img src="/inpulse_logo.png" alt="Inpulse" className="h-8 w-auto mx-auto" />
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <MenuIcon size={20} />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
          {sidebarOpen && (
            <div className="mt-4 text-xs text-gray-500 px-4">
              {user?.email}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            <a
              href="https://inpulse-events.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ExternalLink size={16} />
              Ver Site
            </a>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
