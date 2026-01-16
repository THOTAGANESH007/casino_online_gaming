import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { adminAPI } from '../../api/admin';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import Button from '../common/Button';

const RegionSelect = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const data = await adminAPI.getRegions();
      setRegions(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load regions');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRegion) {
      setError('Please select a region');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await authAPI.selectRegion(parseInt(selectedRegion));
      await refreshUser();
      navigate('/submit-kyc');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to select region');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading regions..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-3xl font-bold text-gray-900">Select Your Region</h2>
          <p className="mt-2 text-gray-600">Choose your gaming region to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ErrorMessage message={error} onClose={() => setError('')} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Region <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Select Region --</option>
              {regions.map((region) => (
                <option key={region.region_id} value={region.region_id}>
                  {region.time_zone} (Tax: {region.tax_rate}%)
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? 'Selecting...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegionSelect;