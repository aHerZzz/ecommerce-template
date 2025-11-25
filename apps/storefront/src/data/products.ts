export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  sku: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  variants: ProductVariant[];
};

export const products: Product[] = [
  {
    id: '1',
    slug: 'sudadera-capucha',
    name: 'Sudadera con capucha',
    description: 'Sudadera premium con interior afelpado y capucha ajustable.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=60',
    category: 'Ropa',
    tags: ['novedad', 'invierno'],
    variants: [
      { id: '1a', name: 'S', price: 59.99, sku: 'SUD-001-S' },
      { id: '1b', name: 'M', price: 59.99, sku: 'SUD-001-M' },
      { id: '1c', name: 'L', price: 59.99, sku: 'SUD-001-L' }
    ]
  },
  {
    id: '2',
    slug: 'zapatillas-running',
    name: 'Zapatillas de running',
    description: 'Ligereza y amortiguación para entrenamientos diarios.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1528701800489-20be9bb5d466?auto=format&fit=crop&w=600&q=60',
    category: 'Calzado',
    tags: ['deporte'],
    variants: [
      { id: '2a', name: '40', price: 129.99, sku: 'RUN-040' },
      { id: '2b', name: '41', price: 129.99, sku: 'RUN-041' },
      { id: '2c', name: '42', price: 129.99, sku: 'RUN-042' }
    ]
  },
  {
    id: '3',
    slug: 'reloj-inteligente',
    name: 'Reloj inteligente',
    description: 'Seguimiento de salud, notificaciones y batería de larga duración.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=60',
    category: 'Tecnología',
    tags: ['gadget', 'nuevo'],
    variants: [
      { id: '3a', name: 'Correa negra', price: 199.99, sku: 'SMW-BLK' },
      { id: '3b', name: 'Correa azul', price: 199.99, sku: 'SMW-BLU' }
    ]
  }
];
