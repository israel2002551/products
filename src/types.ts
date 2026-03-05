export type UserRole = 'buyer' | 'seller' | 'both';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  store_name?: string;
  user_type: UserRole;
  whatsapp_number?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  category: string;
  condition: 'new' | 'used-like-new' | 'used-good' | 'used-fair';
  description: string;
  location: string;
  is_negotiable: boolean;
  image_url: string;
  seller_id: string;
  status: 'active' | 'inactive' | 'deleted';
  has_video?: boolean;
  video_url?: string;
  product_type: 'local' | 'dropship';
  created_at: string;
}

export interface CartItem extends Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'seller_id'> {
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  delivery_name: string;
  delivery_phone: string;
  delivery_whatsapp: string;
  delivery_state: string;
  delivery_city: string;
  delivery_address: string;
  payment_receipt_url: string;
  created_at: string;
}

export interface AffiliateEarning {
  id: string;
  date: string;
  product_name: string;
  type: 'amazon' | 'ebay' | 'local';
  amount: number;
  commission: number;
  status: 'pending' | 'paid';
}
