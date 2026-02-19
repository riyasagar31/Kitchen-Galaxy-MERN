import React, { useEffect, useState, Fragment, useMemo } from 'react';
import { FiEye, FiEdit2, FiTrash2, FiUserCheck, FiSlash, FiRotateCcw, FiArrowLeft, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import http from '../../api/http.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedViewId, setExpandedViewId] = useState(null);
  const [expandedEditId, setExpandedEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'customer', status: 'active' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const load = async () => {
    const qs = roleFilter ? `?role=${roleFilter}` : '';
    try {
      const res = await http.get(`/admin/users${qs}`);
      setUsers(res.data.users || []);
      setCurrentPage(1); // Reset to first page on new load
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load users');
    }
  };

  useEffect(() => { load(); }, [roleFilter]);

  // Search Logic (Client-side)
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openView = async (id) => {
    setExpandedEditId(null);
    try {
      await http.get(`/admin/users/${id}`);
      setExpandedViewId(prev => (prev === id ? null : id));
    } catch (err) { toast.error('Could not fetch details'); }
  };

  const openEdit = (user) => {
    setExpandedViewId(null);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'customer',
      status: user.status || 'active'
    });
    setExpandedEditId(prev => (prev === user._id ? null : user._id));
  };

  const saveEdit = async (id) => {
    try {
      await http.patch(`/admin/users/${id}`, editForm);
      toast.success('User updated');
      setExpandedEditId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await http.patch(`/admin/users/${id}/status`, { status: newStatus });
      toast.success(`User is now ${newStatus}`);
      load();
    } catch (err) { toast.error('Status update failed'); }
  };

  const handleDelete = async (id, role) => {
    if (role === 'admin') return;
    if (!confirm('Permanently delete this user?')) return;
    try {
      await http.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) { toast.error('Delete failed'); }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">

      {/* BACK BUTTON SECTION */}
            <div className="mb-6">
              <button 
                onClick={() => navigate('/admin')}
                 className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors" >
                  <FiArrowLeft size={20} />
                  <span>Back to Dashboard</span>
              </button>
            </div>

      {/* Header with Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-900">User Management</h3>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name..."
              className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Role:</label>
            <select
              className="block w-32 border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map(u => (
              <Fragment key={u._id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{u.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${u.status === 'active' ? 'bg-green-100 text-green-800' : 
                        u.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    {/* Unified Gray/Indigo Theme for Buttons */}
                    {u.status === 'pending' && (
                      <button className="text-[#ff5252] hover:text-[#e53935]" onClick={() => updateStatus(u._id, 'active')} title="Approve Seller">
                        <FiUserCheck size={18} />
                      </button>
                    )}

                    {u.role !== 'admin' && (
                      u.status === 'active' ? (
                        <button className="text-[#ff5252] hover:text-[#e53935]" onClick={() => updateStatus(u._id, 'inactive')} title="Deactivate User">
                          <FiSlash size={18} />
                        </button>
                      ) : (
                        <button className="text-[#ff5252] hover:text-[#e53935]" onClick={() => updateStatus(u._id, 'active')} title="Re-activate User">
                          <FiRotateCcw size={18} />
                        </button>
                      )
                    )}

                    <button className="text-[#ff5252] hover:text-[#e53935]" onClick={() => openView(u._id)}><FiEye size={18} /></button>
                    <button className="text-[#ff5252] hover:text-[#e53935] disabled:opacity-30" disabled={u.role === 'admin'} onClick={() => openEdit(u)}><FiEdit2 size={18} /></button>
                    <button className="text-[#ff5252] hover:text-[#e53935] disabled:opacity-30" disabled={u.role === 'admin'} onClick={() => handleDelete(u._id, u.role)}><FiTrash2 size={18} /></button>
                  </td>
                </tr>

                {/* Expanded Details/Edit sections remain same logic but styled slightly better */}
                {expandedViewId === u._id && (
                  <tr className="bg-indigo-50/30">
                    <td colSpan={4} className="px-6 py-4 text-sm text-gray-600 border-l-4 border-indigo-400">
                      <div className="grid grid-cols-2 gap-4">
                        <p><strong>Joined:</strong> {new Date(u.createdAt).toLocaleDateString()}</p>
                        <p><strong>Last Update:</strong> {new Date(u.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                  </tr>
                )}

                {expandedEditId === u._id && (
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-4 border-l-4 border-primary">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase">Name</span>
                          <input className="border p-2 rounded text-sm focus:ring-1 focus:ring-primary outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
                          <input className="border p-2 rounded text-sm focus:ring-1 focus:ring-primary outline-none" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase">Role</span>
                          <select className="border p-2 rounded text-sm outline-none" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => saveEdit(u._id)} className="bg-[#ff5252] text-white px-4 py-2 rounded text-sm hover:bg-[#e53935]">Save</button>
                          <button onClick={() => setExpandedEditId(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300">Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 border-t pt-4">
          <p className="text-sm text-gray-600">
            Showing {Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredUsers.length, currentPage * itemsPerPage)} of {filteredUsers.length} users
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              <FiChevronLeft />
            </button>
            <div className="flex items-center px-4 text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}