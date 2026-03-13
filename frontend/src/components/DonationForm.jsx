import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Navigation, CheckCircle } from 'lucide-react';
import api from '../hooks/useApi';

const DonationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    food_type: '',
    quantity: '',
    expiry_time: '',
    pickup_lat: 40.7128, 
    pickup_lng: -74.0060,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Default (New York)');

  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          pickup_lat: position.coords.latitude,
          pickup_lng: position.coords.longitude
        }));
        setLocationStatus('Verified GPS Location ✅');
        setLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Using default.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/donations', {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
      });
      alert('Donation posted successfully! NGOs nearby have been notified.');
      onSuccess();
    } catch (err) {
      console.error('Error posting donation:', err);
      alert(err.response?.data?.error || 'Failed to post donation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <MapPin size={120} />
      </div>

      <h3 className="text-3xl font-black mb-8 text-center bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
        Post Surplus Food
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Food Description</label>
          <input 
            type="text" 
            required
            className="input-field"
            placeholder="e.g., 20x Artisan Sandwiches, Dal Tadka (15kg)"
            value={formData.food_type}
            onChange={(e) => setFormData({...formData, food_type: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Quantity (Meals/KG)</label>
             <input 
                type="number" 
                required
                className="input-field"
                placeholder="25"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
             />
          </div>
          <div>
             <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center">
                <Clock size={14} className="mr-1" /> Best Before
             </label>
             <input 
                type="datetime-local" 
                required
                className="input-field"
                value={formData.expiry_time}
                onChange={(e) => setFormData({...formData, expiry_time: e.target.value})}
             />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center">
            <Navigation size={14} className="mr-1" /> Pickup Location
          </label>
          <div className="p-4 bg-white/60 dark:bg-dark-panel/60 backdrop-blur-sm border border-gray-200 dark:border-dark-border rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${locating ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{locationStatus}</p>
                <p className="text-[10px] text-gray-400 font-medium">Coordinate: {formData.pickup_lat.toFixed(4)}, {formData.pickup_lng.toFixed(4)}</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={detectLocation}
              disabled={locating}
              className="text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            >
              {locating ? 'Locating...' : 'Refresh GPS'}
            </button>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-2xl p-8 text-center hover:bg-white/50 dark:hover:bg-dark-panel/30 transition-all cursor-pointer group">
          <Camera className="mx-auto text-gray-300 group-hover:text-primary-400 mb-2 transition-colors" size={40} />
          <p className="text-sm font-semibold text-gray-400 group-hover:text-gray-500">Add food photo (optional)</p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-primary w-full py-4 text-xl shadow-2xl glow-green disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
               <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
               Processing...
            </span>
          ) : (
            <>Post Donation <CheckCircle size={22} className="ml-2" /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default DonationForm;
