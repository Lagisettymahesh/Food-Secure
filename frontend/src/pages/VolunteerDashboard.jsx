import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Camera, CheckCircle, Package, MapPin, Zap, RefreshCw } from 'lucide-react';
import api from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';
import { SkeletonRow, Toast } from '../components/UI';

const VolunteerDashboard = () => {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ total_deliveries: 0, impact_points: 0 });

  const { socket, connected } = useSocket('volunteer');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/volunteer/tasks/available'),
        api.get('/volunteer/stats')
      ]);
      setAvailableTasks(tasksRes.data.tasks);
      setStats(statsRes.data.stats);
      
      // Check for an ongoing task
      const activeRes = await api.get('/volunteer/tasks');
      const ongoing = activeRes.data.tasks.find(t => t.status !== 'completed' && t.status !== 'cancelled');
      if (ongoing) setActiveTask(ongoing);
      
    } catch (err) {
      console.error('Failed to fetch volunteer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('task:new', (newTask) => {
      setAvailableTasks(prev => [newTask, ...prev]);
      setToast({ message: 'New delivery task available nearby!', type: 'success' });
      setTimeout(() => setToast(null), 5000);
    });

    socket.on('task:claimed', ({ donation_id }) => {
      setAvailableTasks(prev => prev.filter(t => t.donation_id !== donation_id));
    });

    return () => {
      socket.off('task:new');
      socket.off('task:claimed');
    };
  }, [socket]);

  const handleAcceptTask = async (taskId) => {
    try {
      const res = await api.patch(`/volunteer/tasks/${taskId}/status`, { status: 'accepted' });
      setActiveTask(res.data.task);
      setAvailableTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept task');
    }
  };

  const advanceTask = async () => {
    let nextStatus = '';
    if (activeTask.status === 'accepted') nextStatus = 'picked_up';
    else if (activeTask.status === 'picked_up') nextStatus = 'completed';

    if (!nextStatus) return;

    try {
      const res = await api.patch(`/volunteer/tasks/${activeTask.id}/status`, { status: nextStatus });
      setActiveTask(res.data.task);
      if (nextStatus === 'completed') {
        setToast({ message: 'Great job! Impact points awarded.', type: 'success' });
        setTimeout(() => {
          setActiveTask(null);
          setToast(null);
          fetchData(); // Refresh stats
        }, 3000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Volunteer Hub
          </h2>
          <p className="text-gray-500 font-medium">Rescue food, earn points, save the planet.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex flex-col items-center border-b-4 border-primary-500">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Rescues</span>
             <span className="text-2xl font-black">{stats.total_deliveries}</span>
          </div>
          <div className="glass px-6 py-3 rounded-2xl flex flex-col items-center border-b-4 border-secondary-500">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Impact Points</span>
             <span className="text-2xl font-black text-secondary-600">{stats.impact_points}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeTask ? (
          <motion.div 
            key="tasks_list"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-6 px-2">
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" /> Available Near You
               </h3>
               <button onClick={fetchData} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-panel rounded-full transition-colors">
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
               </button>
            </div>

            {loading ? (
              <SkeletonRow count={3} />
            ) : availableTasks.length === 0 ? (
              <div className="glass-panel p-20 text-center rounded-[2.5rem] border-dashed border-2 border-gray-200 dark:border-dark-border">
                 <Package className="mx-auto text-gray-200 mb-4" size={64} />
                 <h4 className="text-xl font-bold text-gray-400">All clear! No pending rescues.</h4>
                 <p className="text-gray-400 text-sm mt-2">New requests will appear here in real-time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTasks.map((task) => (
                  <motion.div 
                    key={task.id} 
                    layout
                    className="glass p-6 rounded-3xl hover-lift border border-transparent hover:border-primary-200 dark:hover:border-primary-900/30 flex flex-col justify-between h-full group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600 group-hover:scale-110 transition-transform">
                           <Package size={24} />
                        </div>
                        <span className="badge-green font-black uppercase tracking-tighter text-[10px]">
                          Real-time
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-black mb-1">{task.donation?.food_type || 'Surplus Food'}</h3>
                      <p className="text-sm font-bold text-gray-400 mb-6">{task.donation?.quantity} units ready for pickup</p>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex gap-3">
                           <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pickup From</p>
                              <p className="text-sm font-bold truncate">Donor Location ID: {task.donation?.id.slice(0,8)}</p>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deliver To</p>
                              <p className="text-sm font-bold truncate">NGO Location ID: {task.ngo_id.slice(0,8)}</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAcceptTask(task.id)}
                      className="btn-primary w-full py-4 text-sm uppercase tracking-widest"
                    >
                      Accept Mission
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="active_task"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass max-w-2xl mx-auto rounded-[3rem] p-10 shadow-3xl relative overflow-hidden border-2 border-primary-500"
          >
            {activeTask.status === 'completed' && (
              <div className="absolute inset-0 bg-primary-500/95 z-20 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-md">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <CheckCircle size={100} className="mb-4" />
                </motion.div>
                <h3 className="text-4xl font-black mb-2 uppercase tracking-tight">Mission Accomplished!</h3>
                <p className="text-lg opacity-90 font-medium">+50 Impact Points & 1 Heart earned.</p>
              </div>
            )}

            <div className="flex justify-between items-center mb-10">
              <div className="badge-primary px-4 py-1 animate-pulse">LIVE MISSION</div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking GPS...</span>
              </div>
            </div>

            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6 border-4 border-primary-100 dark:border-primary-900/40">
                 <Navigation size={40} className="text-primary-600 animate-bounce" />
              </div>
              <h3 className="text-2xl font-black mb-2">
                 {activeTask.status === 'accepted' ? 'En-route to Donor' : 'Heading to NGO Drop-off'}
              </h3>
              <p className="text-gray-500 font-medium px-8">
                {activeTask.status === 'accepted' ? 'Please navigate to the donor location to secure the food rescue.' : 'Food secured! You are now delivering life-saving nutrition to the NGO.'}
              </p>
            </div>

            {/* Status Stepper */}
            <div className="flex items-center justify-between mb-12 relative px-4">
               <div className="absolute left-10 right-10 top-5 h-0.5 bg-gray-100 dark:bg-dark-border -z-10" />
               {[
                 { id: 'accepted', label: 'Accepted', icon: CheckCircle },
                 { id: 'picked_up', label: 'Secured', icon: Package },
                 { id: 'completed', label: 'Delivered', icon: MapPin }
               ].map((step, idx) => {
                 const isActive = activeTask.status === step.id || (activeTask.status === 'completed' && idx < 3);
                 return (
                   <div key={step.id} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${isActive ? 'bg-primary-500 text-white scale-110' : 'bg-white dark:bg-dark-panel text-gray-300'}`}>
                         <step.icon size={20} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>{step.label}</span>
                   </div>
                 );
               })}
            </div>

            <button 
              onClick={advanceTask}
              className="btn-primary w-full py-5 text-xl font-black shadow-2xl glow-green hover:shadow-primary-500/40"
            >
              {activeTask.status === 'accepted' ? 'Confirm Pickup' : 'Complete Delivery'}
            </button>
            
            <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6 flex justify-center items-center gap-2">
               <Camera size={14} /> Tap to upload proof of {activeTask.status === 'accepted' ? 'pickup' : 'delivery'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VolunteerDashboard;
