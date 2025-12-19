import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '../features/authSlice';

// Validation rules matching backend
const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
    messages: {
      required: 'Username is required',
      minLength: 'Username must be at least 3 characters',
      maxLength: 'Username must not exceed 30 characters',
      pattern: 'Username can only contain letters, numbers, and underscores'
    }
  },
  password: {
    minLength: 8,
    patterns: {
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      number: /[0-9]/
    },
    messages: {
      required: 'Password is required',
      minLength: 'Password must be at least 8 characters long',
      uppercase: 'Password must contain at least one uppercase letter',
      lowercase: 'Password must contain at least one lowercase letter',
      number: 'Password must contain at least one number'
    }
  },
  name: {
    minLength: 2,
    messages: {
      required: 'Name is required',
      minLength: 'Name must be at least 2 characters'
    }
  }
};

// Password strength indicator
const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (VALIDATION_RULES.password.patterns.uppercase.test(password)) strength++;
  if (VALIDATION_RULES.password.patterns.lowercase.test(password)) strength++;
  if (VALIDATION_RULES.password.patterns.number.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', color: 'red', text: 'Weak' };
  if (strength <= 4) return { level: 'medium', color: 'yellow', text: 'Medium' };
  return { level: 'strong', color: 'green', text: 'Strong' };
};

// Skeleton Components
const FormSkeleton = ({ darkMode }) => (
  <div className="w-full flex flex-col max-w-md bg-transparent rounded-lg p-8 animate-pulse">
    <div className={`h-8 w-48 mx-auto mb-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="mb-4">
        <div className={`h-4 w-20 mb-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        <div className={`h-10 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      </div>
    ))}
    <div className={`h-10 w-full mt-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
    <div className={`h-4 w-48 mt-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
  </div>
);

// Loading overlay
const LoadingOverlay = ({ darkMode, message = 'Creating your account...' }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className={`p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col items-center gap-4`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
      <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
    </div>
  </div>
);

// Password Strength Indicator
const PasswordStrengthIndicator = React.memo(({ password, darkMode }) => {
  if (!password) return null;
  
  const strength = getPasswordStrength(password);
  const widthPercentage = {
    weak: '33%',
    medium: '66%',
    strong: '100%'
  }[strength.level];

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Password Strength:
        </span>
        <span className={`text-xs font-semibold text-${strength.color}-600`}>
          {strength.text}
        </span>
      </div>
      <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 bg-${strength.color}-500`}
          style={{ width: widthPercentage }}
        />
      </div>
    </div>
  );
});
PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator';

