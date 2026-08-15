import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import authService from '@/services/auth.service';

const SignUp = () => {
  const { setAuth } = useAuthStore();
  const { loadCartList } = useCartStore();
  const { loadWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP Verification States
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(15);

  // OTP Countdown Effect
  useEffect(() => {
    let intervalId: any;
    if (step === 'otp' && timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step, timer]);

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setIsVerifying(true);
    try {
      const res = await authService.resendOtp(registeredEmail);
      toast.success(res.detail || 'OTP resent successfully!');
      setTimer(15); // Reset 15s timer
    } catch (error: any) {
      let errorMessage = 'Failed to resend OTP. Please try again.';
      if (error.response?.data) {
        const data = error.response.data;
        errorMessage = data.detail || data.message || data.error || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const signUpSchema = yup.object({
    name: yup
      .string()
      .matches(/^[A-Za-z\s]+$/, 'Full name must only contain letters and spaces')
      .required('Full name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  }).required();

  type SignUpFormData = yup.InferType<typeof signUpSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      // Register the user and capture customer ID from response
      const registerResponse = await authService.register({
        email: data.email,
        password: data.password,
        full_name: data.name,
        phone: parseInt(data.phone, 10),
        country: 'INDIA',
        preferred_language: 'en',
        is_normal_user: true,
      });

      // Handle unverified email (OTP sent)
      if (registerResponse && (registerResponse.is_verified === false || registerResponse.detail?.includes('OTP') || registerResponse.detail?.includes('verify'))) {
        setRegisteredEmail(data.email);
        setRegisteredPassword(data.password);
        setStep('otp');
        setTimer(15); // Start/Reset 15-second timer
        toast.info(registerResponse.detail || 'Verification OTP sent to your email. Please verify your email.');
        return;
      }

      // Auto login after registration (if already verified or no OTP required)
      const loginResponse = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Extract customer ID from register response or the auto-login response
      let customerId = authService.getCustomerIdFromRegister(registerResponse) || loginResponse.customer_id;

      // If not found in register response, fetch from API
      if (!customerId) {
        customerId = await authService.fetchCustomerId(loginResponse.user.id);
      }

      // Store customer ID from register response
      setAuth(loginResponse.user, loginResponse.access, loginResponse.refresh, customerId || undefined);
      
      // Load user's cart and wishlist immediately after signup
      await Promise.all([
        loadCartList(),
        loadWishlist(),
      ]);
      
      toast.success('Welcome to Sebastian Stores!');
      navigate('/');
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        errorMessage = data.detail || 
                      data.message || 
                      data.error ||
                      (typeof data === 'string' ? data : errorMessage);
        
        if (data.email) {
          errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.phone) {
          errorMessage = Array.isArray(data.phone) ? data.phone[0] : data.phone;
        } else if (data.password) {
          errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error('Please enter a 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    try {
      await authService.verifyEmail(registeredEmail, otpCode);
      toast.success('Email verified successfully! Logging you in...');

      // Auto login after verification
      const loginResponse = await authService.login({
        email: registeredEmail,
        password: registeredPassword,
      });

      let customerId = loginResponse.customer_id;
      if (!customerId) {
        customerId = await authService.fetchCustomerId(loginResponse.user.id);
      }

      setAuth(loginResponse.user, loginResponse.access, loginResponse.refresh, customerId || undefined);
      
      await Promise.all([
        loadCartList(),
        loadWishlist(),
      ]);
      
      toast.success('Welcome to Sebastian Stores!');
      navigate('/');
    } catch (error: any) {
      let errorMessage = 'OTP verification failed. Please check the code and try again.';
      if (error.response?.data) {
        const data = error.response.data;
        errorMessage = data.detail || data.message || data.error || (data.otp_code ? (Array.isArray(data.otp_code) ? data.otp_code[0] : data.otp_code) : errorMessage);
      }
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === 'otp') {
    return (
      <main className="min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-background border border-border p-8 rounded-lg shadow-sm">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl mb-2">Verify Email</h1>
            <p className="text-muted-foreground text-sm font-sans">
              Enter the 6-digit OTP code sent to <span className="font-bold text-foreground">{registeredEmail}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-sans tracking-wide uppercase text-muted-foreground mb-1.5">Verification Code</label>
              <Input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(cleaned);
                }}
                placeholder="Enter 6-digit OTP"
                className="text-center text-lg tracking-[0.25em] font-sans font-bold h-12 bg-background/50 border-border/80 focus:bg-background rounded-xl"
                disabled={isVerifying}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm tracking-widest uppercase font-sans font-bold rounded-xl"
              disabled={otpCode.length !== 6 || isVerifying}
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Verify & Complete Signup
                </span>
              )}
            </Button>
          </form>

          <div className="flex flex-col items-center justify-center space-y-4 pt-4 border-t border-border/40 mt-6 font-sans">
            <p className="text-xs text-muted-foreground">
              Didn't receive the OTP?{' '}
              {timer > 0 ? (
                <span className="font-bold text-foreground">Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isVerifying}
                  className="text-primary hover:text-primary/80 font-bold underline transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8 font-sans">
            Need to change details?{' '}
            <button 
              type="button" 
              onClick={() => setStep('signup')}
              className="text-foreground underline underline-offset-4 hover:text-accent-foreground"
            >
              Go Back
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-background border border-border p-8 rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm font-sans">Join us today and discover curated luxury fashion.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-sans tracking-wide uppercase text-muted-foreground mb-1.5">Full Name</label>
            <Input
              type="text"
              {...register('name', {
                onChange: (e) => {
                  const cleaned = e.target.value.replace(/[^A-Za-z\s]/g, '');
                  e.target.value = cleaned;
                }
              })}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-[10px] text-destructive mt-1 font-sans">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-sans tracking-wide uppercase text-muted-foreground mb-1.5">Email Address</label>
            <Input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-[10px] text-destructive mt-1 font-sans">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-sans tracking-wide uppercase text-muted-foreground mb-1.5">Phone Number</label>
            <Input
              type="tel"
              {...register('phone', {
                onChange: (e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  e.target.value = cleaned;
                }
              })}
              maxLength={10}
              placeholder="Enter your 10-digit phone number"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-[10px] text-destructive mt-1 font-sans">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-sans tracking-wide uppercase text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Create a password (min. 8 characters)"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-destructive mt-1 font-sans">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-sm tracking-widest uppercase font-sans"
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8 font-sans">
          Already have an account?{' '}
          <Link to="/signin" className="text-foreground underline underline-offset-4 hover:text-accent-foreground">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignUp;
