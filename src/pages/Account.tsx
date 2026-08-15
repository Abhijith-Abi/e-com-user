import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import customerService, { type CustomerProfile } from '@/services/customer.service';
import redeemService from '@/services/redeem.service';
import ProfileTab from '@/components/account/ProfileTab';
import OrdersTab from '@/components/account/OrdersTab';
import AddressesTab from '@/components/account/AddressesTab';
import WishlistTab from '@/components/account/WishlistTab';
import RedeemPointsTab from '@/components/account/RedeemPointsTab';

const Account = () => {
  const { user, logout, isSebastianCardUser, sebastianCardData } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      return;
    }
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'orders', 'addresses', 'wishlist', 'redeem'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.state, location.search]);

  // Update URL when tab changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab');
    
    if (currentTab !== activeTab) {
      searchParams.set('tab', activeTab);
      const newUrl = `${location.pathname}?${searchParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [activeTab, location.pathname, location.search]);

  useEffect(() => {
    const fetchProfileAndWallet = async () => {
      if (!user?.id) return;

      // 1. Fetch Wallet Balance
      try {
        const wallet = await redeemService.getWallet();
        if (wallet && typeof wallet.balance === 'number') {
          setWalletBalance(wallet.balance);
        }
      } catch (err) {
        console.error('Failed to fetch wallet balance:', err);
      }

      // 2. Load Profile (Card vs Registered user)
      if (isSebastianCardUser && sebastianCardData) {
        const card = sebastianCardData;
        setProfile({
          id: String(card.id),
          user_full_name: card.customer_name,
          user_email: card.email || '',
          user_phone: card.mobile,
          full_name: card.customer_name,
          email: card.email || '',
          phone: card.mobile,
          preferred_language: 'en',
          preferred_currency: 'INR',
          country: 'India',
          is_suspended: false,
          is_active: true,
          addresses: [{
            id: 'sebastian-card-address',
            customer: String(card.id),
            full_name: card.customer_name,
            phone: card.mobile,
            address_line1: card.address,
            address_line2: card.address_line2 || '',
            city: card.city,
            state: card.district || '',
            postal_code: card.pincode,
            country: 'India',
            is_default: true,
            is_active: true,
            created_at: card.activated_at || '',
            updated_at: card.activated_at || '',
          }],
          orders: [],
          created_at: card.activated_at || '',
          updated_at: card.activated_at || '',
        });
        setLoading(false);
        return;
      }

      try {
        const profiles = await customerService.listProfiles();
        if (profiles && profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          const createResponse = await customerService.createProfile({
            user: user.id, preferred_language: 'en', preferred_currency: 'INR', is_active: true,
          });
          if (createResponse.id) {
            const fullProfile = await customerService.getProfile(createResponse.id);
            setProfile(fullProfile);
          } else {
            setProfile(createResponse);
          }
        }
      } catch (error: any) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndWallet();
  }, [user?.id, isSebastianCardUser, sebastianCardData]);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-50/40 dark:bg-zinc-950 px-4">
        <div className="text-center max-w-sm w-full p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-6">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto border border-zinc-100/50 dark:border-zinc-700/50 shadow-inner">
            <User className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Sign In Required</h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">Please sign in to view your account details, manage your profile, and track your orders.</p>
          </div>
          <Button asChild className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-xs tracking-wide py-5 shadow-sm shadow-primary/10"><Link to="/signin">Sign In</Link></Button>
        </div>
      </main>
    );
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // The URL will be updated by the useEffect above
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'redeem', label: 'Loyalty Points', icon: Coins },
  ];

  return (
    <main className="min-h-screen bg-zinc-50/40 dark:bg-zinc-950 pb-16 font-sans">
      {/* Dashboard Top Area */}
      <div className="container pt-10 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              My Account
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 dark:text-zinc-500 mt-1 font-medium">
              Manage your personal profile, addresses, wishlist, and track your current orders.
            </p>
          </div>
        </div>

        {/* Premium Profile Header Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.015)] mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-extrabold text-xl uppercase shadow-md flex-shrink-0">
                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg md:text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {user.full_name || user.email?.split('@')[0]}
                  </h2>
                  {isSebastianCardUser ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-sans font-bold uppercase tracking-wider border border-amber-500/20">
                      ⭐ Privilege Cardholder
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-sans font-bold uppercase tracking-wider border border-primary/20">
                      Standard Member
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">{user.email}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800/80 pt-6 lg:pt-0 lg:pl-10 flex-grow max-w-2xl">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Loyalty Rewards</p>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-black" />
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    {walletBalance !== null ? `${walletBalance.toLocaleString()} pts` : '0 pts'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Saved Addresses</p>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {profile?.addresses?.length || 0} Saved
                </p>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Default Region</p>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 truncate">
                  {profile?.country || 'India'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 items-start">
          {/* Sidebar Navigation */}
          <div className="space-y-1 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase px-3 mb-3">Navigation</p>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-2xl text-xs font-bold font-sans tracking-wide transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 my-3 pt-3">
              <button
                onClick={() => { logout(); navigate('/'); toast.success('Signed out successfully'); }}
                className="flex items-center gap-3 w-full px-3.5 py-3 rounded-2xl text-xs font-bold font-sans tracking-wide text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <ProfileTab profile={profile} loading={loading} user={user} />
            )}
            {activeTab === 'orders' && (
              <OrdersTab profile={profile} loading={loading} />
            )}
            {activeTab === 'addresses' && (
              <AddressesTab profile={profile} loading={loading} onProfileUpdate={setProfile} />
            )}
            {activeTab === 'wishlist' && (
              <WishlistTab />
            )}
            {activeTab === 'redeem' && (
              <RedeemPointsTab loading={loading} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Account;
