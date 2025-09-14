// =============================================================================
// UPDATED SIGNUP SCREEN COMPONENT (No Google Auth)
// File path: src/components/auth/SignupScreen.tsx
// =============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Eye, EyeOff, User, ArrowRight, Check, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../common/LanguageSelector';
import authService from '../../services/authService';

interface SignupScreenProps {
  onAuthSuccess: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onAuthSuccess }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error(t('trip.validationErrors.nameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      toast.error(t('errors.fillRequiredFields'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error(t('errors.invalidFormat'));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password) {
      toast.error(t('errors.fillRequiredFields'));
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('errors.passwordMismatch'));
      return false;
    }
    if (!acceptedTerms) {
      toast.error(t('auth.agreeToTerms'));
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      // Prepare signup data
      const signupData = {
        username: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        ...(formData.phone.trim() && { phone: formData.phone.trim() })
      };

      // Call backend API
      const response = await authService.signup(signupData);
      
      toast.success(response.message || t('success.accountVerified'));
      onAuthSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.networkError');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength === 0) return 'bg-gray-200';
    if (strength === 1) return 'bg-red-400';
    if (strength === 2) return 'bg-orange-400';
    if (strength === 3) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getPasswordStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength === 0) return 'Very Weak';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
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
              <div className="absolute right-28 bottom-0 mt-2 z-50">
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
        </div>

        {/* Signup Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 1 ? <Check size={16} /> : '1'}
              </div>
              <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('profile.personalInfo')}</h3>
                  <p className="text-sm text-gray-600">{t('profile.personalDetails.fullName')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.name')} *
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-4 top-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                      placeholder={t('trip.fullNamePlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')} *
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                      placeholder={t('auth.email')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.phone')} (Optional)
                  </label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-4 top-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                      placeholder={t('common.phone')}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>{t('common.continue')}</span>
                  <ArrowRight size={18} />
                </button>
              </>
            )}

            {/* Step 2: Password & Terms */}
            {currentStep === 2 && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('profile.securitySettings')}</h3>
                  <p className="text-sm text-gray-600">{t('auth.password')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.password')} *
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
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(getPasswordStrength() / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.confirmPassword')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all duration-200 bg-gray-50/50"
                      placeholder={t('auth.confirmPassword')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t('auth.agreeToTerms').split(' ').slice(0, 4).join(' ')}{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                      {t('auth.termsOfService')}
                    </Link>{' '}
                    {t('common.and')}{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                      {t('auth.privacyPolicy')}
                    </Link>
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    {t('common.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{t('auth.createAccount')}</span>
                        <Check size={18} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;