export interface Cottage {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  amenities: string[];
  images: string[];
  created_at: string;
}

export interface Booking {
  id: string;
  cottage_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  stripe_session_id?: string;
  created_at: string;
}

export interface BookingFormData {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
}
