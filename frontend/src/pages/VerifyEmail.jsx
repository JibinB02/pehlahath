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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log("VerifyEmail component mounted");
    console.log("Location state:", location.state);
    console.log("URL search params:", location.search);
    
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    console.log("Token from URL:", token);
    
    if (token) {
      verifyEmail(token);
    } else {
      // Check if email was passed from login page
      const state = location.state;
      if (state && state.email) {
        setEmail(state.email);
      }
      setVerificationStatus('error');
      setErrorMessage('No verification token found in the URL');
    }
  }, [location]);

  const verifyEmail = async (token) => {
    try {
      console.log(`Attempting to verify email with token: ${token}`);
      console.log(`Making request to: ${BACKEND_URL}/verify-email/${token}`);
      
      const response = await axios.get(`${BACKEND_URL}/verify-email/${token}`);
      console.log("Verification response:", response.data);
      
      // Clear any previous error state
      setErrorMessage('');
      setVerificationStatus('success');
      toast.success(response.data.message || 'Email verified successfully!');
      
      // Return early to prevent any further processing
      return;
    } catch (error) {
      console.error('Verification error:', error);
      console.error('Error response:', error.response?.data);
      
      // Set error state
      setVerificationStatus('error');
      
      // Extract the specific error message
      const errorMsg = error.response?.data?.error || 'Verification failed. Please try again.';
      setErrorMessage(errorMsg);
      
      // Show appropriate toast message
      if (errorMsg.includes('Invalid or expired')) {
        toast.error('Your verification link has expired or is invalid. Please request a new one.');
        
        // Try to extract email from URL if possible
        const emailParam = new URLSearchParams(location.search).get('email');
        if (emailParam) {
          setEmail(emailParam);
          console.log("Found email in URL params:", emailParam);
        }
      } else {
        toast.error(errorMsg);
      }
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
      toast.success(response.data.message || 'Verification email sent successfully!');
      toast.info('Please check your email for the new verification link');
    } catch (error) {
      console.error('Resend verification error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to resend verification email. Please try again.';
      toast.error(errorMsg);
      
      // If user not found, provide a helpful message
      if (errorMsg.includes('not found') || error.response?.status === 404) {
        setErrorMessage('Email address not found. Please check your email or register a new account.');
      }
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
          {verificationStatus === 'error' && (errorMessage || 'Verification failed or link expired.')}
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