import React, { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import {loginUser,clearErrors} from '../features/authSlice'
import {fetchUserFavourites,getUserReviews} from '../features/userDataSlice';
import {fetchFollowers,fetchFollowing,fetchFollowingActivity} from '../features/socialSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const {error,isLoading} = useSelector(state=>state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const darkMode = useSelector(state=>state.darkMode.darkMode);
  const following = useSelector(state=>state.social.following);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await dispatch(loginUser({ username, password })).unwrap();

      if (!user || !user?.username) {
        throw new Error('Login succeeded but no user data returned');
      }
      const followingList = await dispatch(fetchFollowing()).unwrap();

      await dispatch(fetchFollowingActivity({ following: followingList })).unwrap();

      dispatch(clearErrors());
      navigate('/');
    } catch (err) {
      console.error('Error during login or data fetching',err);
    }
  };


  return (
      isLoading ? (
        <Loader/>
      ):(
        <div className="min-h-screen flex flex-col  items-center bg-transparent transition duration-300 ease-in-out">
          <form
            id="login-form"
            onSubmit={handleSubmit}
            className="w-full max-w-md p-8  rounded-lg"
          >
            <h3 className= {`text-2xl font-bold text-center ${darkMode?'text-gray-100':'text-gray-900'} mb-6`}>
              FilmFlick
            </h3>

            <label
              htmlFor="username"
              className={`block text-sm font-medium ${darkMode?'text-gray-300':'text-gray-700'}`}
            >
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 ${darkMode?'bg-gray-700 text-gray-100 border-gray-600':'bg-gray-100 text-gray-900 border-gray-300'} border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />

            <label
              htmlFor="password"
              className={`block mt-4 text-sm font-medium ${darkMode?'text-gray-300':'text-gray-700'}`}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 ${darkMode?'bg-gray-700 text-gray-100 border-gray-600':'bg-gray-100 text-gray-900 border-gray-300'} border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />

            <button
              type="submit"
              disabled={password.length < 8}
              className={`w-full mt-6 py-2 px-4 rounded-md text-white font-semibold 
                ${password.length < 8 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out'}
              `}
            >
              Log In
            </button>

            {error && (
              <p className="mt-4 text-red-500 text-sm">{error}</p>
            )}

            <p className={`block mt-4 text-sm font-medium ${darkMode?'text-gray-300':'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to={`/user/signup`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Signup
              </Link>
            </p>
          </form>
        </div>
      )
  );
}
