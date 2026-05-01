export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id_reservation: number;
  id_user: number;
  id_room: number;
  check_in_date: string;
  check_out_date: string;
  reservation_status: ReservationStatus;
  created_at?: string;
  updated_at?: string;
}
