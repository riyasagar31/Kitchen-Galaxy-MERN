const ads = [
    {
        image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=1984&auto=format&fit=crop',
        title: 'Smart Juicers',
        promo: 'Store wide 20% Off',
        color: 'bg-orange-50'
    },
    {
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop',
        title: 'Coffee Makers',
        promo: 'Limited Edition',
        color: 'bg-blue-50'
    },
    {
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop',
        title: 'Kitchen Knives',
        promo: 'Professional Grade',
        color: 'bg-gray-50'
    },
    {
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop',
        title: 'Cookware',
        promo: 'Best Sellers',
        color: 'bg-red-50'
    }
];

export default function BannerAds() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {ads.map((ad, index) => (
                <div
                    key={index}
                    className={`${ad.color} p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-lg transition-all`}
                >
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <p className="text-[#ff5252] text-[10px] font-black uppercase tracking-widest mb-1">{ad.promo}</p>
                    <h5 className="text-lg font-bold text-gray-900">{ad.title}</h5>
                    <button className="mt-4 text-xs font-black uppercase border-b-2 border-transparent hover:border-[#ff5252] transition-all">
                        Shop Now
                    </button>
                </div>
            ))}
        </div>
    );
}
