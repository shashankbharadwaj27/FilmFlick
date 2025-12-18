import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '../features/authSlice';

// Skeleton Components
const FormSkeleton = ({ darkMode }) => (
  <div className="w-full flex flex-col max-w-md bg-transparent rounded-lg p-8 animate-pulse">
    {/* Title skeleton */}
    <div className={`h-8 w-48 mx-auto mb-6 rounded ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    }`}></div>

    {/* Input field skeletons */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="mb-4">
        <div className={`h-4 w-20 mb-2 rounded ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}></div>
        <div className={`h-10 w-full rounded ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}></div>
      </div>
    ))}

    {/* Button skeleton */}
    <div className={`h-10 w-full mt-6 rounded ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    }`}></div>

    {/* Link skeleton */}
    <div className={`h-4 w-48 mt-4 rounded ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    }`}></div>
  </div>
);

// Loading overlay for async operations
const LoadingOverlay = ({ darkMode, message = 'Creating your account...' }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className={`p-6 rounded-lg shadow-xl ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } flex flex-col items-center gap-4`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
      <p className={`text-sm font-medium ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {message}
      </p>
    </div>
  </div>
);

// Memoized Input Field Component
const InputField = React.memo(({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  darkMode,
  disabled,
  required,
  minLength,
  error
}) => (
  <div className="mb-4">
    <label 
      htmlFor={id} 
      className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
    >
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      minLength={minLength}
      className={`mt-1 block w-full px-3 py-2 ${
        darkMode 
          ? 'bg-gray-700 text-gray-100 border-gray-600' 
          : 'bg-gray-100 text-gray-900 border-gray-300'
      } border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
        error ? 'border-red-500 focus:ring-red-500' : ''
      }`}
    />
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
));
InputField.displayName = 'InputField';

// Memoized Submit Button
const SubmitButton = React.memo(({ isLoading, isDisabled, darkMode }) => (
  <button
    type="submit"
    disabled={isDisabled || isLoading}
    className={`w-full mt-6 py-2 px-4 rounded-md text-white font-semibold transition-all duration-300
      ${isDisabled || isLoading
        ? 'bg-gray-400 cursor-not-allowed opacity-60'
        : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'}
    `}
  >
    {isLoading ? (
      <span className="flex items-center justify-center gap-2">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Signing up...
      </span>
    ) : (
      'Sign Up'
    )}
  </button>
));
SubmitButton.displayName = 'SubmitButton';

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFormReady, setIsFormReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redux state
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.darkMode.darkMode);

  // Simulate form loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Clear field errors after 5 seconds
  useEffect(() => {
    if (error || Object.keys(fieldErrors).length) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        setFieldErrors({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, fieldErrors, dispatch]);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    return errors;
  }, [username, password, name]);

  // Form validation
  const isFormValid = useMemo(() => {
    return username.trim().length >= 3 && 
           password.length >= 6 && 
           name.trim().length >= 2;
  }, [username, password, name]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setIsProcessing(true);

    try {
      await dispatch(signupUser({ username, password, name })).unwrap();
      
      // Clear form on success
      setUsername('');
      setPassword('');
      setName('');
      
      // Navigate to login with success message
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/user/login', { 
          state: { message: 'Signup successful! Please login with your credentials.' }
        });
      }, 500);
    } catch (err) {
      console.error('Signup failed:', err);
      setIsProcessing(false);
      setFieldErrors({ form: err.message || 'Signup failed' });
    }
  }, [username, password, name, dispatch, navigate, validateForm]);

  // Handle input changes with error clearing
  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value);
    if (fieldErrors.username) {
      setFieldErrors(prev => ({ ...prev, username: '' }));
    }
  }, [fieldErrors.username]);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
  }, [fieldErrors.password]);

  const handleNameChange = useCallback((e) => {
    setName(e.target.value);
    if (fieldErrors.name) {
      setFieldErrors(prev => ({ ...prev, name: '' }));
    }
  }, [fieldErrors.name]);

  return (
    <>
      <div className="min-h-screen flex justify-center bg-transparent transition duration-300 ease-in-out">
        {!isFormReady ? (
          <FormSkeleton darkMode={darkMode} />
        ) : (
          <form
            id="signup-form"
            onSubmit={handleSubmit}
            className={`w-full flex flex-col max-w-md rounded-lg p-8 transition-all duration-300 ${darkMode ? 'bg-[#1E1E1E]' : 'bg-white'} ${
              isProcessing ? 'opacity-50 pointer-events-none' : ''
            } `}
          >
            <h3 className={`text-2xl font-bold text-center mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              FilmFlick
            </h3>

            {/* Global Error Message */}
            {(error || fieldErrors.form) && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md animate-[fadeIn_0.3s_ease-in-out]">
                <p className="text-sm">{error || fieldErrors.form}</p>
              </div>
            )}

            {/* Username Input */}
            <InputField
              label="Username"
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Username"
              darkMode={darkMode}
              disabled={isProcessing}
              required
              error={fieldErrors.username}
            />

            {/* Password Input */}
            <InputField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Password (minimum 8 characters)"
              darkMode={darkMode}
              disabled={isProcessing}
              required
              minLength={6}
              error={fieldErrors.password}
            />

            {/* Name Input */}
            <InputField
              label="Name"
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Name"
              darkMode={darkMode}
              disabled={isProcessing}
              required
              error={fieldErrors.name}
            />

            {/* Submit Button */}
            <SubmitButton
              isLoading={isProcessing}
              isDisabled={!isFormValid}
              darkMode={darkMode}
            />

            {/* Login Link */}
            <p className={`block mt-4 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link 
                to="/user/login" 
                className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} hover:underline transition-colors`}
              >
                Log In
              </Link>
            </p>
          </form>
        )}
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <LoadingOverlay darkMode={darkMode} message="Creating your account..." />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}