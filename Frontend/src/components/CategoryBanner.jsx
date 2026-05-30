import React, { useState, useEffect } from 'react';

const bannerGroups = [
  {
    id: 1,
    images: [
      { url: './add_banner/upgrade_kitchen.png', title: 'Offers on Essentials' },
      { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop', title: 'Chef Essentials' },
      { url: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=2070&auto=format&fit=crop', title: 'Kitchen Gadgets' },
      { url: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=1984&auto=format&fit=crop', title: 'Smart Appliances' }
    ]
  },
  {
    id: 2,
    images: [
      { url: './add_banner/Coffee.jpg', title: 'Coffee Culture' },
      { url: './add_banner/upgrade_kitchen.png', title: 'Modern Baking' },
      { url: './add_banner/Dinnerset.jpg', title: 'Table Setting' },
      { url: './add_banner/Fruit-Juices.jpg', title: 'Fresh Juicing' }
    ]
  }
];

export default function CategoryBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerGroups.length);
    }, 5000); // Auto-change every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const currentGroup = bannerGroups[currentIndex];

  return (
    <div className="mt-16 mb-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Special <span className="text-[#ff5252]">Offers</span></h3>
        <div className="h-[1px] flex-1 bg-gray-100 mx-6 hidden md:block"></div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {currentGroup.images.map((img, idx) => (
          <div 
            key={idx} 
            className="group relative h-[250px] overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <img 
              src={img.url} 
              alt={img.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
            <div className="absolute bottom-5 left-5 text-white">
              {/* <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5252] mb-1">Kitchen Galaxy</p> */}
              <h4 className="font-bold text-lg leading-tight">{img.title}</h4>
            </div>
            {/* <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-tighter"> */}
              {/* New Arrival */}
            {/* </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}
