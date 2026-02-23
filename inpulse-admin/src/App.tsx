import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { AppearancePage } from './pages/AppearancePage';
import { PagesListPage } from './pages/PagesListPage';
import { PageEditorPage } from './pages/PageEditorPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogEditorPage } from './pages/BlogEditorPage';
import { MenuPage } from './pages/MenuPage';
import { SocialPage } from './pages/SocialPage';
import { HomeContentPage } from './pages/HomeContentPage';
import { ContactsPage } from './pages/ContactsPage';
import { MyDayQRPage } from './pages/MyDayQRPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="appearance" element={<AppearancePage />} />
            <Route path="home-content" element={<HomeContentPage />} />
            <Route path="pages" element={<PagesListPage />} />
            <Route path="pages/:id" element={<PageEditorPage />} />
            <Route path="blog" element={<BlogListPage />} />
            <Route path="blog/new" element={<BlogEditorPage />} />
            <Route path="blog/:id" element={<BlogEditorPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="social" element={<SocialPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="myday-qr" element={<MyDayQRPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
