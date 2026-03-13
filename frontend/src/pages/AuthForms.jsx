import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, Building, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const roles = [
  { key: 'donor', label: 'Donor', emoji: '🍱', desc: 'Restaurant / Hotel' },
  { key: 'ngo', label: 'NGO', emoji: '🏠', desc: 'Shelter / Food Bank' },
  { key: 'volunteer', label: 'Volunteer', emoji: '🚲', desc: 'Individual helper' },
];

const AuthForms = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name_or_org: '', role: 'donor' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002/api/v1';
      if (isLogin) {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email, password: formData.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(`/${res.data.user.role}`);
      } else {
        await axios.post(`${API_URL}/auth/register`, formData);
        setSuccess('Account created! Please log in with your credentials.');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => { setIsLogin(!isLogin); setError(''); setSuccess(''); };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-5 shadow-lg glow-green">
            <Heart size={28} className="text-white" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                {isLogin ? 'Welcome back!' : 'Create account'}
              </h2>
              <p className="text-gray-500 dark:text-dark-muted mt-1">
                {isLogin ? 'Sign in to continue your mission.' : 'Join the fight against food waste.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 18 }}
          className="glass rounded-3xl p-8 shadow-2xl"
        >
          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="badge-red rounded-xl p-3.5 mb-5 text-sm font-medium overflow-hidden"
              >
                ⚠️ {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl p-3.5 mb-5 text-sm font-medium flex items-center gap-2 overflow-hidden"
              >
                <CheckCircle size={16} /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector — registration only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-widest mb-2">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map(r => (
                      <button
                        type="button"
                        key={r.key}
                        onClick={() => setFormData({ ...formData, role: r.key })}
                        className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 text-center transition-all duration-200 ${formData.role === r.key
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                            : 'border-gray-200 dark:border-dark-border hover:border-primary-300 text-gray-500'
                          }`}
                      >
                        <span className="text-xl mb-1">{r.emoji}</span>
                        <span className="text-xs font-bold uppercase tracking-wide">{r.label}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{r.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Name field */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                      {formData.role === 'volunteer' ? <User size={13} /> : <Building size={13} />}
                      {formData.role === 'volunteer' ? 'Full Name' : 'Organization Name'}
                    </label>
                    <input
                      type="text" required
                      className="input-field"
                      placeholder={formData.role === 'volunteer' ? 'Sarah Jenkins' : 'City Rescue Shelter'}
                      onChange={e => setFormData({ ...formData, name_or_org: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Mail size={13} /> Email Address
              </label>
              <input
                type="email" required
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <Lock size={13} /> Password
              </label>
              <input
                type="password" required
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-dark w-full py-3.5 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={switchMode} className="text-primary-600 font-bold hover:underline">
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthForms;
