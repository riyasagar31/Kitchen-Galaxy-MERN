import { useNavigate } from 'react-router-dom';

const brands = [
    { name: 'Bajaj', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Bajaj_Group_logo.svg/1200px-Bajaj_Group_logo.svg.png' },
    { name: 'Prestige', logo: 'https://logos-world.net/wp-content/uploads/2021/08/Prestige-Logo.png' },
    { name: 'Pigeon', logo: 'https://images.jdmagicbox.com/comp/bangalore/b7/080pxx80.xx80.111231143801.m7b7/catalogue/stove-kraft-pigeon-peenya-2nd-stage-bangalore-home-appliance-manufacturers-u65g0.jpg' },
    { name: 'Butterfly', logo: 'https://butterflyindia.com/wp-content/uploads/2023/04/butterfly-logo-1.png' }
];

const priceFilters = [
    { label: 'Under ₹5,000', min: 0, max: 5000 },
    { label: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
    { label: '₹15,000 - ₹30,000', min: 15000, max: 30000 },
    { label: 'Above ₹30,000', min: 30000, max: 100000 },
];

export default function HomeTripartite() {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* 1. Trusted Brands */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#ff5252] rounded-full"></span>
                    Trusted Brands
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    {brands.map((brand) => (
                        <div
                            key={brand.name}
                            onClick={() => navigate(`/?brand=${brand.name}`)}
                            className="flex items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors cursor-pointer group"
                        >
                            <span className="text-sm font-bold text-gray-500 group-hover:text-[#ff5252]">{brand.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Price Filter */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#ff5252] rounded-full"></span>
                    Quick Price Filter
                </h4>
                <div className="space-y-3">
                    {priceFilters.map((filter) => (
                        <button
                            key={filter.label}
                            onClick={() => navigate(`/?minPrice=${filter.min}&maxPrice=${filter.max}`)}
                            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all font-bold text-gray-700"
                        >
                            {filter.label}
                            <span className="text-xs opacity-50 font-black">→</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Get Deals */}
            <div className="bg-[#ff5252] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-2xl font-black mb-2">Mega Deals!</h4>
                    <p className="text-white/80 text-sm mb-6">Join our newsletter to get exclusive deals directly in your inbox.</p>
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl placeholder:text-white/50 text-white outline-none focus:bg-white/20 transition-all"
                        />
                        <button className="w-full bg-white text-[#ff5252] font-black p-4 rounded-2xl hover:bg-gray-100 transition-colors uppercase tracking-wider">
                            Get My Deal
                        </button>
                    </div>
                </div>
                {/* Decorative circle */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
