import React, { useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link,useNavigate } from 'react-router-dom';
import { setDarkMode, setLightMode } from '../features/darkModeSlice';
import sunIcon from '../assets/sun-svgrepo-com.svg';
import moonIcon from '../assets/moon-stars-svgrepo-com.svg';
import {logoutUser} from '../features/authSlice';
import { resetSocialState } from '../features/socialSlice';
import { resetUserData } from '../features/userDataSlice';
import { resetReviewSlice } from '../features/reviewSlice';
import axios from 'axios';

function Header() {

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const dispatch = useDispatch();
    const darkMode = useSelector((state) => state.darkMode.darkMode);
    const user = useSelector((state) => state.auth);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const searchInputRef = useRef();
    const base = import.meta.env.VITE_API_BASE_URL

    const loggedInItems = [
        { name: 'Home', href: '/' },
        { name: 'Profile', href: `/profile `},
        { name: 'Journal', href: `/${user?.user?.username}/journal` },
    ];
    
    const loggedOutItems = [
        { name: 'Home', href: '/' },
        { name: 'Login', href: '/user/login' },
        { name: 'Signup', href: '/user/signup' },
    ];

    const menuItems = user.isAuthenticated ? loggedInItems : loggedOutItems;
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleThemeChange = (e) => {
        if (e.target.checked) {
            dispatch(setDarkMode());
        } else {
            dispatch(setLightMode());
        }
    };

    const closeMenus = () => {
        setIsMenuOpen(false);
    };

    async function handleLogout(e) {
        e.preventDefault();
        try {
          await dispatch(logoutUser()).unwrap();
          dispatch(resetSocialState());
          dispatch(resetReviewSlice());
          dispatch(resetUserData());
          navigate('/');
        } catch (err) {
          console.error(err);
        }
      }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && menuRef.current.contains(event.target)) {
                return; // If clicking inside menu, do nothing
            }

            closeMenus(); // Close menus if clicking outside
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const res = await axios.get(`${base}/movie/search/${searchQuery}`);
                console.log(res.data)
                setSearchResults(res.data.slice(0, 5)); // top 5 results
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
            }
        }, 500); // debounce delay

        return () => clearTimeout(timeoutId); // cleanup
    }, [searchQuery,base]);

    return (
        <div className={`relative w-full transition ease-in-out delay-350 ${darkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-black'}`}>
            <div className="mx-auto pt-4 flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
                {/* Logo Section */}
                <div className="inline-flex items-center space-x-2">
                    <span className="font-bold text-xl">FilmFlick</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:block">
                    <ul className="inline-flex space-x-8">
                        {menuItems.map((item) => (
                            <li key={item.name} className="flex self-baseline">
                                <Link
                                    to={item.href}
                                    onClick={closeMenus}
                                    className={`transition ease-in-out delay-350 mt-4 text-m rounded-2xl font-semibold 
                                        ${darkMode ? 'text-white' : 'text-gray-800 hover:text-gray-900'}`}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                        {
                            user.isAuthenticated && (
                                <li>
                                    <button 
                                        className={`transition ease-in-out delay-350 mt-4 text-m rounded-2xl font-semibold 
                                            ${darkMode ? 'text-white' : 'text-gray-800 hover:text-gray-900'}`} 
                                        onClick={handleLogout}
                                    >
                                        Logout 
                                    </button>
                                </li>
                            )
                        }
                        {/* Search Input and Dark Mode Toggle */}
                        <li className="relative mt-4"> {/* This wraps input and dropdown */}
                            <input
                                type="text"
                                className="rounded-md bg-white border-2 border-black px-3 py-1 text-sm font-semibold text-black w-42"
                                value={searchQuery}
                                placeholder="Search..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                                ref={searchInputRef}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }
                                }}
                            />
                            <button 
                                onClick={() => {
                                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="bg-black ml-2 rounded-md hover:bg-gray-700 text-white font-bold py-1 px-3"
                            >
                                Search
                            </button>

                            {searchQuery && searchResults.length > 0 && (
                                <ul className="absolute left-0 top-full mt-1 z-50 bg-white text-black shadow-md rounded w-64 max-h-64 overflow-y-auto">
                                {searchResults.map((result) => (
                                    <li
                                    key={result._id}
                                    onClick={() => {
                                        navigate(`/movie/${result.movie_id}`);
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                    >
                                    🎬 {result.title}
                                    </li>
                                ))}
                                <li
                                    onClick={() => {
                                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                    }}
                                    className="px-4 py-2 text-blue-600 hover:bg-gray-100 cursor-pointer border-t"
                                >
                                    Show more results for “{searchQuery}”
                                </li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <label className="relative inline-block w-10 h-6 mt-5 ml-5">
                                <input
                                    type="checkbox"
                                    className="opacity-0 w-0 h-0 peer"
                                    checked={darkMode}
                                    onChange={handleThemeChange}
                                />
                                <span className="absolute cursor-pointer inset-0 bg-gray-300 transition duration-300 rounded-full peer-checked:bg-yellow"></span>
                                <span className="absolute left-1 bottom-1 h-4 w-4 bg-transparent transition-transform duration-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-black flex items-center justify-center">
                                    <img
                                        src={darkMode ? moonIcon : sunIcon}
                                        alt="Toggle Icon"
                                        className="h-3 w-3"
                                    />
                                </span>
                            </label>
                        </li>
                    </ul>
                </div>

                {/* Mobile Menu */}
                <div className="lg:hidden">
                    <Menu onClick={toggleMenu} className="h-6 w-6 cursor-pointer" />
                </div>
                {isMenuOpen && (
                    <div className="absolute inset-x-0 top-0 z-50 origin-top-right transform p-2 transition lg:hidden" ref={menuRef}>
                        <div className={`divide-y-2 divide-gray-50 rounded-lg ${darkMode ? 'bg-[#1E1E1E] text-gray-300' : 'bg-white text-gray-900'}  ring-opacity-5`}>
                            <div className="px-5 pb-6 pt-5">
                                <div className="flex items-center justify-between">
                                    <div className="inline-flex items-center space-x-2">
                                        <span className={`font-bold text-xl ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>FilmFlick</span>
                                    </div>
                                    <div className="-mr-2">
                                        <button
                                            type="button"
                                            onClick={toggleMenu}
                                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                        >
                                            <span className="sr-only">Close menu</span>
                                            <X className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <nav className="grid gap-y-4">
                                        {menuItems.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                onClick={closeMenus}
                                                className={`-m-3 flex items-center rounded-md p-3 text-sm font-semibold hover:bg-gray-50`}
                                            >
                                                <span className={`ml-3 text-base font-medium ${darkMode ? 'text-gray-300 bg-[#1E1E1E]' : 'text-gray-800'}`}>{item.name}</span>
                                            </Link>
                                        ))}
                                        {
                                            user.isAuthenticated && (
                                                <li className='list-none inline-flex'>
                                                    <button 
                                                        className={`ml-3 text-base font-medium ${darkMode ? 'text-gray-300 bg-[#1E1E1E]' : 'text-gray-800'}`}
                                                        onClick={handleLogout}
                                                    >
                                                        Logout 
                                                    </button>
                                                </li>
                                            )
                                        }
                                        <li className='relative list-none'>
                                            <input
                                                type="text"
                                                className="mt-4 mr-2 rounded-md bg-white border-2 border-black px-3 py-1 text-sm font-semibold text-black"
                                                value = {searchQuery}
                                                placeholder="Search..."
                                                onChange={(e) =>setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                        setSearchQuery('');
                                                        setSearchResults([]);
                                                    }
                                                }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                    setSearchQuery('');
                                                    setSearchResults([]);
                                                }}
                                                className="bg-black ml-2 rounded-md hover:bg-gray-700 text-white font-bold py-1 px-3"
                                            >
                                                Search
                                            </button>
                                       
                                            {searchQuery && searchResults.length > 0 && (
                                                <ul className="absolute z-50 mt-1 bg-white text-black shadow-md rounded w-[250px] max-h-64 overflow-y-auto">
                                                    {searchResults.map((result) => (
                                                    <li
                                                        key={result._id}
                                                        onClick={() => {
                                                        navigate(`/movie/${result.movie_id}`);
                                                        setSearchQuery('');
                                                        setSearchResults([]);
                                                        }}
                                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                    >
                                                        🎬 {result.title}
                                                    </li>
                                                    ))}
                                                    <li
                                                    onClick={() => {
                                                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                        setSearchQuery('');
                                                        setSearchResults([]);
                                                    }}
                                                    className="px-4 py-2 text-blue-600 hover:bg-gray-100 cursor-pointer border-t"
                                                    >
                                                    Show more results for “{searchQuery}”
                                                    </li>
                                                </ul>
                                                )}
                                        </li>
                                            <label className="relative inline-block w-10 h-6 mt-6 ml-2.5">
                                                <input
                                                    type="checkbox"
                                                    className="opacity-0 w-0 h-0 peer"
                                                    checked={darkMode}
                                                    onChange={handleThemeChange}
                                                />
                                                <span className="absolute cursor-pointer inset-0 bg-gray-300 transition duration-300 rounded-full peer-checked:bg-yellow"></span>
                                                <span className="absolute left-1 bottom-1 h-4 w-4 bg-transparent transition-transform duration-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-black flex items-center justify-center">
                                                    <img
                                                        src={darkMode ? moonIcon : sunIcon}
                                                        alt="Toggle Icon"
                                                        className="h-3 w-3"
                                                    />
                                                </span>
                                            </label>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
