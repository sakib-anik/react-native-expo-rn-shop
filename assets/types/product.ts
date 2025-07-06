import { ImageSourcePropType } from 'react-native';
import { Category } from './category';

export type Product = {
  id: number;
  title: string;
  slug: string;
  images: { image_url: string }[]; // Not transformed yet
  heroImage: string;               // Not yet prefixed with base URL
  category: {
    name: string;
    slug: string;
    imageUrl: string;
  };
  price: number;
  maxQuantity: number;
};
