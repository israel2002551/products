/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Store, 
  Search, 
  ShoppingCart, 
  User as UserIcon, 
  Menu, 
  X, 
  ArrowRight, 
  Truck, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  Video,
  Flame,
  LayoutDashboard,
  Plus,
  Package,
  Settings,
  LogOut,
  MessageSquare,
  Send,
  CheckCircle2,
  Filter,
  Check,
  Copy,
  MapPin,
  ShieldCheck,
  Heart,
  Share2,
  DollarSign,
  Link,
  ExternalLink,
  Zap,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Product, CartItem, Order, AffiliateEarning } from './types';
import { MOCK_PRODUCTS, MOCK_AFFILIATE_EARNINGS, MOCK_DROPSHIP_CATALOG, MOCK_SELLERS } from './mockData';
import { getGeminiResponse } from './services/gemini';
import Markdown from 'react-markdown';

const NairaSign = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 3v18" />
    <path d="M18 3v18" />
    <path d="M6 12h12" />
    <path d="M6 7h12" />
    <path d="M6 17h12" />
  </svg>
);

export default function App() {
  const [view, setView] = useState<'landing' | 'buyer' | 'seller'>('landing');
  const [user, setUser] = useState<User | null>({
    id: 'current-user',
    email: 'israelefe093@gmail.com',
    first_name: 'Israel',
    last_name: 'Efe',
    store_name: 'Efe Gadgets',
    user_type: 'both',
    whatsapp_number: '2349061484256',
    is_verified: false,
    verification_status: 'unverified',
    created_at: new Date().toISOString()
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [activeSellerSection, setActiveSellerSection] = useState('overview');
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'phones',
    condition: 'new',
    description: '',
    location: '',
    is_negotiable: false,
    product_type: 'local'
  });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    state: '',
    city: '',
    address: ''
  });
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord1',
      order_number: 'ORD-123456',
      buyer_id: 'buyer1',
      seller_id: 'seller1',
      total_amount: 45000,
      status: 'pending',
      delivery_name: 'Chinedu Okafor',
      delivery_phone: '08012345678',
      delivery_whatsapp: '08012345678',
      delivery_state: 'Lagos',
      delivery_city: 'Ikeja',
      delivery_address: '123 Allen Avenue',
      payment_receipt_url: 'https://picsum.photos/seed/receipt1/400/600',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'ord2',
      order_number: 'ORD-789012',
      buyer_id: 'buyer2',
      seller_id: 'seller1',
      total_amount: 120000,
      status: 'paid',
      delivery_name: 'Amina Bello',
      delivery_phone: '09087654321',
      delivery_whatsapp: '09087654321',
      delivery_state: 'Abuja',
      delivery_city: 'Garki',
      delivery_address: '45 Garki Road',
      payment_receipt_url: 'https://picsum.photos/seed/receipt2/400/600',
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=500&fit=crop",
      title: "Tech & Engineering Gear",
      subtitle: "Up to 70% off on microcontrollers, sensors, and laptops.",
      badge: "LIMITED OFFER"
    },
    {
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&h=500&fit=crop",
      title: "African Fashion Week",
      subtitle: "Discover authentic Ankara, Aso-oke & contemporary styles",
      badge: "NEW ARRIVALS"
    },
    {
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=500&fit=crop",
      title: "Global Products, Local Prices",
      subtitle: "Import from AliExpress & CJ Dropshipping with no inventory",
      badge: "DROPSHIPPING"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setIsChatLoading(true);

    const response = await getGeminiResponse(userMsg, chatMessages);
    setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    setIsChatLoading(false);
  };

  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || product.condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // In a real app, we would upload files to a storage service (like Supabase Storage)
    // For this demo, we'll use URL.createObjectURL to simulate the uploaded URLs
    const imageUrl = productImage ? URL.createObjectURL(productImage) : 'https://via.placeholder.com/800';
    const videoUrl = productVideo ? URL.createObjectURL(productVideo) : undefined;

    const product: Product = {
      ...(newProduct as Product),
      id: Math.random().toString(36).substr(2, 9),
      image_url: imageUrl,
      video_url: videoUrl,
      has_video: !!videoUrl,
      seller_id: user?.id || 'current-user',
      status: 'active',
      created_at: new Date().toISOString()
    };

    // Update local state (mocking DB insert)
    // We would normally call an API here
    MOCK_PRODUCTS.unshift(product);
    
    setIsUploading(false);
    setActiveSellerSection('products');
    setNewProduct({
      name: '',
      price: 0,
      category: 'phones',
      condition: 'new',
      description: '',
      location: '',
      is_negotiable: false,
      product_type: 'local'
    });
    setProductImage(null);
    setProductVideo(null);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentReceipt) {
      alert('Please upload your payment receipt!');
      return;
    }
    
    setIsSubmittingOrder(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      order_number: `ORD-${Date.now().toString().slice(-6)}`,
      buyer_id: user?.id || 'guest',
      seller_id: cart[0].seller_id,
      total_amount: cart.reduce((a, b) => a + (b.price * b.quantity), 0),
      status: 'pending',
      delivery_name: deliveryDetails.name,
      delivery_phone: deliveryDetails.phone,
      delivery_whatsapp: deliveryDetails.whatsapp,
      delivery_state: deliveryDetails.state,
      delivery_city: deliveryDetails.city,
      delivery_address: deliveryDetails.address,
      payment_receipt_url: URL.createObjectURL(paymentReceipt),
      created_at: new Date().toISOString()
    };

    setOrders(prev => [order, ...prev]);
    console.log('Order Created:', order);
    
    setCart([]);
    setIsCheckoutOpen(false);
    setIsSubmittingOrder(false);
    setPaymentReceipt(null);
    setDeliveryDetails({
      name: '',
      phone: '',
      whatsapp: '',
      state: '',
      city: '',
      address: ''
    });
    
    alert(`Order ${order.order_number} submitted! The seller will contact you on WhatsApp shortly.`);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const LandingPage = () => (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-neutral-900 via-neutral-800 to-brand-900 overflow-hidden">
      <div className="min-h-screen flex flex-col">
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-heading font-bold text-white">BUY<span className="text-accent-400">SELL</span></span>
            <span className="text-xs text-brand-300 mt-1">.ng</span>
          </div>
          <button className="text-white hover:text-accent-400 transition text-sm font-medium">
            Sign In
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setView('buyer')}
              className="group cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="text-white w-8 h-8" />
                </div>
                <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full text-white">Most Popular</span>
              </div>
              <h2 className="text-3xl font-heading font-bold text-white mb-3">I'm a Buyer</h2>
              <p className="text-neutral-300 mb-6 leading-relaxed">Discover authentic products from verified Nigerian sellers and global dropshipping suppliers.</p>
              <button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 rounded-xl w-full flex items-center justify-center gap-2 transition-all">
                Start Shopping <ArrowRight size={20} />
              </button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setView('seller')}
              className="group cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center">
                  <Store className="text-white w-8 h-8" />
                </div>
                <span className="text-xs font-medium bg-brand-500/30 px-3 py-1 rounded-full text-white">Dropshipping Enabled</span>
              </div>
              <h2 className="text-3xl font-heading font-bold text-white mb-3">I'm a Seller</h2>
              <p className="text-neutral-300 mb-6 leading-relaxed">Sell your own products OR import from AliExpress & CJ Dropshipping. No inventory needed!</p>
              <button className="bg-white text-neutral-900 font-semibold px-8 py-4 rounded-xl w-full flex items-center justify-center gap-2 transition-all hover:bg-neutral-100">
                Open Your Store <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );

  const BuyerNavbar = () => (
    <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-neutral-200">
      <div className="bg-neutral-900 text-white text-[10px] md:text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Truck size={14} /> Free delivery on orders over ₦15,000</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-accent-400 transition">Track Order</a>
            <a href="https://wa.me/2349061484256" target="_blank" className="hover:text-green-400 transition flex items-center gap-1">
              <MessageSquare size={14} /> Support
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="text-lg md:text-xl font-heading font-bold text-neutral-900">BUY<span className="text-accent-500">SELL</span></span>
          </div>
          <div className="flex-1 max-w-3xl relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search for products, brands and categories..."
              className="w-full pl-4 pr-12 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 text-white p-1.5 rounded-md">
              <Search size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3 md:gap-4 ml-auto">
            <div className="relative cursor-pointer hover:bg-neutral-100 p-2 rounded-lg transition" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center cursor-pointer">
              <UserIcon size={18} className="text-neutral-600" />
            </div>
            <button 
              onClick={() => setView('seller')}
              className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hidden sm:flex items-center gap-2"
            >
              <Store size={16} /> Seller Dashboard
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const SellerSidebar = () => (
    <aside className="w-64 bg-white border-r border-neutral-200 fixed h-full overflow-y-auto hidden lg:block">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div>
            <div className="font-heading font-bold">BUY<span className="text-accent-500">SELL</span></div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Seller Panel</div>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'products', icon: Package, label: 'My Products' },
          { id: 'add', icon: Plus, label: 'Add Product' },
          { id: 'dropshipping', icon: Globe, label: 'Dropshipping', badge: 'NEW' },
          { id: 'affiliate', icon: DollarSign, label: 'Affiliate' },
          { id: 'orders', icon: ShoppingCart, label: 'Orders' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSellerSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeSellerSection === item.id 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-accent-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
        <button 
          onClick={() => setView('landing')}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Exit Dashboard</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen">
      {view === 'landing' && <LandingPage />}

      {view === 'buyer' && (
        <div className="pb-20">
          <BuyerNavbar />
          
          {/* Carousel */}
          <div className="bg-neutral-100 py-6">
            <div className="container mx-auto px-4">
              <div className="relative rounded-2xl overflow-hidden h-64 md:h-96 shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img src={slides[currentSlide].image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 to-transparent" />
                    <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-8 md:p-16 text-white max-w-xl">
                      <span className="inline-block bg-accent-500 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-4 w-fit">
                        {slides[currentSlide].badge}
                      </span>
                      <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 leading-tight">
                        {slides[currentSlide].title}
                      </h2>
                      <p className="text-lg text-neutral-200 mb-8">
                        {slides[currentSlide].subtitle}
                      </p>
                      <button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl w-fit flex items-center gap-2 transition-all">
                        Shop Now <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-6 right-8 flex gap-2">
                  {slides.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? 'bg-white w-6' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border-b border-neutral-200 sticky top-[116px] z-30">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
                  <div className="flex items-center gap-2 mr-4 text-neutral-500 flex-shrink-0">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="flex gap-2">
                    {['all', 'phones', 'electronics', 'fashion', 'home', 'beauty'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                          selectedCategory === cat 
                            ? 'bg-brand-600 text-white shadow-md' 
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="flex items-center gap-2 text-neutral-500 flex-shrink-0">
                    <span className="text-sm font-medium">Condition:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['all', 'new', 'used-like-new', 'used-good'].map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setSelectedCondition(cond)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                          selectedCondition === cond 
                            ? 'bg-accent-500 text-white shadow-md' 
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {selectedCondition === cond && <Check size={12} />}
                        {cond.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-heading font-bold">
                  {selectedCategory !== 'all' ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'Latest Products'}
                </h2>
                <p className="text-neutral-500 text-sm">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-100"><ChevronLeft size={20}/></button>
                <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-100"><ChevronRight size={20}/></button>
              </div>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <motion.div 
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                      onClick={() => setSelectedProduct(product)}
                      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden group product-card-hover cursor-pointer"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {product.video_url ? (
                          <video 
                            src={product.video_url} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            muted
                            loop
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                        ) : (
                          <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                        )}
                        {product.has_video && (
                          <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                            <Video size={12} /> Video
                          </span>
                        )}
                        {product.product_type === 'dropship' && (
                          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                            <Globe size={12} /> Dropship
                          </span>
                        )}
                        {(product.status === 'sold-out' || product.condition === 'sold-out') && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg uppercase tracking-wider">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate flex-1">{product.name}</h3>
                          {MOCK_SELLERS[product.seller_id]?.is_verified && (
                            <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-lg font-bold">₦{product.price.toLocaleString()}</span>
                          {product.original_price && (
                            <span className="text-xs text-neutral-400 line-through">₦{product.original_price.toLocaleString()}</span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="w-full bg-neutral-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-300">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-neutral-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">No products found</h3>
                <p className="text-neutral-500 mb-6">Try adjusting your filters or search query to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedCondition('all');
                    setSearchQuery('');
                  }}
                  className="text-brand-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'seller' && (
        <div className="bg-neutral-50 min-h-screen">
          <SellerSidebar />
          <main className="lg:ml-64 p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">Dashboard</h1>
                <p className="text-neutral-500 text-sm">Welcome back, Efe Israel</p>
              </div>
              <button className="lg:hidden p-2 bg-white border border-neutral-200 rounded-lg">
                <Menu size={24} />
              </button>
            </header>

            {activeSellerSection === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  {[
                    { label: 'Total Revenue', value: `₦${orders.filter(o => o.status !== 'cancelled').reduce((a, b) => a + b.total_amount, 0).toLocaleString()}`, icon: ShoppingBag, color: 'bg-blue-500' },
                    { label: 'Active Orders', value: orders.filter(o => ['pending', 'paid', 'processing'].includes(o.status)).length.toString(), icon: Package, color: 'bg-green-500' },
                    { label: 'Active Products', value: '12', icon: Package, color: 'bg-purple-500' },
                    { label: 'Store Views', value: '2.4k', icon: Flame, color: 'bg-orange-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl text-white ${stat.color}`}>
                          <stat.icon size={24} />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-neutral-500 text-xs uppercase tracking-wider font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="font-heading font-bold">Recent Orders</h2>
                    <button 
                      onClick={() => setActiveSellerSection('orders')}
                      className="text-brand-600 text-sm font-medium hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-sm">#{order.order_number}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium">{order.delivery_name}</div>
                              <div className="text-xs text-neutral-400">{order.delivery_city}, {order.delivery_state}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-sm">₦{order.total_amount.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setActiveSellerSection('orders');
                                }}
                                className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeSellerSection === 'add' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
                  <h2 className="text-2xl font-heading font-bold mb-6">Add New Product</h2>
                  <form onSubmit={handleAddProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Product Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          placeholder="e.g. iPhone 15 Pro Max"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Price (₦)</label>
                        <input 
                          type="number" 
                          required
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Category</label>
                        <select 
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        >
                          <option value="phones">Phones</option>
                          <option value="electronics">Electronics</option>
                          <option value="fashion">Fashion</option>
                          <option value="home">Home</option>
                          <option value="beauty">Beauty</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Condition</label>
                        <select 
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                          value={newProduct.condition}
                          onChange={(e) => setNewProduct({...newProduct, condition: e.target.value as any})}
                        >
                          <option value="new">New</option>
                          <option value="used-like-new">Used - Like New</option>
                          <option value="used-good">Used - Good</option>
                          <option value="used-fair">Used - Fair</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Description</label>
                      <textarea 
                        required
                        rows={4}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Tell buyers about your product..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-neutral-700 block">Product Image</label>
                        <div className="relative group">
                          <input 
                            type="file" 
                            accept="image/*"
                            required
                            onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${productImage ? 'border-brand-500 bg-brand-50' : 'border-neutral-200 bg-neutral-50 group-hover:border-brand-300'}`}>
                            {productImage ? (
                              <div className="text-center">
                                <CheckCircle2 className="text-brand-600 mx-auto mb-1" size={24} />
                                <span className="text-xs text-brand-700 font-medium truncate max-w-[150px] block">{productImage.name}</span>
                              </div>
                            ) : (
                              <>
                                <Plus className="text-neutral-400 mb-1" size={24} />
                                <span className="text-xs text-neutral-500">Upload Image</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-neutral-700 block">Product Video (Optional)</label>
                        <div className="relative group">
                          <input 
                            type="file" 
                            accept="video/*"
                            onChange={(e) => setProductVideo(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${productVideo ? 'border-accent-500 bg-accent-50' : 'border-neutral-200 bg-neutral-50 group-hover:border-accent-300'}`}>
                            {productVideo ? (
                              <div className="text-center">
                                <Video className="text-accent-600 mx-auto mb-1" size={24} />
                                <span className="text-xs text-accent-700 font-medium truncate max-w-[150px] block">{productVideo.name}</span>
                              </div>
                            ) : (
                              <>
                                <Video className="text-neutral-400 mb-1" size={24} />
                                <span className="text-xs text-neutral-500">Upload Video</span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-neutral-400">Short clips help sell faster!</p>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isUploading}
                      className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUploading ? 'Uploading...' : 'Publish Product'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeSellerSection === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-heading font-bold">Order Management</h2>
                  <div className="flex gap-2">
                    <select className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm outline-none">
                      <option>All Orders</option>
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Shipped</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Orders List */}
                  <div className="lg:col-span-2 space-y-4">
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <div 
                          key={order.id} 
                          onClick={() => setSelectedOrder(order)}
                          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer ${selectedOrder?.id === order.id ? 'border-brand-500 ring-1 ring-brand-500 shadow-md' : 'border-neutral-200 hover:border-neutral-300'}`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Order #{order.order_number}</div>
                              <div className="font-bold text-neutral-800">{order.delivery_name}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-neutral-500">
                              {new Date(order.created_at).toLocaleDateString()} • {order.delivery_city}
                            </div>
                            <div className="font-bold text-brand-600">₦{order.total_amount.toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                        <p className="text-neutral-500">No orders yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Order Details Sidebar */}
                  <div className="lg:col-span-1">
                    {selectedOrder ? (
                      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sticky top-24">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-heading font-bold">Order Details</h3>
                          <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-600">
                            <X size={20} />
                          </button>
                        </div>

                        <div className="space-y-6">
                          <div className="p-4 bg-neutral-50 rounded-2xl">
                            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Status Control</div>
                            <div className="grid grid-cols-2 gap-2">
                              {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                  className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${selectedOrder.status === status ? getStatusColor(status) + ' ring-1 ring-current' : 'bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-100'}`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer Info</div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
                                  <UserIcon size={16} />
                                </div>
                                <span>{selectedOrder.delivery_name}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
                                  <Truck size={16} />
                                </div>
                                <span className="text-xs leading-tight">{selectedOrder.delivery_address}, {selectedOrder.delivery_city}, {selectedOrder.delivery_state}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Actions</div>
                            <div className="grid grid-cols-1 gap-2">
                              <a 
                                href={`https://wa.me/${selectedOrder.delivery_whatsapp.replace(/\D/g, '')}?text=Hello ${selectedOrder.delivery_name}, I'm contacting you regarding your order #${selectedOrder.order_number} on BUYSELL Nigeria.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                              >
                                <MessageSquare size={18} /> Chat on WhatsApp
                              </a>
                              <button 
                                onClick={() => window.open(selectedOrder.payment_receipt_url, '_blank')}
                                className="w-full bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-all"
                              >
                                View Payment Receipt
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200 p-12 text-center">
                        <Package className="mx-auto text-neutral-300 mb-4" size={48} />
                        <p className="text-neutral-400 text-sm">Select an order to view details and manage status</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSellerSection === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-heading font-bold">My Products</h2>
                  <button 
                    onClick={() => setActiveSellerSection('add')}
                    className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    <Plus size={18} /> Add New
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {MOCK_PRODUCTS.filter(p => p.seller_id === (user?.id || 'current-user') || p.seller_id === 'seller1').map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-2xl border border-neutral-200 flex gap-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={product.image_url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate mb-1">{product.name}</h3>
                        <div className="text-brand-600 font-bold mb-2">₦{product.price.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            (product.status === 'sold-out' || product.condition === 'sold-out')
                              ? 'bg-red-50 text-red-700'
                              : 'bg-green-50 text-green-700'
                          }`}>
                            {(product.status === 'sold-out' || product.condition === 'sold-out') ? 'Sold Out' : 'Active'}
                          </span>
                          {product.has_video && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full uppercase">Video</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSellerSection === 'dropshipping' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Global Dropshipping</h2>
                    <p className="text-brand-100 mb-8 text-lg">Import high-demand products from AliExpress & CJ Dropshipping directly to your store. We handle the logistics, you handle the sales.</p>
                    <div className="flex flex-wrap gap-4">
                      <button className="bg-white text-brand-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-50 transition-all">
                        <Zap size={20} /> Connect AliExpress
                      </button>
                      <button className="bg-brand-500/30 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-500/40 transition-all">
                        <Globe size={20} /> Browse Catalog
                      </button>
                    </div>
                  </div>
                  <Globe className="absolute -right-20 -bottom-20 text-white/10 w-96 h-96" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-heading font-bold">Recommended for Nigeria</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {MOCK_DROPSHIP_CATALOG.map((item) => (
                        <div key={item.id} className="bg-white rounded-3xl border border-neutral-200 overflow-hidden group">
                          <div className="aspect-video relative overflow-hidden">
                            <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-brand-600 uppercase">
                              Hot Item
                            </div>
                          </div>
                          <div className="p-6">
                            <h4 className="font-bold mb-2">{item.name}</h4>
                            <p className="text-xs text-neutral-500 mb-4 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <div className="text-[10px] text-neutral-400 uppercase font-bold">Cost Price</div>
                                <div className="font-bold text-neutral-900">₦{(item.price || 0).toLocaleString()}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-neutral-400 uppercase font-bold">Est. Profit</div>
                                <div className="font-bold text-green-600">₦{((item.price || 0) * 0.4).toLocaleString()}</div>
                              </div>
                            </div>
                            <button className="w-full bg-neutral-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-brand-600 transition-all flex items-center justify-center gap-2">
                              <Plus size={18} /> Import to Store
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-neutral-200">
                      <h3 className="font-heading font-bold mb-4">Dropship Stats</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl">
                          <div className="text-sm text-neutral-500">Imported Items</div>
                          <div className="font-bold text-lg">24</div>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl">
                          <div className="text-sm text-neutral-500">Total Sales</div>
                          <div className="font-bold text-lg text-brand-600">₦142,500</div>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl">
                          <div className="text-sm text-neutral-500">Pending Orders</div>
                          <div className="font-bold text-lg text-orange-500">3</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent-600 p-6 rounded-3xl text-white">
                      <TrendingUp className="mb-4" size={32} />
                      <h3 className="font-heading font-bold mb-2">Scaling Tip</h3>
                      <p className="text-sm text-accent-100 leading-relaxed">Focus on "Home & Kitchen" gadgets. They currently have the highest conversion rate in the Nigerian market.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSellerSection === 'affiliate' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Earnings', value: '₦12,450', icon: DollarSign, color: 'bg-green-500' },
                    { label: 'Pending Payout', value: '₦8,100', icon: TrendingUp, color: 'bg-blue-500' },
                    { label: 'Total Referrals', value: '142', icon: UserIcon, color: 'bg-purple-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                      <div className={`w-12 h-12 rounded-2xl ${stat.color} text-white flex items-center justify-center mb-4`}>
                        <stat.icon size={24} />
                      </div>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-neutral-500 text-xs uppercase tracking-wider font-bold">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden">
                      <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                        <h3 className="font-heading font-bold">Recent Earnings</h3>
                        <button className="text-brand-600 text-sm font-bold hover:underline">Download Report</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase tracking-wider font-bold">
                            <tr>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Product</th>
                              <th className="px-6 py-4">Source</th>
                              <th className="px-6 py-4">Commission</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {MOCK_AFFILIATE_EARNINGS.map((earning) => (
                              <tr key={earning.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-neutral-500">{new Date(earning.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-sm">{earning.product_name}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 bg-neutral-100 rounded-lg text-[10px] font-bold uppercase text-neutral-600">
                                    {earning.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-brand-600 text-sm">₦{earning.commission.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    earning.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {earning.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-neutral-200">
                      <h3 className="font-heading font-bold mb-6">Affiliate Links</h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Your Referral Link</label>
                          <div className="flex gap-2">
                            <input 
                              readOnly 
                              value="buysell.ng/ref/efe123" 
                              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm font-mono"
                            />
                            <button className="p-2 bg-neutral-900 text-white rounded-xl hover:bg-brand-600 transition-all">
                              <Copy size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                          <div className="flex items-center gap-3 mb-2">
                            <Zap size={18} className="text-brand-600" />
                            <span className="font-bold text-sm text-brand-900">Refer & Earn</span>
                          </div>
                          <p className="text-xs text-brand-700 leading-relaxed">Get ₦500 for every new seller who opens a store using your link.</p>
                        </div>
                        <button className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-600 transition-all">
                          <Share2 size={18} /> Share Link
                        </button>
                      </div>
                    </div>

                    <div className="bg-neutral-900 p-8 rounded-3xl text-white">
                      <h3 className="font-heading font-bold mb-4">External Programs</h3>
                      <p className="text-sm text-neutral-400 mb-6">Connect your Amazon and eBay affiliate accounts to track all earnings in one place.</p>
                      <div className="space-y-3">
                        <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                          <ExternalLink size={16} /> Connect Amazon
                        </button>
                        <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                          <ExternalLink size={16} /> Connect eBay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSellerSection === 'settings' && (
              <div className="max-w-4xl space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200">
                  <h3 className="text-xl font-heading font-bold mb-6">Seller Verification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                            user?.verification_status === 'verified' ? 'bg-green-500' : 
                            user?.verification_status === 'pending' ? 'bg-orange-500' : 'bg-neutral-400'
                          }`}>
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <div className="font-bold">Status: {user?.verification_status?.toUpperCase() || 'UNVERIFIED'}</div>
                            <p className="text-xs text-neutral-500">Verified sellers get 40% more sales on average.</p>
                          </div>
                        </div>
                        
                        {user?.verification_status !== 'verified' && (
                          <div className="space-y-4 mt-6">
                            <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                              <h4 className="text-sm font-bold mb-2">1. Upload Government ID</h4>
                              <p className="text-xs text-neutral-500 mb-4">NIN, Driver's License, or International Passport.</p>
                              <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-2xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-all">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Plus className="w-8 h-8 mb-3 text-neutral-400" />
                                    <p className="text-xs text-neutral-500">Click to upload ID</p>
                                  </div>
                                  <input type="file" className="hidden" />
                                </label>
                              </div>
                            </div>

                            <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                              <h4 className="text-sm font-bold mb-2">2. Connect Social Media</h4>
                              <p className="text-xs text-neutral-500 mb-4">Instagram, Twitter, or Facebook for identity verification.</p>
                              <div className="grid grid-cols-3 gap-2">
                                <button className="py-2 bg-neutral-100 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-all">Instagram</button>
                                <button className="py-2 bg-neutral-100 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-all">Twitter</button>
                                <button className="py-2 bg-neutral-100 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-all">Facebook</button>
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                if (user) {
                                  setUser({ ...user, verification_status: 'pending' });
                                }
                              }}
                              className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-brand-700 transition-all shadow-lg"
                            >
                              Submit for Verification
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-accent-50 p-6 rounded-3xl border border-accent-100">
                        <h4 className="font-bold text-accent-900 mb-4 flex items-center gap-2">
                          <Zap size={18} /> Why get verified?
                        </h4>
                        <ul className="space-y-3">
                          {[
                            'Verified Seller badge on all listings',
                            'Higher ranking in search results',
                            'Access to Dropshipping module',
                            'Lower commission on affiliate sales',
                            'Priority customer support'
                          ].map((benefit, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-accent-800">
                              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-neutral-900 p-6 rounded-3xl text-white">
                        <h4 className="font-bold mb-2">Store Settings</h4>
                        <p className="text-xs text-neutral-400 mb-6">Update your public store information.</p>
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase mb-1 block">Store Name</label>
                            <input type="text" defaultValue={user?.store_name} className="w-full bg-white/10 border-none rounded-xl px-4 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase mb-1 block">WhatsApp Number</label>
                            <input type="text" defaultValue={user?.whatsapp_number} className="w-full bg-white/10 border-none rounded-xl px-4 py-2 text-sm" />
                          </div>
                          <button className="w-full bg-white text-neutral-900 py-3 rounded-xl font-bold text-sm hover:bg-neutral-100 transition-all">
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* AI Assistant Chatbot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-80 md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden"
            >
              <div className="bg-brand-600 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">BUYSELL Assistant</div>
                    <div className="text-[10px] opacity-80">AI Powered • Online</div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-1 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="text-brand-600" />
                    </div>
                    <p className="text-sm text-neutral-500 px-6">Hello! I'm your AI assistant. Ask me anything about buying, selling, or dropshipping on BUYSELL Nigeria.</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-brand-600 text-white rounded-tr-none' 
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none shadow-sm'
                    }`}>
                      <div className="prose prose-sm max-w-none">
                        <Markdown>
                          {msg.parts[0].text}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-neutral-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                      <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="p-4 border-t border-neutral-100 bg-white">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask a question..."
                    className="w-full pl-4 pr-12 py-2.5 bg-neutral-100 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 text-white p-1.5 rounded-xl disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-700 transition-colors"
        >
          {isChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </motion.button>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-900 hover:bg-white transition-all shadow-lg"
              >
                <X size={24} />
              </button>

              {/* Media Gallery */}
              <div className="w-full md:w-1/2 h-[400px] md:h-auto bg-neutral-100 relative group">
                {selectedProduct.video_url ? (
                  <video 
                    src={selectedProduct.video_url} 
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    controls
                  />
                ) : (
                  <img src={selectedProduct.image_url} className="w-full h-full object-cover" alt="" />
                )}
                <div className="absolute bottom-6 left-6 flex gap-2">
                  <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-neutral-900 shadow-xl hover:bg-white transition-all">
                    <Share2 size={20} />
                  </button>
                  <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-neutral-900 shadow-xl hover:bg-white transition-all">
                    <Heart size={20} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <span className="px-3 py-1 bg-accent-50 text-accent-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {selectedProduct.condition.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 leading-tight">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-brand-600">₦{selectedProduct.price.toLocaleString()}</div>
                    {selectedProduct.original_price && (
                      <div className="text-lg text-neutral-400 line-through">₦{selectedProduct.original_price.toLocaleString()}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Location</div>
                      <div className="font-medium">{selectedProduct.location || 'Lagos, Nigeria'}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Description</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="p-6 bg-neutral-900 rounded-3xl text-white">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                          <UserIcon size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{MOCK_SELLERS[selectedProduct.seller_id]?.store_name || 'Israel Efe'}</span>
                            {MOCK_SELLERS[selectedProduct.seller_id]?.is_verified && (
                              <ShieldCheck size={16} className="text-accent-400" />
                            )}
                          </div>
                          <div className="text-xs opacity-60">
                            {MOCK_SELLERS[selectedProduct.seller_id]?.is_verified ? 'Verified Seller' : 'Unverified Seller'} • 4.8 Rating
                          </div>
                        </div>
                      </div>
                      <button className="text-xs font-bold uppercase tracking-wider text-accent-400 hover:text-accent-300">
                        View Store
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={`https://wa.me/2349061484256?text=Hello, I'm interested in your ${selectedProduct.name} listed for ₦${selectedProduct.price.toLocaleString()}. Is it still available?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#20bd5a] transition-all"
                      >
                        <MessageSquare size={18} /> Haggle
                      </a>
                      <button 
                        onClick={() => {
                          addToCart(selectedProduct);
                          setSelectedProduct(null);
                        }}
                        className="flex items-center justify-center gap-2 bg-white text-neutral-900 py-4 rounded-2xl font-bold text-sm hover:bg-neutral-100 transition-all"
                      >
                        <ShoppingCart size={18} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="text-xl font-heading font-bold">Your Cart</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-neutral-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart size={32} className="text-neutral-300" />
                    </div>
                    <p className="text-neutral-500">Your cart is empty. Start shopping!</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image_url} className="w-20 h-20 object-cover rounded-xl" alt="" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                        <div className="text-brand-600 font-bold">₦{item.price.toLocaleString()}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <button className="w-6 h-6 border border-neutral-200 rounded flex items-center justify-center">-</button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button className="w-6 h-6 border border-neutral-200 rounded flex items-center justify-center">+</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                  <div className="flex justify-between mb-4">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-bold text-lg">₦{cart.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all"
                  >
                    Checkout Now
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Side: Order Summary & Payment */}
              <div className="w-full md:w-5/12 bg-neutral-50 p-6 md:p-8 overflow-y-auto border-b md:border-b-0 md:border-r border-neutral-200">
                <h3 className="text-xl font-heading font-bold mb-6">Order Summary</h3>
                <div className="space-y-4 mb-8">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1 pr-4">
                        <span className="font-medium text-neutral-800">{item.name}</span>
                        <span className="text-neutral-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-neutral-200 flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-brand-600">
                      ₦{cart.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <NairaSign size={20} />
                    </div>
                    <span className="font-bold">Bank Transfer Details</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between opacity-80">
                      <span>Bank</span>
                      <span className="font-bold">OPay</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Account</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">9061484256</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText('9061484256');
                            alert('Account number copied!');
                          }}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between opacity-80">
                      <span>Name</span>
                      <span className="font-bold">Efe Israel</span>
                    </div>
                  </div>
                  <div className="mt-6 p-3 bg-white/10 rounded-xl text-[10px] leading-relaxed">
                    Please make the transfer and upload the receipt on the right to complete your order.
                  </div>
                </div>
              </div>

              {/* Right Side: Delivery Form */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-heading font-bold">Delivery Details</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} className="md:hidden p-2 hover:bg-neutral-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                        value={deliveryDetails.name}
                        onChange={(e) => setDeliveryDetails({...deliveryDetails, name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                        value={deliveryDetails.phone}
                        onChange={(e) => setDeliveryDetails({...deliveryDetails, phone: e.target.value})}
                        placeholder="080..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                      value={deliveryDetails.whatsapp}
                      onChange={(e) => setDeliveryDetails({...deliveryDetails, whatsapp: e.target.value})}
                      placeholder="Same as phone or different"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">State</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                        value={deliveryDetails.state}
                        onChange={(e) => setDeliveryDetails({...deliveryDetails, state: e.target.value})}
                        placeholder="Lagos"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">City</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                        value={deliveryDetails.city}
                        onChange={(e) => setDeliveryDetails({...deliveryDetails, city: e.target.value})}
                        placeholder="Ikeja"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Full Address</label>
                    <textarea 
                      required
                      rows={2}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                      value={deliveryDetails.address}
                      onChange={(e) => setDeliveryDetails({...deliveryDetails, address: e.target.value})}
                      placeholder="Street name, house number, landmark..."
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Upload Payment Receipt</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        required
                        onChange={(e) => setPaymentReceipt(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${paymentReceipt ? 'border-green-500 bg-green-50' : 'border-neutral-200 bg-neutral-50 group-hover:border-brand-300'}`}>
                        {paymentReceipt ? (
                          <div className="text-center">
                            <CheckCircle2 className="text-green-600 mx-auto mb-2" size={32} />
                            <span className="text-sm text-green-700 font-medium">{paymentReceipt.name}</span>
                          </div>
                        ) : (
                          <>
                            <Plus className="text-neutral-400 mb-2" size={32} />
                            <span className="text-sm text-neutral-500">Click to upload transfer screenshot</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Order & Payment'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
