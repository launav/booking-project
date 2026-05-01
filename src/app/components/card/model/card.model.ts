export interface CardData {
  id: number;
  title: string;
  subtitle: string;
  rating: number;
  imageUrl: string;
  location?: string;
  capacity?: number;
  isFavorite?: boolean;
}
