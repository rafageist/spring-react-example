import { Category, Location } from './Warehouse';

export interface ProductOwner {
  id: string;
  username: string;
  fullName: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  posX?: number | null;
  posY?: number | null;
  category?: Category | null;
  location?: Location | null;
  owner?: ProductOwner | null;
}

export type ProductCreate = Omit<Product, 'id' | 'category' | 'location' | 'owner'> & {
  categoryId?: string;
  locationId?: string;
};
