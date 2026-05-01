export type RoomType = 'individual' | 'doble' | 'suite' | 'studio';
export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export interface Room {
  id_room: number;
  id_hotel: number;
  room_number: string;
  type: RoomType;
  capacity: number;
  price_per_night: number;
  description?: string;
  status: RoomStatus;
  created_at?: string;
  updated_at?: string;
}

export type CreateRoomDto = Omit<Room, 'id_room' | 'created_at' | 'updated_at'>;
export type UpdateRoomDto = Partial<CreateRoomDto>;
