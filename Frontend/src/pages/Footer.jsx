import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiArrowUp, FiInfo, FiMessageSquare, FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Footer = () => {
  const primaryColor = "#ff5252";
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showEmailMenu, setShowEmailMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-white text-gray-700 py-8 px-6 border-t border-gray-300 text-base">

      {/* Back to Top Button */}
      {showTopBtn && (
        <button
          onClick={goToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full shadow-2xl transition-all duration-300 hover:-translate-y-2 z-50 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <FiArrowUp size={24} />
        </button>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 px-4">

        {/* SECTION 1: Visit Us, Call, Email */}
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-5 group">
            <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-sm border border-gray-50 group-hover:shadow-md transition-shadow">
              <FiMapPin size={26} style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">Visit Us</p>
              <p className="font-bold text-gray-800 text-base leading-snug">21 darshanam tower, vasna road, Vadodara</p>
            </div>
          </div>

          <div className="flex items-center gap-5 group">
            <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-sm border border-gray-50 group-hover:shadow-md transition-shadow">
              <FiPhone size={26} style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">Call Us</p>
              <p className="font-bold text-gray-800 text-base">+91 923-4567-890</p>
            </div>
          </div>

          <div className="flex items-center gap-5 group">
            <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-sm border border-gray-50 group-hover:shadow-md transition-shadow">
              <FiMail size={26} style={{ color: primaryColor }} />
            </div>
            <div className="relative">
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">Email Us</p>
              <button
                onClick={() => setShowEmailMenu(!showEmailMenu)}
                className="font-bold text-base hover:opacity-70 transition-opacity outline-none"
                style={{ color: primaryColor }}
              >
                kitchengalaxy26@gmail.com
              </button>
              {showEmailMenu && (
                <div className="absolute bottom-full left-0 mb-4 w-60 bg-white border border-gray-100 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-5 pb-2 border-b border-gray-50 mb-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Choose Your Service</p>
                  </div>
                  {[
                    { name: "Default App", url: "mailto:kitchengalaxy26@gmail.com" },
                    { name: "Gmail", url: "https://mail.google.com/mail/?view=cm&fs=1&to=kitchengalaxy26@gmail.com" },
                    { name: "Outlook", url: "https://outlook.office.com/mail/deeplink/compose?to=kitchengalaxy26@gmail.com" },
                    { name: "Yahoo Mail", url: "https://compose.mail.yahoo.com/?to=kitchengalaxy26@gmail.com" }
                  ].map((opt) => (
                    <a
                      key={opt.name}
                      href={opt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-red-50 hover:text-[#ff5252] transition-colors"
                    >
                      {opt.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Quick Links */}
        <div className="flex flex-col gap-8">
          <div className="pb-2 border-b border-gray-100 w-fit pr-10">
            <p className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Quick Navigation</p>
          </div>
          <ul className="flex flex-col gap-5">
            <li>
              <Link to="/" className="flex items-center gap-3 font-bold text-gray-600 hover:text-[#ff5252] transition-colors group">
                <FiHome className="text-gray-300 group-hover:text-[#ff5252] transition-colors" /> Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="flex items-center gap-3 font-bold text-gray-600 hover:text-[#ff5252] transition-colors group">
                <FiInfo className="text-gray-300 group-hover:text-[#ff5252] transition-colors" /> About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="flex items-center gap-3 font-bold text-gray-600 hover:text-[#ff5252] transition-colors group">
                <FiMessageSquare className="text-gray-300 group-hover:text-[#ff5252] transition-colors" /> Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* SECTION 3: Tagline & Branding */}
        <div className="flex flex-col justify-center items-start md:items-end md:text-right">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">
              Kitchen <span className="text-[#ff5252]">Galaxy</span>
            </h2>
            <div className="w-20 h-1 bg-[#ff5252] md:ml-auto"></div>
            <p className="text-xl  font-serif text-gray-400 leading-relaxed md:max-w-xs">
              "Exploring the culinary stars and outfitting the universe's best kitchens."
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="max-w-6xl mx-auto mt-10 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
        <p>© 2026 Kitchen Galaxy. All Rights Reserved.</p>
        <div className="flex gap-10 mt-6 md:mt-0">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;