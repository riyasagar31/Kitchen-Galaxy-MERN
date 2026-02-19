import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiTruck, FiClock, FiUsers, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import http from '../../api/http'; 
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminSellers() {
  const navigate = useNavigate();
  const [allSellers, setAllSellers] = useState([]); 
  const [displaySellers, setDisplaySellers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); 
  const [counts, setCounts] = useState({ pending: 0, active: 0, inactive: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await http.get(`/admin/users?role=seller`);
      const users = res.data.users || [];
      setAllSellers(users);
      updateCounts(users);
    } catch (err) {
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const updateCounts = (users) => {
    const list = users || [];
    const newCounts = {
      pending: list.filter(s => s.status === 'pending').length,
      active: list.filter(s => s.status === 'active').length,
      inactive: list.filter(s => s.status === 'inactive').length,
    };
    setCounts(newCounts);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = (allSellers || []).filter(s => s.status === filter);
    setDisplaySellers(filtered);
  }, [filter, allSellers]);

  const handleStatusUpdate = async (id, newStatus) => {
    const sanitizedStatus = newStatus.toLowerCase();
    console.log(`--- [Frontend] Sending update for ID: ${id} to Status: ${sanitizedStatus} ---`);
    
    try {
      const res = await http.patch(`/admin/users/${id}/status`, { status: sanitizedStatus });
      
      if (res.data) {
        if (res.data.users && res.data.counts) {
            setAllSellers(res.data.users);
            setCounts(res.data.counts);
        } else {
            setAllSellers(prev => {
                const updatedList = prev.map(s => s._id === id ? { ...s, status: sanitizedStatus } : s);
                updateCounts(updatedList);
                return updatedList;
            });
        }
        
        const successMsg = sanitizedStatus === 'active' 
            ? 'Seller Approved & Approval Email Sent!' 
            : `Seller status updated to ${sanitizedStatus}`;
        toast.success(successMsg);
      }
    } catch (err) {
      console.error("--- [Frontend Error] ---", err);
      const errorMsg = err.response?.data?.message || 'Update failed. Check Server logs.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
       
      {/* BACK BUTTON SECTION */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin')}
             className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors" >
              <FiArrowLeft size={20} />
              <span>Back to Dashboard</span>
          </button>
        </div>
       
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiTruck className="text-[#ff5252]" /> Seller Management
        </h1>
        
        <div className="flex bg-white rounded-full p-1 shadow-sm border border-gray-200">
          {['pending', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-all duration-300 ${
                filter === s ? 'bg-[#ff5252] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-8 border-yellow-400 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Approval</p>
            <h3 className="text-3xl font-black text-gray-800">{counts?.pending || 0}</h3>
          </div>
          <FiClock className="text-yellow-400 text-4xl" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-8 border-[#ff5252] flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Sellers</p>
            <h3 className="text-3xl font-black text-gray-800">{counts?.active || 0}</h3>
          </div>
          <FiCheckCircle className="text-[#ff5252] text-4xl" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-8 border-gray-400 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Inactive Sellers</p>
            <h3 className="text-3xl font-black text-gray-800">{counts?.inactive || 0}</h3>
          </div>
          <FiUsers className="text-gray-400 text-4xl" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700 capitalize">{filter} Sellers List</h2>
          <button onClick={fetchData} className="text-[#ff5252] hover:rotate-180 transition-transform duration-500">
            <FiRefreshCw />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Seller Info</th>
                <th className="px-8 py-4">Email Address</th>
                <th className="px-8 py-4">Current Status</th>
                <th className="px-8 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center text-gray-400 animate-pulse font-medium">Synchronizing Data...</td></tr>
              ) : displaySellers.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-gray-400 font-medium">No {filter} sellers found.</td></tr>
              ) : (
                displaySellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-bold text-gray-800">{seller.name}</td>
                    <td className="px-8 py-5 text-gray-500">{seller.email}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-full border-2 ${
                        seller.status === 'active' ? 'border-green-500 text-green-600' : 
                        seller.status === 'pending' ? 'border-yellow-500 text-yellow-600' : 
                        'border-red-500 text-red-600'
                      }`}>
                        {seller.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 flex justify-center gap-3">
                      {seller.status === 'pending' && (
                        <>
                          <button 
                            title="Approve Seller"
                            onClick={() => handleStatusUpdate(seller._id, 'active')} 
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiCheckCircle size={18} />
                          </button>
                          <button 
                            title="Deactivate Seller"
                            onClick={() => handleStatusUpdate(seller._id, 'inactive')} 
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiXCircle size={18} />
                          </button>
                        </>
                      )}
                      {seller.status === 'active' && (
                        <button 
                          onClick={() => handleStatusUpdate(seller._id, 'inactive')} 
                          className="px-4 py-1.5 text-xs font-bold text-red-500 border-2 border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          Deactivate
                        </button>
                      )}
                      {seller.status === 'inactive' && (
                        <button 
                          onClick={() => handleStatusUpdate(seller._id, 'active')} 
                          className="px-4 py-1.5 text-xs font-bold text-green-500 border-2 border-green-500 rounded-lg hover:bg-green-600 hover:text-white flex items-center gap-2 transition-all"
                        >
                          <FiRefreshCw /> Re-activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}