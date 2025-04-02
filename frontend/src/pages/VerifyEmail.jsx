import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      verifyEmail(token);
    } else {
      // Check if email was passed from login page
      const state = location.state;
      if (state && state.email) {
        setEmail(state.email);
      }
      setVerificationStatus('error');
    }
  }, [location]);

  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/verify-email/${token}`);
      setVerificationStatus('success');
      toast.success(response.data.message);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      toast.error(error.response?.data?.error || 'Verification failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/resend-verification`, { email });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {verificationStatus === 'verifying' && <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />}
          {verificationStatus === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
          {verificationStatus === 'error' && <XCircle className="h-12 w-12 text-red-600" />}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold dark:text-white text-gray-800">
          Email Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {verificationStatus === 'verifying' && 'Verifying your email...'}
          {verificationStatus === 'success' && 'Your email has been verified successfully!'}
          {verificationStatus === 'error' && 'Verification failed or link expired.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {verificationStatus === 'success' ? (
            <div className="text-center">
              <p className="mb-4 text-gray-700 dark:text-gray-300">You can now log in to your account.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2 px-4 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                {verificationStatus === 'error' ? 
                  "If you haven't received the verification email or if the link has expired, you can request a new one." : 
                  "Please wait while we verify your email..."}
              </p>
              
              {verificationStatus === 'error' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email address
                    </label>
                    <input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="w-full py-2 px-4 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isResending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-2 px-4 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-200"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}