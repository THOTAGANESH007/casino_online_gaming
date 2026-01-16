import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { formatDateTime } from '../../utils/helpers';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tenant_name: '',
    default_timezone: 'UTC',
    default_currency: 1,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getTenants();
      setTenants(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await adminAPI.createTenant(formData);
      setSuccess('Tenant created successfully');
      setShowForm(false);
      setFormData({ tenant_name: '', default_timezone: 'UTC', default_currency: 1 });
      fetchTenants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create tenant');
    }
  };

  const toggleStatus = async (tenantId, currentStatus) => {
    try {
      await adminAPI.updateTenantStatus(tenantId, !currentStatus);
      setSuccess('Tenant status updated');
      fetchTenants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update tenant status');
    }
  };

  if (loading) return <Loading message="Loading tenants..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tenant Management</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
        >
          {showForm ? 'Cancel' : '+ Create Tenant'}
        </Button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Tenant</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tenant Name"
              type="text"
              value={formData.tenant_name}
              onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
              required
              placeholder="Enter tenant name"
            />

            <Input
              label="Default Timezone"
              type="text"
              value={formData.default_timezone}
              onChange={(e) => setFormData({ ...formData, default_timezone: e.target.value })}
              placeholder="e.g., UTC, Asia/Kolkata"
            />

            <Button type="submit" variant="primary">
              Create Tenant
            </Button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timezone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant.tenant_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  #{tenant.tenant_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  {tenant.tenant_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {tenant.default_timezone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={tenant.status ? 'success' : 'danger'}>
                    {tenant.status ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDateTime(tenant.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button
                    onClick={() => toggleStatus(tenant.tenant_id, tenant.status)}
                    variant={tenant.status ? 'danger' : 'success'}
                    size="sm"
                  >
                    {tenant.status ? 'Disable' : 'Enable'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantManagement;