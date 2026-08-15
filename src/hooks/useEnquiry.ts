import { useMutation } from '@tanstack/react-query';
import enquiryService, { EnquiryPayload } from '@/services/enquiry.service';

export const useEnquiry = () => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (payload: EnquiryPayload) => enquiryService.submitEnquiry(payload),
  });

  return {
    submitEnquiry: mutate,
    isLoading: isPending,
    error: error?.message || null,
  };
};
