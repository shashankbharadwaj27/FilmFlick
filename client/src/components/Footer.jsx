import React from 'react';
import { useSelector } from 'react-redux';
import tmdbLight from '../assets/tmdb-light-mode.svg';
import tmdbDark from '../assets/tmdb-dark-mode.svg'

const Footer = () => {
  const darkMode = useSelector((state) => state.darkMode.darkMode);

  // Invert background
  const bgClass = darkMode ? 'bg-white text-black border-gray-300' : 'bg-black text-white border-gray-700';

  return (
    <footer className={`mt-16 border-t px-6 py-10 text-sm transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-center md:text-left">
        {/* Brand & Credits */}
        <div>
          <h2 className="font-bold text-xl mb-3">🎬 FilmFlick</h2>
          <p className="text-xs leading-relaxed">
            A social movie tracker app built for fans. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-3 gap-2 hover:underline"
          >{
                darkMode? 
                    <img src={tmdbLight} alt="TMDB Logo" className="h-5" /> :<img src={tmdbDark} alt="TMDB Logo" className="h-5" />
            }
            <span className="underline">Powered by TMDB</span>
          </a>
        </div>


        {/* Legal & Rights */}
        <div className="text-xs md:text-right space-y-2">
          <p>&copy; {new Date().getFullYear()} <span className="font-medium">FilmFlick</span>. All rights reserved.</p>
          <p className="text-gray-400">Made with ❤️ for movie lovers worldwide.</p>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
