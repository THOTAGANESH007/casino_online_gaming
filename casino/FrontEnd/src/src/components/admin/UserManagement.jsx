// src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { formatDateTime } from '../../utils/helpers';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    is_active: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const cleanFilters = {};
      if (filters.is_active !== '') cleanFilters.is_active = filters.is_active === 'true';
      
      const data = await adminAPI.getUsers(cleanFilters);
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    if (!window.confirm('Activate this user?')) return;

    try {
      await adminAPI.activateUser(userId);
      setSuccess('User activated successfully');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to activate user');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;

    try {
      await adminAPI.deactivateUser(userId);
      setSuccess('User deactivated successfully');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to deactivate user');
    }
  };

  if (loading) return <Loading message="Loading users..." />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          value={filters.is_active}
          onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Users</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  #{user.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={user.role === 'admin' ? 'danger' : 'info'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.tenant_id || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={user.is_active ? 'success' : 'danger'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDateTime(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.is_active ? (
                    <Button
                      onClick={() => handleDeactivate(user.user_id)}
                      variant="danger"
                      size="sm"
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleActivate(user.user_id)}
                      variant="success"
                      size="sm"
                    >
                      Activate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;


// src/components/admin/TenantManagement.jsx
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


// src/components/admin/RegionManagement.jsx
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