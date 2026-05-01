import { CardData } from "../../../../components/card/card.component";
import { CarouselItem } from '../../../../components/carousel/carousel.component';

export interface HomeSection {
  rooms: CardData[];
  events: CardData[];
  visits: CarouselItem[];
}
