// src/components/auth/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../common/ErrorMessage';
import Input from '../common/Input';
import Button from '../common/Button';

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);
    setLoading(false);

    if (result.success) {
      alert('Signup successful! Please login to continue.');
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join our casino platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorMessage message={error} onClose={() => setError('')} />

          <Input
            label="First Name"
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            placeholder="John"
          />

          <Input
            label="Last Name"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Doe"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@example.com"
          />

          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1234567890"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Minimum 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Re-enter password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;


// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../common/ErrorMessage';
import Input from '../common/Input';
import Button from '../common/Button';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      if (!result.user.tenant_id) {
        navigate('/select-region');
      } else if (!result.user.is_active) {
        navigate('/pending-verification');
      } else if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/games');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎰</div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorMessage message={error} onClose={() => setError('')} />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;


// src/components/auth/RegionSelect.jsx
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


// src/components/auth/KYCSubmit.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import ErrorMessage from '../common/ErrorMessage';
import Input from '../common/Input';
import Button from '../common/Button';
import { DOCUMENT_TYPES } from '../../utils/constants';

const KYCSubmit = () => {
  const [formData, setFormData] = useState({
    document_type: 'aadhar',
    document_number: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await authAPI.submitKYC(formData);
      navigate('/pending-verification');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-3xl font-bold text-gray-900">KYC Verification</h2>
          <p className="mt-2 text-gray-600">Submit your identity documents</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ErrorMessage message={error} onClose={() => setError('')} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document Type <span className="text-red-600">*</span>
            </label>
            <select
              name="document_type"
              value={formData.document_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={DOCUMENT_TYPES.AADHAR}>Aadhar Card</option>
              <option value={DOCUMENT_TYPES.PAN}>PAN Card</option>
            </select>
          </div>

          <Input
            label="Document Number"
            type="text"
            name="document_number"
            value={formData.document_number}
            onChange={handleChange}
            required
            placeholder={formData.document_type === 'aadhar' ? '1234-5678-9012' : 'ABCDE1234F'}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? 'Submitting...' : 'Submit KYC'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your documents will be reviewed within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KYCSubmit;


// src/components/auth/PendingVerification.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const PendingVerification = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="text-8xl mb-6 animate-pulse">⏳</div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Verification Pending
        </h2>
        
        <p className="text-gray-600 mb-6">
          Your KYC documents are under review. You'll receive an email once approved.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Processing Time:</strong> 24-48 hours
          </p>
          <p className="text-sm text-yellow-800 mt-2">
            You can check back later or wait for our email notification.
          </p>
        </div>

        <Link to="/login">
          <Button variant="secondary" size="lg" className="w-full">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PendingVerification;