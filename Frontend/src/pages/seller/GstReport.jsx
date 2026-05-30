import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiCalendar, FiDownload, FiInfo } from 'react-icons/fi';
import ExcelJS from 'exceljs';

const API_URL = 'http://localhost:5000/api';

export default function GstReport() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ totalSales: 0, totalOrders: 0, gstCollected: 0 });

    // Filter States
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [quickFilter, setQuickFilter] = useState('');

    const token = localStorage.getItem('token');
    const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    useEffect(() => {
        fetchReport();
    }, [headers, fromDate, toDate]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/seller-orders/report`, {
                headers,
                params: { fromDate, toDate }
            });
            setReportData(res.data.report);
            setSummary(res.data.summary);
        } catch (err) {
            console.error("Failed to fetch GST report", err);
            toast.error("Failed to load GST data");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickFilter = (days) => {
        setQuickFilter(days);
        const end = new Date();
        const start = new Date();
        if (days === 0) {
            start.setHours(0, 0, 0, 0);
        } else {
            start.setDate(start.getDate() - days);
        }
        setFromDate(start.toISOString().split('T')[0]);
        setToDate(end.toISOString().split('T')[0]);
    };

    const clearFilters = () => {
        setFromDate('');
        setToDate('');
        setQuickFilter('');
    };

    const exportToSystemReportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('GST Report');

            worksheet.columns = [
                { header: 'Order ID', key: 'orderId', width: 15 },
                { header: 'Product', key: 'product', width: 35 },
                { header: 'Base Price', key: 'basePrice', width: 15 },
                { header: 'GST %', key: 'gstRate', width: 10 },
                { header: 'GST Amount', key: 'gstAmount', width: 15 },
                { header: 'Date', key: 'date', width: 15 }
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };

            reportData.forEach(r => {
                worksheet.addRow({
                    orderId: `#${r.orderId.slice(-6).toUpperCase()}`,
                    product: r.productName,
                    basePrice: r.basePrice,
                    gstRate: r.gstRate,
                    gstAmount: r.gstAmount,
                    date: new Date(r.orderDate).toLocaleDateString()
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `gst_report_${new Date().toISOString().split('T')[0]}.xlsx`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('Excel Report downloaded successfully!');
        } catch (error) {
            console.error('Error generating Excel report:', error);
            toast.error('Failed to generate Excel report');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <button
                        onClick={() => navigate('/seller')}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#ff5252] font-black uppercase text-[10px] tracking-widest transition-all group mb-4"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Dashboard</span>
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tighter">GST Report</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={exportToSystemReportExcel}
                        className="flex items-center gap-2 border-2 border-[#ff5252] text-[#ff5252] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#ff5252] hover:text-white transition-all shadow-sm active:scale-95 bg-white"
                    >
                        <FiDownload /> Excel Report
                    </button>
                    <div className="bg-red-50 px-6 py-4 rounded-2xl border border-red-100 hidden sm:block">
                        <p className="text-[10px] font-bold text-[#ff5252] uppercase tracking-widest mb-1">Total GST Collected</p>
                        <div className="text-3xl font-black text-[#ff5252]">₹{summary.gstCollected.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Info Alert */}
            <div className="mb-10 p-5 bg-blue-50 border border-blue-100 rounded-[1.5rem] flex items-center gap-4 text-blue-700">
                <FiInfo className="flex-shrink-0" size={20} />
                <p className="text-xs font-bold leading-relaxed">
                    The GST report shows detailed tax breakdowns for all completed orders. Calculations are based on your specific product GST rates (12% or 18%).
                </p>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-10">
                <div className="flex flex-col lg:flex-row gap-8 items-end">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">From Date</label>
                            <div className="relative">
                                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-[#ff5252] outline-none transition-all"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">To Date</label>
                            <div className="relative">
                                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-[#ff5252] outline-none transition-all"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <button onClick={() => handleQuickFilter(0)} className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${quickFilter === 0 ? 'bg-[#ff5252] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Today</button>
                        <button onClick={() => handleQuickFilter(7)} className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${quickFilter === 7 ? 'bg-[#ff5252] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>7 Days</button>
                        <button onClick={() => handleQuickFilter(30)} className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${quickFilter === 30 ? 'bg-[#ff5252] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>30 Days</button>
                        <button onClick={clearFilters} className="px-4 py-3 bg-[#ff5252] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all">Clear</button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-[#f8f9fa]">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Price</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">GST Rate</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-[#ff5252]">GST Amount</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-gray-400 italic font-medium">Loading GST data...</td></tr>
                            ) : reportData.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-gray-400 italic font-medium">No tax data found for this period.</td></tr>
                            ) : reportData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6 font-black text-xs text-gray-400 tabular-nums">
                                        #{row.orderId.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-bold text-gray-900 leading-tight">{row.productName}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-bold text-gray-700">₹{row.basePrice.toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-black text-gray-500">{row.gstRate}%</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-base font-black text-[#ff5252]">₹{row.gstAmount.toLocaleString()}</div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-400 whitespace-nowrap">
                                        {new Date(row.orderDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
