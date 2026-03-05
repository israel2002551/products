import { Product, AffiliateEarning, User } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max - 256GB',
    price: 1250000,
    original_price: 1400000,
    category: 'phones',
    condition: 'new',
    description: 'Brand new iPhone 15 Pro Max, Natural Titanium. Factory unlocked.',
    location: 'Ikeja, Lagos',
    is_negotiable: true,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
    seller_id: 'seller1',
    status: 'active',
    has_video: true,
    product_type: 'local',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: 450000,
    original_price: 520000,
    category: 'electronics',
    condition: 'new',
    description: 'Industry leading noise canceling headphones.',
    location: 'Lekki, Lagos',
    is_negotiable: false,
    image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
    seller_id: 'seller2',
    status: 'active',
    has_video: false,
    product_type: 'dropship',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Ankara Luxury Gown - Custom Fit',
    price: 45000,
    category: 'fashion',
    condition: 'new',
    description: 'Beautifully tailored Ankara gown for weddings and events.',
    location: 'Surulere, Lagos',
    is_negotiable: true,
    image_url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=800',
    seller_id: 'seller3',
    status: 'sold-out',
    has_video: true,
    product_type: 'local',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Used MacBook Pro 2019 - 16GB RAM',
    price: 650000,
    original_price: 800000,
    category: 'electronics',
    condition: 'used-good',
    description: 'Slightly used MacBook Pro. Perfect for developers and designers.',
    location: 'Abuja, FCT',
    is_negotiable: true,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    seller_id: 'seller4',
    status: 'active',
    has_video: false,
    product_type: 'local',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Samsung Galaxy S21 Ultra - Used',
    price: 320000,
    original_price: 450000,
    category: 'phones',
    condition: 'used-like-new',
    description: 'Clean used S21 Ultra. No scratches, works perfectly.',
    location: 'Port Harcourt, Rivers',
    is_negotiable: false,
    image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
    seller_id: 'seller5',
    status: 'active',
    has_video: true,
    product_type: 'local',
    created_at: new Date().toISOString()
  }
];

export const MOCK_AFFILIATE_EARNINGS: AffiliateEarning[] = [
  {
    id: 'aff1',
    date: '2024-03-01',
    product_name: 'Wireless Earbuds Pro',
    type: 'local',
    amount: 25000,
    commission: 2500,
    status: 'paid'
  },
  {
    id: 'aff2',
    date: '2024-03-02',
    product_name: 'Smart Watch Series 7',
    type: 'amazon',
    amount: 150000,
    commission: 7500,
    status: 'pending'
  },
  {
    id: 'aff3',
    date: '2024-03-03',
    product_name: 'Gaming Mouse RGB',
    type: 'ebay',
    amount: 12000,
    commission: 600,
    status: 'pending'
  }
];

export const MOCK_DROPSHIP_CATALOG: Partial<Product>[] = [
  {
    id: 'ds1',
    name: 'Mini Projector 4K Support',
    price: 35000,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1535016120720-40c646be4480?w=800',
    product_type: 'dropship',
    description: 'Portable mini projector for home cinema.'
  },
  {
    id: 'ds2',
    name: 'Electric Vegetable Cutter',
    price: 8500,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800',
    product_type: 'dropship',
    description: '4-in-1 handheld electric vegetable cutter set.'
  },
  {
    id: 'ds3',
    name: 'Wireless Charging Station',
    price: 15000,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800',
    product_type: 'dropship',
    description: '3-in-1 wireless charger for iPhone, Watch, and AirPods.'
  }
];

export const MOCK_SELLERS: Record<string, Partial<User>> = {
  'seller1': {
    id: 'seller1',
    store_name: 'Efe Gadgets',
    is_verified: true,
    verification_status: 'verified'
  },
  'seller2': {
    id: 'seller2',
    store_name: 'Lekki Electronics',
    is_verified: false,
    verification_status: 'pending'
  },
  'seller3': {
    id: 'seller3',
    store_name: 'Surulere Fashion',
    is_verified: true,
    verification_status: 'verified'
  },
  'current-user': {
    id: 'current-user',
    store_name: 'Efe Gadgets',
    is_verified: false,
    verification_status: 'unverified'
  }
};
