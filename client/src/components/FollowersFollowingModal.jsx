import React,{useCallback} from 'react';
import image from '../assets/image.png';
import {Link} from 'react-router-dom';

function FollowersFollowingModal({ isOpen, onClose, users, title, darkMode }) {
    if (!isOpen) return null;

    const handleProfileClick = useCallback((e) => {
        onClose();  
    }, [onClose]);
    

    return (
        <div className= "fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <div className={`${darkMode ? 'bg-[#2E3237] border border-gray-300 text-gray-300' : 'bg-[#AAABAD] text-gray-700 border border-gray-700'} max-w-lg w-full rounded-lg p-4`}>
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'} text-lg font-bold`}>
                        ✕
                    </button>
                </div>

                {/* Users List */}
                <div className="overflow-y-auto max-h-80">
                    {users.length > 0 ? (
                        users.map((user) => {
                            if (!user) return null; // Avoid rendering null users

                            return (
                                <Link
                                    to={`/${user.username}/profile`}
                                    key={user.username}
                                    onClick={handleProfileClick}
                                    className="flex items-center space-x-4 p-2 hover:opacity-75 dark:hover:bg-gray-700 rounded-md"
                                >
                                    <img
                                        src={user.pfp_url || image}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium">{user.username}</p>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <p className="text-gray-500">No users to display</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FollowersFollowingModal;
