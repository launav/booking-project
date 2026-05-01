export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export interface Room {
  id_room: number;
  id_hotel: number;
  room_number: string;
  type: string;
  capacity: number;
  price_per_night: number;
  description: string | null;
  status: RoomStatus;

  hotel_name?: string;
  hotel_address?: string;
  hotel_city?: string;
}
