import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, CreditCard, ShieldCheck, Lock, Mail, Eye, EyeOff } from 'lucide-react';
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

const SignIn = () => {
  const { loadCartList } = useCartStore();
  const { loadWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'email'>('card');
  const [showPassword, setShowPassword] = useState(false);

  // Sebastian Card Sign In Schema and Form Hook
  const sebastianSchema = yup.object({
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
      .required('Phone number is required'),
    cardDigits: yup
      .string()
      .matches(/^[0-9]{5}$/, 'Card digits must be exactly 5 digits')
      .required('Card digits are required'),
  }).required();

  type SebastianFormData = yup.InferType<typeof sebastianSchema>;

  const {
    register: registerSebastian,
    handleSubmit: handleSubmitSebastian,
    formState: { errors: sebastianErrors, isValid: isSebastianValid },
  } = useForm<SebastianFormData>({
    resolver: yupResolver(sebastianSchema),
    mode: 'onChange',
    defaultValues: {
      phone: '',
      cardDigits: '',
    }
  });

  // Email Sign In Schema and Form Hook
  const emailSchema = yup.object({
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().required('Password is required'),
  }).required();

  type EmailFormData = yup.InferType<typeof emailSchema>;

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isValid: isEmailValid },
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSebastianSubmit = async (data: SebastianFormData) => {
    // Check for validation errors and show them as toast
    if (Object.keys(sebastianErrors).length > 0) {
      const firstError = Object.values(sebastianErrors)[0];
      if (firstError?.message) {
        toast.error(firstError.message);
      }
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify card details first
      const cardResponse = await authService.verifyCustomerCard(data.phone.trim(), data.cardDigits);
      
      if (!cardResponse || !cardResponse.success || !cardResponse.data) {
        toast.error(cardResponse?.message || 'Failed to verify customer card.');
        setIsLoading(false);
        return;
      }

      const cardData = cardResponse.data;
      const email = cardData.email;
      const customerCode = cardData.customer_code;

      if (!email) {
        toast.error('Email is missing from card details. Cannot authenticate.');
        setIsLoading(false);
        return;
      }
      if (!customerCode) {
        toast.error('Customer code is missing from card details. Cannot authenticate.');
        setIsLoading(false);
        return;
      }

      let loginResponse: any;
      
      try {
        // 2. Try standard backend login with email and customer_code as password
        loginResponse = await authService.login({
          email: email.trim(),
          password: customerCode,
        });
      } catch (loginError: any) {
        // If login fails (e.g. user does not exist), automatically register them
        console.log('[SignIn] Login failed with customer_code, attempting auto-registration...', loginError);
        
        try {
          const phoneInt = parseInt(cardData.mobile.replace(/\D/g, ''), 10) || 0;
          await authService.register({
            email: email.trim(),
            password: customerCode,
            full_name: cardData.customer_name || 'Sebastian Card User',
            phone: phoneInt,
            country: 'INDIA',
            preferred_language: 'en',
          });

          // Registration succeeded! Now log in.
          loginResponse = await authService.login({
            email: email.trim(),
            password: customerCode,
          });
        } catch (regError: any) {
          console.error('[SignIn] Auto-registration failed:', regError);
          let errorMsg = 'Failed to sign in. Please verify your card details.';
          if (regError.response?.data) {
            const rData = regError.response.data;
            if (rData.email && (JSON.stringify(rData.email).includes('already') || JSON.stringify(rData.email).includes('exists'))) {
              errorMsg = 'This email is already registered on our backend, but the customer code does not match. Please sign in using standard email login.';
            } else {
              errorMsg = rData.detail || rData.message || rData.error || errorMsg;
            }
          }
          throw new Error(errorMsg);
        }
      }

      // 3. Successful login (from either first attempt or post-registration)
      let customerId = loginResponse.customer_id;
      if (!customerId) {
        customerId = await authService.fetchCustomerId(loginResponse.user.id);
      }

      // Update store with both standard JWT tokens and Sebastian card customer data
      const { setSebastianCardAuth } = useAuthStore.getState();
      setSebastianCardAuth(cardData, loginResponse.access, loginResponse.refresh, loginResponse.user, customerId || undefined);

      // Load cart and wishlist for newly logged in user
      await Promise.all([
        loadCartList(),
        loadWishlist(),
      ]);

      toast.success(cardResponse.message || `Welcome back, ${cardData.customer_name}`);
      navigate('/');
    } catch (error: any) {
      console.error('[SignIn] Sebastian Card Login error:', error);
      let errorMessage = 'Verification failed. Please check your card credentials.';
      
      if (error.response?.data) {
        const data = error.response.data;
        errorMessage = data.message || data.detail || (typeof data === 'string' ? data : errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailSubmit = async (data: EmailFormData) => {
    if (Object.keys(emailErrors).length > 0) {
      const firstError = Object.values(emailErrors)[0];
      if (firstError?.message) {
        toast.error(firstError.message);
      }
      return;
    }

    setIsLoading(true);
    try {
      const loginResponse = await authService.login({
        email: data.email.trim(),
        password: data.password,
      });

      let customerId = loginResponse.customer_id;
      if (!customerId) {
        customerId = await authService.fetchCustomerId(loginResponse.user.id);
      }

      const { setAuth } = useAuthStore.getState();
      setAuth(loginResponse.user, loginResponse.access, loginResponse.refresh, customerId || undefined);

      await Promise.all([
        loadCartList(),
        loadWishlist(),
      ]);

      toast.success(`Welcome back, ${loginResponse.user.full_name || 'User'}`);
      navigate('/');
    } catch (error: any) {
      console.error('[SignIn] Email Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.response?.data) {
        const d = error.response.data;
        errorMessage = d.detail || d.message || d.error || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-16 px-4 relative overflow-hidden bg-background">
      {/* Decorative premium ambient glow background shapes */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[28rem] h-[28rem] bg-accent/8 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-gold/3 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md bg-background/80 backdrop-blur-2xl border border-border/90 p-8 md:p-10 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] relative z-10 transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:border-primary/30">
        
        {/* Brand Title and Portal Heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-sans font-bold uppercase tracking-wider mb-4 border border-primary/20">
            <Lock className="w-3 h-3" />
            <span>Secure Portal</span>
          </div>
          
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-3">
            {activeTab === 'card' ? 'Cardholder Portal' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground/80 text-xs font-sans tracking-wide max-w-xs leading-relaxed min-h-[40px]">
            {activeTab === 'card' 
              ? 'Verify your exclusive Sebastian membership card to unlock personalized shopping, loyalty rewards, and priority delivery.'
              : 'Sign in with your email and password to access your personalized boutique, saved items, and exclusive offers.'}
          </p>
        </div>

        {/* Tabs for Card / Email Login */}
        <div className="flex p-1 bg-muted/60 backdrop-blur-sm rounded-xl border border-border/40 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2.5 text-[11px] font-sans font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'card'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground/80 hover:text-foreground hover:bg-background/20'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Card Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2.5 text-[11px] font-sans font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'email'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground/80 hover:text-foreground hover:bg-background/20'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Login
          </button>
        </div>

        {activeTab === 'card' ? (
          <form onSubmit={handleSubmitSebastian(onSebastianSubmit)} className="space-y-6">
            {/* Phone Number Field */}
            <div>
              <label className="block text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground/80 mb-2">
                Registered Phone Number
              </label>
              <div className="relative group">
                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300">
                  <Phone className="w-4 h-4" />
                </span>
                <Input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  className="ps-11 h-12 bg-background/50 border-border/80 focus:bg-background transition-all duration-300 rounded-xl placeholder:text-xs placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-primary/20 focus:border-primary/80"
                  disabled={isLoading}
                  {...registerSebastian('phone', {
                    onChange: (e) => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                      e.target.value = cleaned;
                    }
                  })}
                />
              </div>
              {sebastianErrors.phone && (
                <p className="text-[10px] text-destructive mt-1.5 font-sans font-medium flex items-center gap-1 animate-fade-in">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
                  {sebastianErrors.phone.message}
                </p>
              )}
            </div>

            {/* Card Last 5 Digits Field */}
            <div>
              <label className="block text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground/80 mb-2">
                Enter Last 5 Digits of Your privilege Card
              </label>
              <div className="relative group">
                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300">
                  <CreditCard className="w-4 h-4" />
                </span>
                <Input
                  type="text"
                  maxLength={5}
                  placeholder="Enter Last 5 Digits of Your privilege Card"
                  className="ps-11 h-12 bg-background/50 border-border/80 focus:bg-background transition-all duration-300 rounded-xl placeholder:text-xs placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-primary/20 focus:border-primary/80"
                  disabled={isLoading}
                  {...registerSebastian('cardDigits', {
                    onChange: (e) => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 5);
                      e.target.value = cleaned;
                    }
                  })}
                />
              </div>
              {sebastianErrors.cardDigits && (
                <p className="text-[10px] text-destructive mt-1.5 font-sans font-medium flex items-center gap-1 animate-fade-in">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
                  {sebastianErrors.cardDigits.message}
                </p>
              )}
            </div>

            {/* Verification Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-xs tracking-widest uppercase font-sans font-bold rounded-xl transition-all duration-300 bg-gradient-to-r from-primary via-primary/95 to-accent text-primary-foreground shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/25 hover:from-primary hover:to-primary active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-[1px]"
              disabled={!isSebastianValid || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying Member...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Verify & Sign In
                </span>
              )}
            </Button>

            {/* Footer Security Encryption Tag */}
            <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground/60 pt-4 font-sans border-t border-border/40 mt-6 tracking-wider uppercase">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>End-to-End Encrypted Connection</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground/80 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300">
                  <Mail className="w-4 h-4" />
                </span>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="ps-11 h-12 bg-background/50 border-border/80 focus:bg-background transition-all duration-300 rounded-xl placeholder:text-xs placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-primary/20 focus:border-primary/80"
                  disabled={isLoading}
                  {...registerEmail('email')}
                />
              </div>
              {emailErrors.email && (
                <p className="text-[10px] text-destructive mt-1.5 font-sans font-medium flex items-center gap-1 animate-fade-in">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
                  {emailErrors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground/80 mb-2">
                Password
              </label>
              <div className="relative group">
                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300">
                  <Lock className="w-4 h-4" />
                </span>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="ps-11 pe-11 h-12 bg-background/50 border-border/80 focus:bg-background transition-all duration-300 rounded-xl placeholder:text-xs placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-primary/20 focus:border-primary/80"
                  disabled={isLoading}
                  {...registerEmail('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-primary transition-colors duration-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {emailErrors.password && (
                <p className="text-[10px] text-destructive mt-1.5 font-sans font-medium flex items-center gap-1 animate-fade-in">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
                  {emailErrors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-xs tracking-widest uppercase font-sans font-bold rounded-xl transition-all duration-300 bg-gradient-to-r from-primary via-primary/95 to-accent text-primary-foreground shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/25 hover:from-primary hover:to-primary active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-[1px]"
              disabled={!isEmailValid || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>

            {/* Footer Security Encryption Tag */}
            <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground/60 pt-4 font-sans border-t border-border/40 mt-6 tracking-wider uppercase">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>End-to-End Encrypted Connection</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            </div>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8 font-sans">
          Don't have an account?{' '}
          <Link to="/signup" className="text-foreground underline underline-offset-4 hover:text-accent-foreground">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignIn;
