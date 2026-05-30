import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ContactUs() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/contact', formData);
            if (res.data.success) {
                toast.success('Message sent successfully! We will get back to you soon.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (err) {
            console.error('Submission failed:', err);
            toast.error(err.response?.data?.error || 'Failed to send message');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen pt-20 pb-20">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 pt-12">
                <button
                    onClick={() => navigate('/home')}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#ff5252] font-bold transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>
            </div>

            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <span className="text-[#ff5252] font-black uppercase tracking-[0.3em] text-xs">Get in Touch</span>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mt-4 mb-6 tracking-tighter">Contact <span className="text-[#ff5252]">Us</span></h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    Have a question about our collections or need help outfitting your kitchen? Our team of experts is here to assist you.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Contact Information */}
                <div className="lg:col-span-5 space-y-10">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Our <span className="text-[#ff5252]">Information</span></h3>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6">
                                <div className="p-4 bg-red-50 rounded-2xl">
                                    <FiMapPin className="text-2xl text-[#ff5252]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1 uppercase text-xs tracking-widest text-gray-400">Visit Us</h4>
                                    <p className="text-gray-700 font-medium">21 darshanam tower, vasna road<br />Vadodara, 390007</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="p-4 bg-red-50 rounded-2xl">
                                    <FiPhone className="text-2xl text-[#ff5252]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1 uppercase text-xs tracking-widest text-gray-400">Call Us</h4>
                                    <p className="text-gray-700 font-medium">+91 923-4567-890<br />+91 728-6654-321</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="p-4 bg-red-50 rounded-2xl">
                                    <FiMail className="text-2xl text-[#ff5252]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1 uppercase text-xs tracking-widest text-gray-400">Email Us</h4>
                                    <p className="text-gray-700 font-medium whitespace-nowrap overflow-hidden text-clip text-sm">kitchengalaxy26@gmail.com<br />support@kitchengalaxy.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="p-4 bg-red-50 rounded-2xl">
                                    <FiClock className="text-2xl text-[#ff5252]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1 uppercase text-xs tracking-widest text-gray-400">Business Hours</h4>
                                    <p className="text-gray-700 font-medium text-sm">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat - Sun: 10:00 AM - 4:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-7">
                    <div className="bg-gray-50 p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl group">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Send a <span className="text-[#ff5252]">Message</span></h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter your name"
                                        className="w-full px-6 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#ff5252] font-medium placeholder:text-gray-300 transition-all focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter your email"
                                        className="w-full px-6 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#ff5252] font-medium placeholder:text-gray-300 transition-all focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="How can we help?"
                                    className="w-full px-6 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#ff5252] font-medium placeholder:text-gray-300 transition-all focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Share your culinary dreams or questions with us..."
                                    className="w-full px-6 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#ff5252] font-medium placeholder:text-gray-300 resize-none transition-all focus:bg-white"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-[#ff5252] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#ff5252] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg group-hover:shadow-[#ff5252]/20"
                            >
                                Launch Message <FiSend className="text-lg" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
