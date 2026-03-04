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
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Product, CartItem } from './types';
import { MOCK_PRODUCTS } from './mockData';
import { getGeminiResponse } from './services/gemini';
import Markdown from 'react-markdown';

export default function App() {
  const [view, setView] = useState<'landing' | 'buyer' | 'seller'>('landing');
  const [user, setUser] = useState<User | null>(null);
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
                    className="bg-white rounded-2xl border border-neutral-200 overflow-hidden group product-card-hover"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
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
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold">₦{product.price.toLocaleString()}</span>
                        {product.original_price && (
                          <span className="text-xs text-neutral-400 line-through">₦{product.original_price.toLocaleString()}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {[
                { label: 'Total Revenue', value: '₦1,250,000', icon: ShoppingBag, color: 'bg-blue-500' },
                { label: 'Total Orders', value: '48', icon: ShoppingBag, color: 'bg-green-500' },
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
                <button className="text-brand-600 text-sm font-medium hover:underline">View All</button>
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
                    {[1, 2, 3].map((_, i) => (
                      <tr key={i} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm">#ORD-2024-00{i+1}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">Chinedu Okafor</div>
                          <div className="text-xs text-neutral-400">Lagos, Nigeria</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Pending</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-sm">₦45,000</td>
                        <td className="px-6 py-4">
                          <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                  <button className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all">
                    Checkout Now
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
