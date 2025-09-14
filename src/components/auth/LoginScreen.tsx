// =============================================================================
// UPDATED LOGIN SCREEN COMPONENT (No Google Auth)
// File path: src/components/auth/LoginScreen.tsx
// =============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../common/LanguageSelector';
import authService from '../../services/authService';

interface LoginScreenProps {
  onAuthSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthSuccess }) => {
  const { t } = useTranslation();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (loginMethod === 'email' && !formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (loginMethod === 'phone' && !formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }

    // Email validation
    if (loginMethod === 'email' && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Prepare login data
      const loginData = {
        password: formData.password,
        ...(loginMethod === 'email' 
          ? { email: formData.email.trim().toLowerCase() }
          : { phone: formData.phone.trim() }
        )
      };

      // Call backend API
      const response = await authService.login(loginData);
      
      toast.success(response.message || t('success.accountVerified'));
      onAuthSuccess();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.networkError');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Language Selector Button */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="flex items-center space-x-2 p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white transition-colors"
            >
              <Globe size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{t('common.language')}</span>
            </button>
            {showLanguageSelector && (
              <div className="absolute right-28 bottom-0 mt-2 z-50 origin-top-right animate-fade-in-down">
                <LanguageSelector
                  compact={true}
                  className="w-48"
                  onSelect={() => setShowLanguageSelector(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-40 h-40 mx-auto mb-4">
            <img src="/logo.png" alt="App Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">{t('auth.signInToAccount')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Login Method Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                loginMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail size={18} className="inline mr-2" />
              {t('auth.email')}
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                loginMethod === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Phone size={18} className="inline mr-2" />
              {t('common.phone')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginMethod === 'email' ? t('auth.email') : t('common.phone')}
              </label>
              <div className="relative">
                {loginMethod === 'email' ? (
                  <Mail size={20} className="absolute left-4 top-4 text-gray-400" />
                ) : (
                  <Phone size={20} className="absolute left-4 top-4 text-gray-400" />
                )}
                <input
                  type={loginMethod === 'email' ? 'email' : 'tel'}
                  value={loginMethod === 'email' ? formData.email : formData.phone}
                  onChange={(e) => handleInputChange(loginMethod, e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                  placeholder={loginMethod === 'email' ? t('auth.email') : t('common.phone')}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all duration-200 bg-gray-50/50"
                  placeholder={t('auth.password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.login')}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {t('auth.dontHaveAccount')}{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                {t('auth.signup')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;