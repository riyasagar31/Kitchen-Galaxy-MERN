import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiFilter, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function AdminCategoryRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [comment, setComment] = useState("");
    const [selectedReq, setSelectedReq] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/category-requests?status=${filter}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRequests(res.data);
        } catch (err) {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await axios.patch(`${API_URL}/category-requests/${id}/status`,
                { status, adminComment: comment },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success(`Request ${status} successfully`);
            setComment("");
            setSelectedReq(null);
            fetchRequests();
        } catch (err) {
            toast.error("Action failed");
        }
    };

    if (loading && requests.length === 0) return <div className="p-10 text-center">Loading requests...</div>;

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto mt-24">

        {/* BACK BUTTON SECTION */}
                <div className="mb-6">
                  <button 
                    onClick={() => navigate('/admin')}
                     className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors" >
                      <FiArrowLeft size={20} />
                      <span>Back to Dashboard</span>
                  </button>
                </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Seller Requests</h1>
                    <p className="text-gray-500 font-medium">Manage suggestions for new categories and brands</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    {['pending', 'approved', 'rejected', ''].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all uppercase tracking-widest ${filter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Seller / Store</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Request Type</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Proposed Name</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium italic">No requests found in this category.</td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-gray-900">{req.seller?.name}</div>
                                        <div className="text-xs text-gray-400">{req.seller?.shopName || 'Independent Seller'}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${req.type === 'category' ? 'bg-blue-50 text-blue-500' : req.type === 'brand' ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500'}`}>
                                            {req.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-gray-800">{req.name}</div>
                                        {req.parentCategory && <div className="text-[10px] text-gray-400 uppercase font-black">Under: {req.parentCategory.name}</div>}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${req.status === 'approved' ? 'bg-green-100 text-green-600' : req.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        {req.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAction(req._id, 'approved')}
                                                    className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                                                    title="Approve & Create"
                                                >
                                                    <FiCheck size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedReq(req)}
                                                    className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                                                    title="Reject"
                                                >
                                                    <FiX size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-300 font-bold italic">No further actions</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reject Modal */}
            {selectedReq && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6 text-red-500">
                            <FiX size={32} className="p-2 bg-red-50 rounded-xl" />
                            <h3 className="text-2xl font-black text-gray-900">Reject Request</h3>
                        </div>
                        <p className="text-gray-500 font-medium mb-8">Explain the reason for rejecting <span className="font-black text-gray-900 italic">"{selectedReq.name}"</span>. This will be visible to the seller.</p>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Admin Comment</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="e.g., We already have a similar category..."
                                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all min-h-[120px] font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedReq(null)}
                                className="py-4 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(selectedReq._id, 'rejected')}
                                className="py-4 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
