import React from 'react';
import { FiTarget, FiHeart, FiStar, FiAward, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="bg-white min-h-screen pt-12">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 pt-12 text-left">
                <button
                    onClick={() => navigate('/home')}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#ff5252] font-bold transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>
            </div>

            {/* Hero Section */}
            <div className="relative py-24 bg-gray-900 overflow-hidden mt-4">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="/hero-image3.webp"
                        alt="Kitchen Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                        About Kitchen <span className="text-[#ff5252]">Galaxy</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Exploring the culinary stars and outfitting the universe's best kitchens with premium tools and innovative designs.
                    </p>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Our <span className="text-[#ff5252]">Mission</span></h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            At Kitchen Galaxy, we believe that the kitchen is the heart of every home. Our mission is to empower home chefs and culinary enthusiasts with the finest kitchenware that blends exceptional performance with timeless elegance.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We scout the globe for innovative products that make cooking a joyous and creative experience, ensuring that every tool in your kitchen is a masterpiece of function and style.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                            <FiTarget className="text-4xl text-[#ff5252] mb-4" />
                            <h3 className="font-bold text-gray-900 mb-2">Precision</h3>
                            <p className="text-sm text-gray-500">Engineered for perfect results every time.</p>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                            <FiHeart className="text-4xl text-[#ff5252] mb-4" />
                            <h3 className="font-bold text-gray-900 mb-2">Passion</h3>
                            <p className="text-sm text-gray-500">Born from a love for the culinary arts.</p>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                            <FiStar className="text-4xl text-[#ff5252] mb-4" />
                            <h3 className="font-bold text-gray-900 mb-2">Quality</h3>
                            <p className="text-sm text-gray-500">Only the most durable materials used.</p>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                            <FiAward className="text-4xl text-[#ff5252] mb-4" />
                            <h3 className="font-bold text-gray-900 mb-2">Innovation</h3>
                            <p className="text-sm text-gray-500">Leading the way in modern kitchen tech.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Story Section */}
            <div className="bg-gray-50 py-20 pb-32">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">The Kitchen Galaxy <span className="text-[#ff5252]">Story</span></h2>
                    <div className="max-w-3xl mx-auto text-gray-600 text-lg leading-relaxed space-y-6 text-justify">
                        <p>
                            Founded in 2024, Kitchen Galaxy started as a small dream to simplify the complexities of modern kitchen management. We realized that while tools were becoming more advanced, they often lacked the soulful connection that makes cooking special.
                        </p>
                        <p>
                            Today, we are a leading destination for premium kitchen appliances, décor, and essentials. Our curated collections are handpicked to reflect our commitment to excellence and our desire to bring 'the stars' into your kitchen.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
