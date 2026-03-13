import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, List, Clock, CheckCircle, Package, TrendingUp } from 'lucide-react';
import DonationForm from '../components/DonationForm';
import api from '../hooks/useApi';
import ErrorBoundary from '../components/ErrorBoundary';
import { SkeletonStatGrid, SkeletonRow } from '../components/UI';

const DonorDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [data, setData] = useState({ donations: [], stats: null });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations/my');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch donor dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-bold mb-2">Welcome Back, Donor!</h2>
          <p className="text-gray-600 dark:text-gray-400">Your surplus food is making a difference.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-6 py-3 shadow-xl"
        >
          {showForm ? <List className="mr-2" size={18} /> : <Plus className="mr-2" size={18} />}
          {showForm ? 'View Dashboard' : 'Post Donation'}
        </button>
      </div>

      {showForm ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DonationForm onSuccess={() => {
            setShowForm(false);
            fetchDashboardData();
          }} />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <SkeletonStatGrid count={3} />
            ) : (
              <>
                <div className="stat-card glow-green">
                  <div className="stat-icon-wrap bg-primary-100 text-primary-600">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black">{data.stats?.totalMeals || 0}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Meals Rescued</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrap bg-green-100 text-green-600">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black">{data.stats?.co2Saved || 0}kg</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">CO2 Offset</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrap bg-blue-100 text-blue-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black">{data.stats?.activeDonations || 0}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Active Feed</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* History Section */}
          <div className="glass rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Package size={120} />
            </div>
            
            <h3 className="text-2xl font-black mb-8 flex items-center">
              <Clock className="mr-3 text-primary-600" size={24} /> Recent Activities
            </h3>
            
            <div className="space-y-4 relative z-10">
              {loading ? (
                [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
              ) : data.donations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-dark-border rounded-2xl">
                  <p className="text-gray-400">No donations posted yet.</p>
                </div>
              ) : (
                data.donations.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/40 dark:bg-dark-panel/40 border border-gray-100 dark:border-dark-border rounded-xl hover:bg-white dark:hover:bg-dark-panel transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-xl">
                        <Package className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{item.food_type}</p>
                        <p className="text-xs text-gray-500">Posted {new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`badge ${
                      item.status === 'completed' ? 'badge-green' :
                      item.status === 'pending' ? 'badge-yellow' :
                      item.status === 'accepted' ? 'badge-blue' :
                      'badge-gray'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DonorDashboard;