// Validation checklist for password
const PasswordChecklist = React.memo(({ password, darkMode }) => {
  if (!password) return null;

  const checks = [
    { 
      test: password.length >= 8, 
      label: 'At least 8 characters' 
    },
    { 
      test: VALIDATION_RULES.password.patterns.uppercase.test(password), 
      label: 'One uppercase letter' 
    },
    { 
      test: VALIDATION_RULES.password.patterns.lowercase.test(password), 
      label: 'One lowercase letter' 
    },
    { 
      test: VALIDATION_RULES.password.patterns.number.test(password), 
      label: 'One number' 
    }
  ];

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check, index) => (
        <div key={index} className="flex items-center gap-2">
          {check.test ? (
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-xs ${check.test ? 'text-green-600 font-medium' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
});
PasswordChecklist.displayName = 'PasswordChecklist';

// Input Field Component
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
  error,
  showPasswordStrength,
  showPasswordChecklist
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
      className={`mt-1 block w-full px-3 py-2 ${
        darkMode 
          ? 'bg-gray-700 text-gray-100 border-gray-600' 
          : 'bg-gray-100 text-gray-900 border-gray-300'
      } border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
        error ? 'border-red-500 focus:ring-red-500' : ''
      }`}
    />
    {error && (
      <p className="text-red-500 text-xs mt-1 animate-[slideIn_0.2s_ease-out]">{error}</p>
    )}
    {showPasswordStrength && <PasswordStrengthIndicator password={value} darkMode={darkMode} />}
    {showPasswordChecklist && <PasswordChecklist password={value} darkMode={darkMode} />}
  </div>
));
InputField.displayName = 'InputField';

// Submit Button
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
  const [touched, setTouched] = useState({});
  const [isFormReady, setIsFormReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redux state
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.darkMode.darkMode);

  // Simulate form loading
  useEffect(() => {
    const timer = setTimeout(() => setIsFormReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => dispatch(clearError());
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

  // Comprehensive validation function
  const validateField = useCallback((fieldName, value) => {
    const errors = [];

    switch (fieldName) {
      case 'username':
        if (!value.trim()) {
          errors.push(VALIDATION_RULES.username.messages.required);
        } else if (value.length < VALIDATION_RULES.username.minLength) {
          errors.push(VALIDATION_RULES.username.messages.minLength);
        } else if (value.length > VALIDATION_RULES.username.maxLength) {
          errors.push(VALIDATION_RULES.username.messages.maxLength);
        } else if (!VALIDATION_RULES.username.pattern.test(value)) {
          errors.push(VALIDATION_RULES.username.messages.pattern);
        }
        break;

      case 'password':
        if (!value) {
          errors.push(VALIDATION_RULES.password.messages.required);
        } else {
          if (value.length < VALIDATION_RULES.password.minLength) {
            errors.push(VALIDATION_RULES.password.messages.minLength);
          }
          if (!VALIDATION_RULES.password.patterns.uppercase.test(value)) {
            errors.push(VALIDATION_RULES.password.messages.uppercase);
          }
          if (!VALIDATION_RULES.password.patterns.lowercase.test(value)) {
            errors.push(VALIDATION_RULES.password.messages.lowercase);
          }
          if (!VALIDATION_RULES.password.patterns.number.test(value)) {
            errors.push(VALIDATION_RULES.password.messages.number);
          }
        }
        break;

      case 'name':
        if (!value.trim()) {
          errors.push(VALIDATION_RULES.name.messages.required);
        } else if (value.trim().length < VALIDATION_RULES.name.minLength) {
          errors.push(VALIDATION_RULES.name.messages.minLength);
        }
        break;

      default:
        break;
    }

    return errors.length > 0 ? errors[0] : null; // Return first error
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const errors = {};
    
    const usernameError = validateField('username', username);
    if (usernameError) errors.username = usernameError;

    const passwordError = validateField('password', password);
    if (passwordError) errors.password = passwordError;

    const nameError = validateField('name', name);
    if (nameError) errors.name = nameError;

    return errors;
  }, [username, password, name, validateField]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  }, [validateForm]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ username: true, password: true, name: true });
    
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
      setTouched({});
      
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

  // Handle input changes with real-time validation
  const handleUsernameChange = useCallback((e) => {
    const value = e.target.value;
    setUsername(value);
    if (touched.username) {
      const error = validateField('username', value);
      setFieldErrors(prev => ({ ...prev, username: error || undefined }));
    }
  }, [touched.username, validateField]);

  const handlePasswordChange = useCallback((e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      const error = validateField('password', value);
      setFieldErrors(prev => ({ ...prev, password: error || undefined }));
    }
  }, [touched.password, validateField]);

  const handleNameChange = useCallback((e) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) {
      const error = validateField('name', value);
      setFieldErrors(prev => ({ ...prev, name: error || undefined }));
    }
  }, [touched.name, validateField]);

  // Handle blur events
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    let value;
    switch (fieldName) {
      case 'username': value = username; break;
      case 'password': value = password; break;
      case 'name': value = name; break;
      default: return;
    }
    
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({ ...prev, [fieldName]: error || undefined }));
  }, [username, password, name, validateField]);

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
            }`}
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
              onBlur={() => handleBlur('username')}
              placeholder="Username (3-30 characters)"
              darkMode={darkMode}
              disabled={isProcessing}
              required
              error={touched.username ? fieldErrors.username : null}
            />

            {/* Password Input */}
            <InputField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              placeholder="Password (minimum 8 characters)"
              darkMode={darkMode}
              disabled={isProcessing}
              required
              error={touched.password ? fieldErrors.password : null}
              showPasswordStrength={password.length > 0}
              showPasswordChecklist={password.length > 0 && !fieldErrors.password}
            />

            {/* Name Input */}
            <InputField
              label="Name"
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={() => handleBlur('name')}
              placeholder="Your full name"
              darkMode={darkMode}
              disabled={isProcessing}
              required
              error={touched.name ? fieldErrors.name : null}
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
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
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