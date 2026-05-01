export interface Amenity {
  icon: string;
  label: string;
}

export interface PricingOption {
  name: string;
  pricePerNight: number;
  totalPrice: number;
}

export interface RoomDetail {
  id: number;
  id_hotel: number;
  name: string;
  roomType: string;
  bedType: string;
  size: number;
  basePrice: number;
  stars: number;
  description: string;
  amenities: Amenity[];
  images: string[];
  pricingOptions: PricingOption[];
  hotelCity?: string;
  hotelName?: string;
}
