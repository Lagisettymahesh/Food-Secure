import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Landing from './pages/Landing';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AuthForms from './pages/AuthForms';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

/* ── Navigation bar ─────────────────────────────── */
const NavigationLayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMobileOpen(false);
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className="navbar px-4 h-16 flex items-center">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-md"
          >
            <Heart size={18} />
          </motion.div>
          <span className="font-black text-lg tracking-tight text-gray-900 dark:text-white">FoodRescue</span>
        </Link>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-panel transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-500" />}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={`/${user.role}`}
                className="text-sm text-gray-500 dark:text-dark-muted hover:text-primary-600 font-medium transition-colors"
              >
                My Dashboard
              </Link>
              <div className="h-4 w-px bg-gray-200 dark:bg-dark-border" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden lg:block">
                Hi, {user.name?.split(' ')[0]}! 👋
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={15} /> Logout
              </motion.button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="btn-ghost text-sm"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
              <Link to="/auth" className="btn-ghost text-sm">Sign In</Link>
              <Link to="/auth" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}

          >
            {user ? (
              <>
                <span className="text-sm text-gray-500 px-2">Hi, {user.name}!</span>
                <Link to={`/${user.role}`} onClick={() => setMobileOpen(false)} className="btn-ghost justify-start text-sm">My Dashboard</Link>
                <button onClick={handleLogout} className="btn-ghost justify-start text-sm text-red-500">Logout</button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-ghost justify-start text-sm">Sign In</Link>
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

/* ── Page transition wrapper ────────────────────── */
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

/* ── App ───────────────────────────────────────── */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text font-sans antialiased">
        <NavigationLayer />
        <main className="container mx-auto">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
              <Route path="/auth" element={<PageWrapper><AuthForms /></PageWrapper>} />
              <Route path="/admin/*" element={<PageWrapper><AdminPanel /></PageWrapper>} />
              <Route path="/donor/*" element={<ProtectedRoute allowedRole="donor"><PageWrapper><DonorDashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/ngo/*" element={<ProtectedRoute allowedRole="ngo"><PageWrapper><NGODashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/volunteer/*" element={<ProtectedRoute allowedRole="volunteer"><PageWrapper><VolunteerDashboard /></PageWrapper></ProtectedRoute>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;
