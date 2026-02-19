import React from 'react';
import { FiTruck, FiTag, FiStar } from 'react-icons/fi';

const HomeFeatures = () => {
    const features = [
        {
            icon: <FiTruck className="text-[#ff5252] w-5 h-5" />,
            text: "Free Delivery",
            bgColor: "bg-pink-50"
        },
        {
            icon: <FiStar className="text-[#ff5252] w-5 h-5" />,
            text: "Quality Products",
            bgColor: "bg-pink-50"
        },
        {
            icon: <FiTag className="text-[#ff5252] w-5 h-5" />,
            text: "Lowest Prices",
            bgColor: "bg-pink-50"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 mb-12">
            <div className="bg-[#ff7b7b] border-y border-pink-100/50 py-4 flex flex-wrap justify-center md:justify-around items-center gap-6 md:gap-4 rounded-xl">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 group translate-y-0 hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                        <div className={`p-2.5 rounded-full ${feature.bgColor} group-hover:scale-110 transition-transform`}>
                            {feature.icon}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-700 whitespace-nowrap">
                            {feature.text}
                        </span>
                        {idx < features.length - 1 && (
                            <div className="hidden md:block h-6 w-[1px] bg-pink-100 ml-8" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeFeatures;
