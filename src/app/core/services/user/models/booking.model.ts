export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id_reservation: number;
  id_user: number;
  id_room: number;
  id_hotel: number;
  check_in_date: string;
  check_out_date: string;
  reservation_status: ReservationStatus;
  created_at: string;

  // joins opcionales
  room_number?: string;
  type?: string;
  hotel_name?: string;
}

export interface CreateBookingRequest {
  id_room: number;
  id_hotel: number;
  check_in_date: string;
  check_out_date: string;
}

export interface CreateBookingResponse {
  message: string;
  id_reservation: number;
}
