import React, { useState, useEffect } from 'react';
import api from '../../Axios/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { toast } from 'react-toastify';
import { validateEmail, validatePassword, validateConfirmPassword, validateName } from '../utils/validation';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaLeaf, FaArrowRight, FaCheck, FaShieldAlt } from 'react-icons/fa';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(form.password, value);
      case 'agreeToTerms':
        return value ? '' : 'You must agree to the terms and conditions';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    setForm(prev => ({ ...prev, [name]: inputValue }));

    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, inputValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // Special case for confirm password when password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateConfirmPassword(inputValue, form.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      if (key !== 'role') {
        const error = validateField(key, form[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      };

      const res = await api.post('/auth/register', registerData);
      const { token, user } = res.data;

      // Use the auth context login method
      login(token, user);

      toast.success(`🎉 Welcome to Barakat, ${user.name}!`, {
        position: "top-right",
        autoClose: 2500,
      });

      setTimeout(() => {
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');

        if (redirectPath) {
          navigate(redirectPath);
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 2500);

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12">
        <div className="max-w-md text-center text-white animate-slide-in-left">
          <div className="mb-8">
            <FaLeaf className="text-6xl mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold mb-4">Join Barakat Today</h1>
            <p className="text-xl opacity-90">Start your journey with us and discover amazing products</p>
          </div>
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <FaCheck className="text-white" />
              <span>Free account setup</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaCheck className="text-white" />
              <span>Access to exclusive deals</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaCheck className="text-white" />
              <span>Fast and secure checkout</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaCheck className="text-white" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-slide-in-right">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <FaLeaf className="text-4xl text-green-600 mx-auto mb-2" />
            <h1 className="text-2xl font-bold gradient-text">Barakat</h1>
          </div>

          <div className="card p-8 card-hover">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Join thousands of satisfied customers</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <FaUser className="inline mr-2 text-green-600" />
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {errors.name && touched.name && (
                  <p className="form-error">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <FaEnvelope className="inline mr-2 text-green-600" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <FaLock className="inline mr-2 text-green-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="form-error">{errors.password}</p>
                )}
                {form.password && !errors.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${form.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={form.password.length >= 6 ? 'text-green-600' : 'text-gray-500'}>At least 6 characters</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={/[A-Z]/.test(form.password) ? 'text-green-600' : 'text-gray-500'}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={/[a-z]/.test(form.password) ? 'text-green-600' : 'text-gray-500'}>One lowercase letter</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(form.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={/\d/.test(form.password) ? 'text-green-600' : 'text-gray-500'}>One number</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <FaLock className="inline mr-2 text-green-600" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword}</p>
                )}
                {form.confirmPassword && !errors.confirmPassword && form.password === form.confirmPassword && (
                  <p className="form-success">✓ Passwords match</p>
                )}
              </div>

              {/* Account Type */}
              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  <FaShieldAlt className="inline mr-2 text-green-600" />
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  className="input"
                  value={form.role}
                  onChange={handleInputChange}
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Terms and Conditions */}
              <div className="form-group">
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1 ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                    checked={form.agreeToTerms}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-green-600 hover:text-green-700 underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-green-600 hover:text-green-700 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && touched.agreeToTerms && (
                  <p className="form-error">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full group"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-5 h-5 mr-3"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <FaShieldAlt className="text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  Your information is secure and encrypted
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;