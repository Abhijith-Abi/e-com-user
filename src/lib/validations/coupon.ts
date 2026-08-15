import { z } from 'zod';

export const couponSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .min(3, 'Coupon code must be at least 3 characters'),
});

export type CouponFormData = z.infer<typeof couponSchema>;

export const validateCoupon = (data: unknown) => {
  try {
    return { success: true, data: couponSchema.parse(data) };
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
