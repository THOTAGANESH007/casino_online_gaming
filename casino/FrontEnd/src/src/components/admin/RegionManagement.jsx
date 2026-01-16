import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Button from '../common/Button';
import Input from '../common/Input';

const RegionManagement = () => {
  const [regions, setRegions] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tenant_id: '',
    time_zone: 'UTC',
    tax_rate: 0,
  });

  useEffect(() => {
    Promise.all([fetchRegions(), fetchTenants()]);
  }, []);

  const fetchRegions = async () => {
    try {
      const data = await adminAPI.getRegions();
      setRegions(data);
    } catch (err) {
      setError('Failed to fetch regions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await adminAPI.getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Failed to fetch tenants');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await adminAPI.createRegion({
        ...formData,
        tenant_id: parseInt(formData.tenant_id),
        tax_rate: parseFloat(formData.tax_rate),
      });
      setSuccess('Region created successfully');
      setShowForm(false);
      setFormData({ tenant_id: '', time_zone: 'UTC', tax_rate: 0 });
      fetchRegions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create region');
    }
  };

  if (loading) return <Loading message="Loading regions..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Region Management</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
        >
          {showForm ? 'Cancel' : '+ Create Region'}
        </Button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Region</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Tenant <span className="text-red-600">*</span></label>
              <select
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                required
                className="input"
              >
                <option value="">-- Select Tenant --</option>
                {tenants.map((tenant) => (
                  <option key={tenant.tenant_id} value={tenant.tenant_id}>
                    {tenant.tenant_name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Time Zone"
              type="text"
              value={formData.time_zone}
              onChange={(e) => setFormData({ ...formData, time_zone: e.target.value })}
              placeholder="e.g., UTC, Asia/Kolkata"
            />

            <Input
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              value={formData.tax_rate}
              onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
              placeholder="0.00"
            />

            <Button type="submit" variant="primary">
              Create Region
            </Button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Zone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regions.map((region) => (
              <tr key={region.region_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  #{region.region_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {region.tenant_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {region.time_zone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {region.tax_rate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegionManagement;