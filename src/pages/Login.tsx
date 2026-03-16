import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { trackEvent } from '../services/analytics';

const Login: React.FC = () => {

  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [downloadLink, setDownloadLink] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'doctor' as 'doctor'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const isSignupMode = searchParams.get('mode') === 'signup';
    setIsLogin(!isSignupMode);
    setErrors({});
    setSuccess('');
    setDownloadLink('');
  }, [searchParams]);

  const validateForm = () => {

    const newErrors: {[key: string]: string} = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setErrors({});
    setSuccess('');
    setDownloadLink('');

    if (!validateForm()) return;

    setLoading(true);

    try {

      if (isLogin) {

        const result = await login(formData.email, formData.password);

        if (result.success) {

          trackEvent('login_success', { role: result.role || 'unknown' });

          if (result.message) {
            setSuccess(result.message);
          } else {
            setSuccess('Login successful! Redirecting...');
          }

          setTimeout(() => {
            navigate(result.redirectPath || '/dashboard', { replace: true });
          }, 1000);

        } else {

          setErrors({
            general: result.message || 'Invalid email or password. Please try again.'
          });

          if (result.downloadLink) {
            setDownloadLink(result.downloadLink);
          }

        }

      } else {

        const reg = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.role
        );

        if (reg) {
          trackEvent('signup_completed', { role: formData.role });
          // Redirect doctor to profile setup after registration
          if (formData.role === 'doctor') {
            navigate('/profile-setup', { replace: true });
          } else {
            setSuccess('Account created successfully! Please sign in.');
            setTimeout(() => {
              setIsLogin(true);
              setFormData({
                name: '',
                email: formData.email,
                password: '',
                confirmPassword: '',
                role: 'doctor'
              });
              setSuccess('');
            }, 2000);
          }
        } else {
          setErrors({
            general: 'Registration failed. Please try again.'
          });
        }
      }

    } catch {

      setErrors({
        general: isLogin
          ? 'Invalid email or password. Please try again.'
          : 'Registration failed. Please try again.'
      });

    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleMode = () => {

    setIsLogin(!isLogin);

    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'doctor'
    });

    setErrors({});
    setSuccess('');
    setDownloadLink('');
  };

  React.useEffect(() => {

    if (isAuthenticated && user && !success) {

      if (user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
        return;
      }

      navigate('/dashboard', { replace: true });
    }

  }, [isAuthenticated, user, navigate, success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">

      <Card className="w-full max-w-md p-8">

        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-center mb-6">

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <p className="text-gray-600">
            {isLogin
              ? 'Sign in to manage your clinic'
              : 'Join us to streamline your clinic operations'}
          </p>

        </div>

        {success && (
          <div className="flex items-center gap-2 p-3 mb-4 text-green-800 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {errors.general && (
          <div className="p-3 mb-4 text-red-800 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} />
              <div dangerouslySetInnerHTML={{ __html: errors.general }} />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <div className="relative flex items-center border border-gray-300 rounded-md">
                <Mail size={18} className="ml-3 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border-0 rounded-md focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative flex items-center border border-gray-300 rounded-md">
              <Mail size={18} className="ml-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border-0 rounded-md focus:outline-none"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative flex items-center border border-gray-300 rounded-md">
              <Lock size={18} className="ml-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border-0 rounded-md focus:outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="p-2 text-gray-400"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative flex items-center border border-gray-300 rounded-md">
                <Lock size={18} className="ml-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border-0 rounded-md focus:outline-none"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="p-2 text-gray-400"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>

        </form>

        <div className="text-center mt-6">

          <p className="text-gray-600">

            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={toggleMode}
              className="text-brand-700 hover:text-brand-600 font-medium ml-1"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>

          </p>

        </div>

      </Card>

    </div>
  );
};

export default Login;