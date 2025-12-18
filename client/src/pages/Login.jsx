import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import { loginUser, clearError } from '../features/authSlice';
import { fetchFollowing, fetchFollowingActivity } from '../features/socialSlice';

// Skeleton Components
const FormSkeleton = ({ darkMode }) => (
  <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${
    darkMode ? 'bg-gray-800' : 'bg-white'
  } animate-pulse`}>
    {/* Title skeleton */}
    <div className={`h-10 w-48 mx-auto mb-8 rounded ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    }`}></div>

    {/* Input field skeletons */}
    {[1, 2].map((i) => (
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
    <div className={`h-4 w-40 mt-4 rounded ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    }`}></div>
  </div>
);

// Loading overlay for async operations
const LoadingOverlay = ({ darkMode, message = 'Processing...' }) => (
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

// Memoized input field component
const InputField = React.memo(({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  darkMode,
  error,
  disabled 
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
      aria-invalid={!!error}
      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
        darkMode
          ? 'bg-gray-700 text-gray-100 border-gray-600 disabled:bg-gray-800'
          : 'bg-gray-100 text-gray-900 border-gray-300 disabled:bg-gray-200'
      } ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
    />
    {error && (
      <p className="mt-1 text-sm text-red-500">{error}</p>
    )}
  </div>
));
InputField.displayName = 'InputField';

// Memoized submit button
const SubmitButton = React.memo(({ isLoading, isDisabled, darkMode }) => (
  <button
    type="submit"
    disabled={isLoading || isDisabled}
    className={`w-full mt-6 py-2 px-4 rounded-md text-white font-semibold transition-all duration-300 ${
      isLoading || isDisabled
        ? `${darkMode ? 'bg-gray-600' : 'bg-gray-400'} cursor-not-allowed opacity-60`
        : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
    }`}
    aria-busy={isLoading}
  >
    {isLoading ? (
      <span className="flex items-center justify-center gap-2">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Logging in...
      </span>
    ) : (
      'Log In'
    )}
  </button>
));
SubmitButton.displayName = 'SubmitButton';

// Memoized sign up link
const SignupLink = React.memo(({ darkMode }) => (
  <p className={`block mt-4 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
    Don't have an account?{' '}
    <Link 
      to="/user/signup" 
      className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
    >
      Sign up
    </Link>
  </p>
));
SignupLink.displayName = 'SignupLink';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, error, isLoading } = useSelector(state => state.auth);
  const { user } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.darkMode?.darkMode);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFormReady, setIsFormReady] = useState(false);
  const [loginProgress, setLoginProgress] = useState({
    isLoggingIn: false,
    isFetchingData: false,
    message: ''
  });

  // Simulate form loading (in real app, this could be checking auth state, etc.)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user?.username) {
      navigate('/');
    }
  }, [isAuthenticated, user?.username, navigate]);

  // Clear errors when user starts typing
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
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  }, [username, password]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return username.trim().length >= 3 && password.length >= 6;
  }, [username, password]);

  // Handle form submission with progressive loading states
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    try {
      // Step 1: Login
      setLoginProgress({
        isLoggingIn: true,
        isFetchingData: false,
        message: 'Authenticating...'
      });

      const userData = await dispatch(loginUser({ username, password })).unwrap();

      if (!userData?.username) {
        throw new Error('Login succeeded but no user data returned');
      }

      // Step 2: Fetch following data
      setLoginProgress({
        isLoggingIn: false,
        isFetchingData: true,
        message: 'Loading your feed...'
      });

      const followingList = await dispatch(fetchFollowing({ username: userData.username })).unwrap();
      
      // Step 3: Fetch activity
      if (followingList?.length > 0) {
        setLoginProgress(prev => ({
          ...prev,
          message: 'Preparing your timeline...'
        }));
        await dispatch(fetchFollowingActivity({ following: followingList })).unwrap();
      }

      dispatch(clearError());
      
      // Navigate after brief success state
      setLoginProgress({
        isLoggingIn: false,
        isFetchingData: false,
        message: 'Success! Redirecting...'
      });

      setTimeout(() => {
        navigate('/');
      }, 500);

    } catch (err) {
      console.error('Login error:', err);
      setFieldErrors({ form: err.message || 'Login failed' });
      setLoginProgress({
        isLoggingIn: false,
        isFetchingData: false,
        message: ''
      });
    }
  }, [username, password, dispatch, navigate, validateForm]);

  // Handle input changes
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

  // Show initial loader
  if (isLoading && !loginProgress.isLoggingIn) {
    return <Loader />;
  }

  const isProcessing = loginProgress.isLoggingIn || loginProgress.isFetchingData;

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 bg-transparent`}>
        {!isFormReady ? (
          <FormSkeleton darkMode={darkMode} />
        ) : (
          <form
            id="login-form"
            onSubmit={handleSubmit}
            className={`w-full max-w-md p-8 rounded-lg shadow-lg transition-all duration-300 ${
              darkMode ? 'bg-[#1E1E1E]' : 'bg-white'
            } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            noValidate
          >
            <h1 className={`text-3xl font-bold text-center ${
              darkMode ? 'text-white' : 'text-gray-900'
            } mb-8`}>
              FilmFlick
            </h1>

            {/* Form-level error */}
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 animate-[fadeIn_0.3s_ease-in-out]">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Username Input */}
            <InputField
              label="Username"
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              darkMode={darkMode}
              error={fieldErrors.username}
              disabled={isProcessing}
            />

            {/* Password Input */}
            <InputField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              darkMode={darkMode}
              error={fieldErrors.password}
              disabled={isProcessing}
            />

            {/* Submit Button */}
            <SubmitButton
              isLoading={isProcessing}
              isDisabled={!isFormValid}
              darkMode={darkMode}
            />

            {/* Sign up Link */}
            <SignupLink darkMode={darkMode} />
          </form>
        )}
      </div>

      {/* Loading Overlay for async operations */}
      {isProcessing && loginProgress.message && (
        <LoadingOverlay darkMode={darkMode} message={loginProgress.message} />
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