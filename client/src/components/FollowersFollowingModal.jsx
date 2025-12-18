import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

// Mock image for demo
const defaultImage = 'https://via.placeholder.com/150/2563eb/ffffff?text=User';

export default function FollowersFollowingModal({ isOpen, onClose, users, title, darkMode }) {
    if (!isOpen) return null;

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm px-4"
            onClick={handleBackdropClick}
        >
            <div 
                className={`${
                    darkMode 
                        ? 'bg-gray-800 border border-gray-700' 
                        : 'bg-white border border-gray-200'
                } max-w-md w-full rounded-2xl shadow-2xl overflow-hidden transform transition-all`}
            >
                {/* Modal Header */}
                <div className={`flex justify-between items-center px-6 py-4 border-b ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <h2 className={`text-xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        {title}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            darkMode 
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Users List */}
                <div className={`overflow-y-auto max-h-96 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    {users && users.length > 0 ? (
                        <div className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                            {users.map((user) => {
                                if (!user) return null;

                                return (
                                    <Link
                                        key={user.username}
                                        to = {`/${user.username}/profile`}
                                        className={`w-full flex items-center space-x-4 px-6 py-4 transition-all text-left ${
                                            darkMode 
                                                ? 'hover:bg-gray-700/50' 
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold truncate ${
                                                darkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {user.name || user.username}
                                            </p>
                                            <p className={`text-sm truncate ${
                                                darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                @{user.username}
                                            </p>
                                        </div>
                                        <svg 
                                            className={`w-5 h-5 flex-shrink-0 ${
                                                darkMode ? 'text-gray-600' : 'text-gray-400'
                                            }`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                                <svg 
                                    className={`w-8 h-8 ${
                                        darkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <p className={`text-center font-medium mb-1 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                No {title.toLowerCase()} yet
                            </p>
                            <p className={`text-sm text-center ${
                                darkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                                {title === 'Followers' 
                                    ? 'Users who follow will appear here' 
                                    : 'Users you follow will appear here'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer with count */}
                {users && users.length > 0 && (
                    <div className={`px-6 py-3 border-t ${
                        darkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                        <p className={`text-sm text-center ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {users.length} {users.length === 1 ? 'user' : 'users'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
