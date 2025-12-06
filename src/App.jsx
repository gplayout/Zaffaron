import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useLanguage, LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
// Lazy load components
const HomeFeed = lazy(() => import('./components/HomeFeed'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const RecipeDetail = lazy(() => import('./components/RecipeDetail'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ChefStudio = lazy(() => import('./components/ChefStudio'));
const VerificationGallery = lazy(() => import('./components/VerificationGallery'));

import { FavoritesProvider } from './context/FavoritesContext';
import { ToastProvider } from './context/ToastContext';
import { RecipeProvider } from './context/RecipeContext';
import { ThemeProvider } from './context/ThemeContext';

import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import PreferencesModal from './components/PreferencesModal';
import DebugPanel from './components/DebugPanel';

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

import ScrollToTop from './components/ScrollToTop';

// ... imports

const AppContent = () => {
  const { preferences } = usePreferences();
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeFeed />} />
            <Route path="favorites" element={<FavoritesPage />} />

            <Route path="category/:id" element={<CategoryPage />} />
            <Route path="recipe/:slug" element={<RecipeDetail />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="chef-studio" element={<ChefStudio />} />
            <Route path="verify" element={<VerificationGallery />} />

            <Route path="*" element={<div className="p-10 text-center">{t('notFound')}</div>} />
          </Route>
        </Routes>
      </Suspense>

      <PreferencesModal
        isOpen={!preferences.onboardingCompleted && location.pathname === '/'}
        onClose={() => { }} // Handled internally by component
      />
      <DebugPanel />
    </>
  );
};

import { AIProvider } from './context/AIContext';

function App() {
  return (
    <LanguageProvider>
      <PreferencesProvider>
        <RecipeProvider>
          <ToastProvider>
            <FavoritesProvider>
              <ThemeProvider>
                <AIProvider>
                  <AppContent />
                </AIProvider>
              </ThemeProvider>
            </FavoritesProvider>
          </ToastProvider>
        </RecipeProvider>
      </PreferencesProvider>
    </LanguageProvider>
  );
}

export default App;
