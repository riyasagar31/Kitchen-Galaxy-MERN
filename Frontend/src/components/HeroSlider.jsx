import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slides = [
    {
        image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1400&q=80',
        title: 'Premium Kitchen Essentials',
        subtitle: 'Upgrade your culinary experience',
    },
    {
        image: 'https://images.unsplash.com/photo-1556911261-6bd341186b2f?q=80&w=2070&auto=format&fit=crop',
        title: 'Modern Cookware Sets',
        subtitle: 'Designed for the home chef',
    },
    {
        image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=2060&auto=format&fit=crop',
        title: 'Smart Home Appliances',
        subtitle: 'Efficiency meets elegance',
    }
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden group">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})` }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                        <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter animate-fadeIn">
                            {slide.title.split(' ')[0]} <span className="text-[#ff5252]">{slide.title.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-sm md:text-lg font-medium opacity-90 tracking-widest uppercase">
                            {slide.subtitle}
                        </p>
                    </div>
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-[#ff5252] w-6' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
