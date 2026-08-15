import { useState } from 'react';
import { MapPin, Plus, Trash2, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import customerService, { type CustomerProfile } from '@/services/customer.service';
import { validateAddress, validateAddressField, type AddressFormData } from '@/lib/validations';

const emptyAddress = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  is_default: false,
};

interface Props {
  profile: CustomerProfile | null;
  loading: boolean;
  onProfileUpdate: (p: CustomerProfile) => void;
}

const AddressesTab = ({ profile, loading, onProfileUpdate }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const validateField = (field: string, value: string) => {
    const result = validateAddressField(field as keyof AddressFormData, value);
    
    if (result.success) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: result.error,
      }));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = validateAddress(form);
    
    if (!result.success) {
      setErrors(result.errors);
      toast.error('Please fix the errors in the form');
      return;
    }
    
    if (!profile?.id) {
      toast.error('Profile not loaded. Please refresh the page.');
      return;
    }
    setSaving(true);
    try {
      const newAddress = await customerService.createAddress({
        full_name: form.full_name,
        phone: form.phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        country: form.country,
        is_default: form.is_default,
      });
      onProfileUpdate({ ...profile, addresses: [...(profile.addresses || []), newAddress] });
      setShowForm(false);
      setForm(emptyAddress);
      setErrors({});
      toast.success('Address added successfully');
    } catch (error: any) {
      console.error('createAddress error:', error.response?.data || error);
      toast.error(error.response?.data?.message || error.message || 'Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    setDeletingId(addressId);
    try {
      await customerService.deleteAddress(addressId);
      onProfileUpdate({ ...profile!, addresses: profile!.addresses.filter((a) => a.id !== addressId) });
      toast.success('Address removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!profile) return;
    try {
      await customerService.updateAddress(addressId, { is_default: true });
      onProfileUpdate({
        ...profile,
        addresses: profile.addresses.map((a) => ({ ...a, is_default: a.id === addressId })),
      });
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update default address');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <h2 className="font-display text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Saved Addresses
        </h2>
        {!showForm && (
          <Button 
            size="sm" 
            onClick={() => setShowForm(true)} 
            className="w-full sm:w-auto gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-xs tracking-wide py-4 px-4 shadow-md shadow-primary/15 transition-all duration-300 hover:-translate-y-[1px]"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Address
          </Button>
        )}
      </div>

      {/* Add Address Form */}
      {showForm && (
        <div className="bg-zinc-50/40 dark:bg-zinc-900/50 border border-zinc-100/50 dark:border-zinc-850 rounded-2xl p-6 shadow-inner">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-100/20 dark:border-zinc-850">
            <h3 className="font-display text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Add New Address</h3>
            <button onClick={() => { setShowForm(false); setForm(emptyAddress); setErrors({}); }} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-450 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mb-1.5 block">Full Name *</label>
                <Input 
                  required 
                  value={form.full_name} 
                  onChange={(e) => {
                    setForm((p) => ({ ...p, full_name: e.target.value }));
                    validateField('full_name', e.target.value);
                  }} 
                  className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all" 
                />
                {errors.full_name && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.full_name}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-zinc-450 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mb-1.5 block">Phone *</label>
                <Input 
                  required 
                  value={form.phone} 
                  maxLength={10}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, phone: e.target.value }));
                    validateField('phone', e.target.value);
                  }} 
                  placeholder="10-digit number" 
                  className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all" 
                />
                {errors.phone && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-455 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mb-1.5 block">Address Line 1 *</label>
              <Input 
                required 
                value={form.address_line1} 
                onChange={(e) => {
                  setForm((p) => ({ ...p, address_line1: e.target.value }));
                  validateField('address_line1', e.target.value);
                }} 
                className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all" 
              />
              {errors.address_line1 && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.address_line1}</p>
              )}
            </div>
            <div>
              <label className="text-[10px] text-zinc-455 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mb-1.5 block">Address Line 2</label>
              <Input 
                value={form.address_line2} 
                onChange={(e) => setForm((p) => ({ ...p, address_line2: e.target.value }))} 
                className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all" 
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-zinc-455 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mb-1.5 block">City *</label>
                <Input 
                  required 
                  value={form.city} 
                  onChange={(e) => {
                    setForm((p) => ({ ...p, city: e.target.value }));
                    validateField('city', e.target.value);
                  }} 
                  className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all" 
                />
                {errors.city && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-zinc-455 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mb-1.5 block">State *</label>
                <Input 
                  required 
                  value={form.state} 
                  onChange={(e) => {
                    setForm((p) => ({ ...p, state: e.target.value }));
                    validateField('state', e.target.value);
                  }} 
                  className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all" 
                />
                {errors.state && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-zinc-455 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mb-1.5 block">Postal Code *</label>
                <Input 
                  required 
                  value={form.postal_code} 
                  maxLength={6}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, postal_code: e.target.value }));
                    validateField('postal_code', e.target.value);
                  }} 
                  className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all" 
                />
                {errors.postal_code && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.postal_code}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-455 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mb-1.5 block">Country *</label>
              <Input 
                required 
                value={form.country} 
                onChange={(e) => {
                  setForm((p) => ({ ...p, country: e.target.value }));
                  validateField('country', e.target.value);
                }} 
                placeholder="India" 
                className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all" 
              />
              {errors.country && (
                <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.country}</p>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-650 dark:text-zinc-400 select-none">
              <input 
                type="checkbox" 
                checked={form.is_default} 
                onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))} 
                className="rounded border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 accent-primary focus:ring-primary" 
              />
              Set as default address
            </label>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={saving} 
                className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-xs tracking-wide py-4 shadow-md shadow-primary/10 transition-all duration-300 hover:-translate-y-[0.5px]"
              >
                {saving ? 'Saving...' : 'Save Address'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowForm(false); setForm(emptyAddress); setErrors({}); }} 
                className="w-full sm:w-auto rounded-xl border-zinc-200 hover:border-zinc-300 text-zinc-700 font-sans font-bold text-xs tracking-wide py-4 transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {loading ? (
        <div className="flex items-center gap-2 py-4">
          <svg className="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-zinc-400 font-sans text-xs tracking-wider uppercase font-semibold">Loading saved addresses...</p>
        </div>
      ) : profile?.addresses && profile.addresses.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {profile.addresses.map((address) => {
            const isDefault = address.is_default;
            return (
              <div 
                key={address.id} 
                className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  isDefault 
                    ? 'bg-gradient-to-br from-white to-primary/[0.03] dark:from-zinc-900 dark:to-primary/[0.02] border-primary/40 dark:border-primary/30 shadow-md shadow-primary/[0.02]' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-850 hover:border-zinc-200 dark:hover:border-zinc-800 hover:shadow-[0_2px_12px_rgba(0,0,0,0.01)]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <p className="font-display text-sm font-extrabold text-zinc-900 dark:text-zinc-50 leading-none truncate">{address.full_name}</p>
                      {isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-[9px] font-sans font-bold uppercase tracking-wider leading-none whitespace-nowrap">
                          Default Address
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="p-1.5 rounded-lg border border-zinc-100 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all duration-300 shadow-sm bg-white dark:bg-zinc-900"
                          title="Set as default"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(address.id)}
                        disabled={deletingId === address.id}
                        className="p-1.5 rounded-lg border border-zinc-100 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 disabled:opacity-50 shadow-sm bg-white dark:bg-zinc-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1.5">{address.phone}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mt-2">Address details</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                    {address.address_line1}
                    {address.address_line2 ? `, ${address.address_line2}` : ''}
                    <br />
                    {address.city}, {address.state} {address.postal_code}
                    <br />
                    {address.country}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : !showForm ? (
        <div className="bg-zinc-50/40 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 bg-zinc-100/50 dark:bg-zinc-850 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100/50">
            <MapPin className="w-6 h-6 text-zinc-450 dark:text-zinc-500" />
          </div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">No Saved Addresses</p>
          <p className="text-xs text-zinc-450 dark:text-zinc-400 mb-5">You haven't saved any shipping addresses yet.</p>
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-2 rounded-xl border-zinc-200 text-zinc-700 font-sans font-bold text-xs tracking-wide py-4 transition-all duration-300">
            <Plus className="w-3.5 h-3.5" /> Add Your First Address
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default AddressesTab;
