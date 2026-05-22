import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../services/adminService';
import Sidebar from '../components/common/Sidebar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    adminService.getUsers(roleFilter ? { role: roleFilter } : {})
      .then(({ data }) => { setUsers(data.data.users); setTotal(data.data.total); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleToggle = async (id) => {
    try {
      const { data } = await adminService.toggleStatus(id);
      toast.success(data.message);
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await adminService.updateRole(id, role);
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold"><i className="bi bi-people me-2 text-primary"></i>Users <span className="badge bg-secondary ms-2">{total}</span></h4>
          <select className="form-select w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="organiser">Organiser</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-5"><span className="spinner-border text-primary" /></div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="fw-semibold">{u.fullName}</td>
                      <td className="text-muted small">{u.email}</td>
                      <td>
                        <select className="form-select form-select-sm w-auto" value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                          <option value="customer">Customer</option>
                          <option value="organiser">Organiser</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-muted small">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggle(u._id)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
