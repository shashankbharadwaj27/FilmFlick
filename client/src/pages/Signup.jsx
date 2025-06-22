import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import { userSignup,clearErrors } from '../features/authSlice';

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const darkMode = useSelector(state=>state.darkMode.darkMode);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); 
    try {
        // Await the signup dispatch and navigate on success
        await dispatch(userSignup({ username, password, name })).unwrap();
        navigate('/');
        dispatch(clearErrors());
        setUsername(''); 
        setPassword('');
        setName('');
    } catch (err) {
        // Handle signup errors
        setError(err.message || 'Something went wrong');
    }
}


  return (
    <div className="min-h-screen flex justify-center bg-transparent transition duration-300 ease-in-out">
      <form
        id="signup-form"
        onSubmit={handleSubmit}
        className="w-full flex flex-col max-w-md bg-transparent rounded-lg p-8"
      >
        <h3 className={`text-2xl font-bold text-center mb-6 ${darkMode?'text-gray-100': 'text-gray-900'}`}>
          FilmFlick
        </h3>

        <label htmlFor="username" className={`block text-sm font-medium ${darkMode?'text-gray-300':'text-gray-700'}`}>
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

        <label htmlFor="password" className={`block mt-3 text-sm font-medium ${darkMode?'text-gray-300':'text-gray-700'}`}>
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

        <label htmlFor="name" className={`block text-sm mt-3 font-medium ${darkMode?'text-gray-300':'text-gray-700'}`}>
          Name
        </label>
        <input
          type="text"
          placeholder="Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 ${darkMode?'bg-gray-700 text-gray-100 border-gray-600':'bg-gray-100 text-gray-900 border-gray-300'} border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
        />

        <button
          type="submit"
          disabled={username.length < 8 || password.length < 8 || name.length === 0}
          className={`w-full mt-6 py-2 px-4 rounded-md text-white font-semibold 
            ${username.length < 8 || password.length < 8 || name.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out'}
          `}
        >
          Sign Up
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <p className={`block mt-4 text-sm font-medium ${darkMode?'text-gray-300':'text-gray-600'}`}>
          Already have an account?{' '}
          <Link to={`/user/login`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
