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

    if (loading && requests.length === 0) return <div className="p-10 text-center font-medium text-gray-400">Loading requests...</div>;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">

            {/* BACK BUTTON SECTION */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#ff5252] font-semibold uppercase text-[10px] tracking-wide transition-all group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Seller Requests</h1>
                    <p className="text-xs text-gray-400 font-medium mt-1">Manage suggestions for new categories and brands</p>
                </div>

                <div className="flex bg-gray-50 border border-gray-100 p-1 rounded-xl">
                    {['pending', 'approved', 'rejected', ''].map((s) => (
                        <button
                            key={s || 'all'}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${filter === s ? "bg-white text-[#ff5252] shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <table className="w-full text-left">
                    <thead className="bg-[#fbfcfd] border-b border-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Seller / Store</th>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Type</th>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Proposed Name</th>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                            <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center text-gray-400 text-sm">No requests found in this category.</td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-semibold text-gray-900 leading-none">{req.seller?.name || 'Guest Seller'}</div>
                                        <div className="text-[10px] text-gray-400 font-medium mt-1">{req.seller?.shopName || 'Independent Seller'}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-tight 
                                            ${req.type === 'category' ? 'bg-blue-50 text-blue-500' :
                                                req.type === 'brand' ? 'bg-purple-50 text-purple-500' :
                                                    'bg-orange-50 text-orange-500'}`}>
                                            {req.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-semibold text-gray-800 leading-none">{req.name}</div>
                                        {req.parentCategory && <div className="text-[9px] text-gray-400 font-bold mt-1 uppercase">Under: {req.parentCategory.name}</div>}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-tight
                                            ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                req.status === 'rejected' ? 'bg-red-100 text-[#ff5252]' :
                                                    'bg-yellow-100 text-yellow-700'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {req.status === 'pending' ? (
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleAction(req._id, 'approved')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Approve & Create"
                                                >
                                                    <FiCheck size={20} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedReq(req)}
                                                    className="p-2 text-[#ff5252] hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Reject"
                                                >
                                                    <FiX size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-300 font-semibold uppercase">Closed</span>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4 text-[#ff5252]">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Reject Request</h3>
                        </div>
                        <p className="text-sm text-gray-400 font-medium mb-6">Explain the reason for rejecting <span className="text-gray-900 font-bold">"{selectedReq.name}"</span>.</p>

                        <div className="mb-6">
                            <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Admin Comment</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="e.g., Category already exists..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-[#ff5252] outline-none transition-all min-h-[100px] text-sm font-medium"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setSelectedReq(null)}
                                className="order-2 sm:order-1 flex-1 py-3 rounded-xl font-semibold text-gray-400 hover:bg-gray-50 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(selectedReq._id, 'rejected')}
                                className="order-1 sm:order-2 flex-1 py-3 bg-[#ff5252] text-white rounded-xl font-bold uppercase text-[11px] tracking-wide hover:bg-red-600 transition-all shadow-lg active:scale-95"
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
