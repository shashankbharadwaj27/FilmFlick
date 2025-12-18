import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyAuth } from '../features/authSlice';

/**
 * AuthProvider - Verifies authentication status on app initialization
 */
export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { isInitialized, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only verify once on mount
    if (!isInitialized) {
      dispatch(verifyAuth());
    }
  }, [dispatch, isInitialized]);

  // Show loading screen while verifying auth
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}
