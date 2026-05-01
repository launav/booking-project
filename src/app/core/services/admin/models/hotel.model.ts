export interface Hotel {
  id_hotel: number;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateHotelDto = Omit<Hotel, 'id_hotel' | 'created_at' | 'updated_at'>;
export type UpdateHotelDto = Partial<CreateHotelDto>;
