export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  capacity: number;
}
