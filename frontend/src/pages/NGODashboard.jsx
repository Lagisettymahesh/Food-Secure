import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Search, Filter, Package, Zap, Heart, Bell } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import api from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';
import { SkeletonRow, Toast } from '../components/UI';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 14);
  }, [coords, map]);
  return null;
};

const NGODashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [claimingId, setClaimingId] = useState(null);
  const [toast, setToast] = useState(null);

  const { socket, connected } = useSocket('ngo');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations/nearby');
      setDonations(res.data.donations);
    } catch (err) {
      console.error('Failed to fetch nearby donations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Socket.io listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('donation:new', (newDonation) => {
      setDonations(prev => [newDonation, ...prev]);
      setToast({ message: `New donation: ${newDonation.food_type}!`, type: 'success' });
      // Clear toast after 5s
      setTimeout(() => setToast(null), 5000);
    });

    socket.on('donation:claimed', ({ donation_id }) => {
      setDonations(prev => prev.filter(d => d.id !== donation_id));
    });

    socket.on('donation:expired', () => {
      fetchDonations(); // Refresh on bulk expiry
    });

    return () => {
      socket.off('donation:new');
      socket.off('donation:claimed');
      socket.off('donation:expired');
    };
  }, [socket]);

  const handleClaim = async (donation) => {
    setClaimingId(donation.id);
    try {
      await api.post('/ngo/requests', {
        donation_id: donation.id,
        requested_quantity: donation.quantity,
        needs_volunteer: true
      });
      setDonations(prev => prev.filter(d => d.id !== donation.id));
      setSelectedDonation(null);
      setToast({ message: 'Donation claimed! Delivery task created.', type: 'success' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to claim donation');
    } finally {
      setClaimingId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const mapCenter = [40.7128, -74.0060]; // Default NY for this demo

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)]">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Live Food Map</h2>
          <p className="text-gray-600 dark:text-gray-400">Discover and claim nearby surplus food in real-time.</p>
        </div>
        <div className="glass-effect p-4 rounded-xl flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-500 uppercase flex items-center">
              <Package size={14} className="mr-1" /> Total Active
            </span>
            <span className="text-xl font-bold text-secondary-600">{donations.length} Donations</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* ── Left Side: Interactive Map ────────────────────────── */}
        <div className="lg:w-2/3 h-full glass rounded-3xl overflow-hidden shadow-2xl relative border border-gray-100 dark:border-dark-border">
          {!connected && (
             <div className="absolute top-4 left-4 z-[1000] badge-red flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Live Sync Offline
             </div>
          )}
          <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <RecenterMap coords={selectedDonation ? [selectedDonation.pickup_lat, selectedDonation.pickup_lng] : null} />
            
            {donations.map(donation => (
              <Marker 
                key={donation.id} 
                position={[donation.pickup_lat, donation.pickup_lng]}
                icon={L.icon({
                  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                  popupAnchor: [0, -40]
                })}
                eventHandlers={{
                  click: () => setSelectedDonation(donation)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <h4 className="font-black text-gray-900">{donation.food_type}</h4>
                    <p className="text-xs text-gray-500 mb-2">{donation.quantity} units available</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleClaim(donation); }}
                      className="btn-primary w-full py-1 text-xs"
                    >
                      Quick Claim
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Show search radius circle if NGO has one set */}
            <Circle center={mapCenter} radius={5000} pathOptions={{ color: 'var(--primary-500)', fillColor: 'var(--primary-500)', fillOpacity: 0.1 }} />
          </MapContainer>
        </div>

        {/* ── Right Side: Live Feed ────────────────────────────── */}
        <div className="lg:w-1/3 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Zap size={16} className="text-yellow-500" /> Live Feed
            </h3>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[10px] font-bold text-gray-400 capitalize">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {loading ? (
              <SkeletonRow count={4} />
            ) : donations.length === 0 ? (
              <div className="glass p-8 text-center rounded-2xl border-dashed border-2 border-gray-200">
                <Package className="mx-auto text-gray-300 mb-2" size={40} />
                <p className="text-sm font-bold text-gray-400">No active donations nearby</p>
              </div>
            ) : (
              <AnimatePresence mode='popLayout'>
                {donations.map((donation) => (
                  <motion.div
                    key={donation.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    onClick={() => setSelectedDonation(donation)}
                    className={`glass p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                      selectedDonation?.id === donation.id 
                      ? 'border-primary-500 shadow-lg shadow-primary-500/10' 
                      : 'border-transparent hover:border-gray-200 dark:hover:border-dark-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-black text-gray-900 dark:text-white leading-tight">{donation.food_type}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="badge-green text-[10px] px-2 py-0.5">{donation.quantity} units</span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              Exp: {new Date(donation.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-dark-panel rounded-lg text-gray-400">
                        <MapPin size={16} />
                      </div>
                    </div>

                    {selectedDonation?.id === donation.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border overflow-hidden"
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleClaim(donation); }}
                          disabled={claimingId === donation.id}
                          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                        >
                          {claimingId === donation.id ? 'Claiming...' : 'Claim & Request Delivery'}
                          <Heart size={18} fill="currentColor" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
