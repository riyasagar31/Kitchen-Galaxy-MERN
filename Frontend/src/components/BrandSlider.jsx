import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';

const BrandSlider = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const activeBrand = queryParams.get('brand');

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await api.get('/brands');
                setBrands(Array.isArray(res.data) ? res.data : (res.data.brands || []));
            } catch (error) {
                console.error('Failed to fetch brands for slider:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    const handleBrandClick = (brandName) => {
        navigate(`/home?brand=${encodeURIComponent(brandName)}`);
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center gap-6 py-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 animate-pulse">
                        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const displayBrands = brands.slice(0, 8);
    const hasMore = brands.length > 8;

    return (
        <div className="w-full mb-8 relative group">
            {/* Navigation Arrows - Only show if more than 8 brands */}
            {hasMore && (
                <>
                    <div className="absolute top-[56px] -translate-y-1/2 left-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full shadow-lg text-[#ff5252] hover:bg-white transition-all hover:scale-110 active:scale-95"
                        >
                            <FiChevronLeft size={24} />
                        </button>
                    </div>

                    <div className="absolute top-[56px] -translate-y-1/2 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full shadow-lg text-[#ff5252] hover:bg-white transition-all hover:scale-110 active:scale-95"
                        >
                            <FiChevronRight size={24} />
                        </button>
                    </div>
                </>
            )}

            <div
                ref={scrollContainerRef}
                className={`flex gap-6 py-4 px-2 scrollbar-hide custom-scrollbar ${hasMore ? 'overflow-x-auto' : 'justify-center overflow-x-hidden'
                    }`}
            >
                {/* Use displayBrands if they want only 8, or brands if they want all but centered */}
                {(hasMore ? brands : displayBrands).map((brand) => (
                    <button
                        key={brand._id}
                        onClick={() => handleBrandClick(brand.name)}
                        className={`flex-shrink-0 flex flex-col items-center gap-3 transition-all duration-300 group/item ${activeBrand === brand.name ? 'scale-110' : 'hover:scale-105'
                            }`}
                    >
                        {/* Circle Container for Logo */}
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 overflow-hidden bg-white shadow-sm ${activeBrand === brand.name
                            ? 'border-[#ff5252] shadow-lg ring-4 ring-red-50'
                            : 'border-transparent group-hover/item:border-gray-200 group-hover/item:shadow-md'
                            }`}>
                            {brand.logo ? (
                                <img
                                    src={`http://localhost:5000${brand.logo}`}
                                    alt={brand.name}
                                    className="w-full h-full object-contain p-3"
                                    onError={(e) => { e.target.src = 'https://placehold.co/100?text=' + brand.name.charAt(0); }}
                                />
                            ) : (
                                <span className={`text-2xl font-black ${activeBrand === brand.name ? 'text-[#ff5252]' : 'text-gray-400'}`}>
                                    {brand.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Brand Name */}
                        <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${activeBrand === brand.name ? 'text-[#ff5252]' : 'text-gray-500 group-hover/item:text-gray-900'
                            }`}>
                            {brand.name}
                        </span>
                    </button>
                ))}
            </div>

            <style jsx="true">{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar {
          scroll-behavior: smooth;
        }
      `}</style>
        </div>
    );
};

export default BrandSlider;
