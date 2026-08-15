import { z } from 'zod';

export const addressSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .regex(/^[A-Za-z\s]+$/, 'Full name must only contain letters and spaces'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  address_line1: z
    .string()
    .min(1, 'Address is required'),
  address_line2: z
    .string()
    .optional(),
  city: z
    .string()
    .min(1, 'City is required'),
  state: z
    .string()
    .min(1, 'State is required')
    .regex(/^[A-Za-z\s]+$/, 'State must only contain letters and spaces'),
  postal_code: z
    .string()
    .min(1, 'Postal code is required')
    .regex(/^[0-9]{6}$/, 'Postal code must be 6 digits'),
  country: z
    .string()
    .min(1, 'Country is required'),
  is_default: z
    .boolean()
    .optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// Validate single field
export const validateAddressField = (field: keyof AddressFormData, value: string) => {
  const fieldSchema = addressSchema.pick({ [field]: true });
  try {
    fieldSchema.parse({ [field]: value });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' };
    }
    return { success: false, error: 'Validation failed' };
  }
};

// Validate entire address
export const validateAddress = (data: unknown) => {
  try {
    return { success: true, data: addressSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};
