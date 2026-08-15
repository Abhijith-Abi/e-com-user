import api from './api';

export interface EnquiryPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface EnquiryResponse {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  updated_at: string;
}

const enquiryService = {
  submitEnquiry: async (payload: EnquiryPayload): Promise<EnquiryResponse> => {
    const response = await api.post('/enquiries/public_submit/', payload);
    return response.data;
  },
};

export default enquiryService;
