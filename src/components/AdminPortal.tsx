import React, { useState, useEffect } from 'react';
import { Shield, Plus, Package, DollarSign, Gift, Search, Trash2, Edit3, CheckCircle2, Lock, LogOut, ArrowRight, Truck, AlertTriangle, Sparkles, RefreshCw, Key, Settings, Globe, Check } from 'lucide-react';
import { Product, Order, OrderStatus, BundleOffer, ProductCategory } from '../types/store';
import { StoreStorage } from '../services/storeStorage';
import { DpoConfigService, DpoApiCredentials } from '../config/dpoConfig';

interface AdminPortalProps {
  onOrderUpdated?: (orderId: string) => void;
  onNavigateToStore?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onOrderUpdated,
  onNavigateToStore,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(() => StoreStorage.getAdminUsername());
  const [passkey, setPasskey] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'bundle' | 'settings'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bundleOffer, setBundleOffer] = useState<BundleOffer | null>(null);

  // DPO Pay Configuration State
  const [dpoConfig, setDpoConfig] = useState<DpoApiCredentials>(DpoConfigService.getCredentials());
  const [dpoSaveMsg, setDpoSaveMsg] = useState('');

  // Admin Credentials Change State
  const [adminUsernameEdit, setAdminUsernameEdit] = useState(() => StoreStorage.getAdminUsername());
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Search & Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Dogs' as Product['category'],
    price: 35.0,
    compareAtPrice: 48.0,
    description: '',
    stockCount: 20,
    image: '/src/assets/images/product_orthopedic_bed_1790283966759.jpg',
    features: 'Veterinarian Approved, Ultra Durable, Non-toxic',
    tags: 'Best Seller, Premium',
    isBundleEligible: true,
  });

  const [notificationStatusMsg, setNotificationStatusMsg] = useState('');

  useEffect(() => {
    setIsAuthenticated(StoreStorage.isAdminAuthenticated());
    loadData();
  }, []);

  const loadData = () => {
    setOrders(StoreStorage.getOrders());
    setProducts(StoreStorage.getProducts());
    setBundleOffer(StoreStorage.getBundleOffer());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (StoreStorage.adminLogin(passkey, username)) {
      setIsAuthenticated(true);
      setAuthError('');
      loadData();
    } else {
      setAuthError('Invalid Admin Credentials. Please verify your username and master password.');
    }
  };

  const handleLogout = () => {
    StoreStorage.adminLogout();
    setIsAuthenticated(false);
    setPasskey('');
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = StoreStorage.updateOrderStatus(orderId, newStatus);
    if (updated) {
      loadData();
      if (onOrderUpdated) onOrderUpdated(orderId);
      setNotificationStatusMsg(`Order #${orderId} marked as ${newStatus.toUpperCase()} & push notification dispatched!`);
      setTimeout(() => setNotificationStatusMsg(''), 4000);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Dogs',
      price: 35.0,
      compareAtPrice: 48.0,
      description: '',
      stockCount: 25,
      image: '/src/assets/images/product_orthopedic_bed_1790283966759.jpg',
      features: 'Veterinarian Tested, Ergonomic, Safe Materials',
      tags: 'Featured, Luxury',
      isBundleEligible: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice,
      description: prod.description,
      stockCount: prod.stockCount,
      image: prod.image,
      features: prod.features.join(', '),
      tags: prod.tags.join(', '),
      isBundleEligible: prod.isBundleEligible,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const featArray = productForm.features.split(',').map((s) => s.trim()).filter(Boolean);
    const tagArray = productForm.tags.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingProduct) {
      StoreStorage.updateProduct({
        ...editingProduct,
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        compareAtPrice: Number(productForm.compareAtPrice),
        description: productForm.description,
        stockCount: Number(productForm.stockCount),
        inStock: Number(productForm.stockCount) > 0,
        image: productForm.image,
        features: featArray,
        tags: tagArray,
        isBundleEligible: productForm.isBundleEligible,
      });
    } else {
      StoreStorage.addProduct({
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        compareAtPrice: Number(productForm.compareAtPrice),
        description: productForm.description,
        stockCount: Number(productForm.stockCount),
        inStock: Number(productForm.stockCount) > 0,
        image: productForm.image,
        features: featArray,
        tags: tagArray,
        isBundleEligible: productForm.isBundleEligible,
      });
    }

    setIsProductModalOpen(false);
    loadData();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product from the store catalog?')) {
      StoreStorage.deleteProduct(id);
      loadData();
    }
  };

  const handleToggleBundleActive = () => {
    if (!bundleOffer) return;
    const updated = { ...bundleOffer, active: !bundleOffer.active };
    StoreStorage.saveBundleOffer(updated);
    setBundleOffer(updated);
  };

  // Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-stone-900 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-display font-bold text-stone-900">
              LzgPaw Admin Control Path
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Private access link for store administration and order dispatch.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Admin Username or Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setAuthError('');
                }}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Admin Master Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setAuthError('');
                }}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-stone-900 font-mono"
              />
            </div>

            {authError && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Unlock Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onNavigateToStore && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onNavigateToStore}
                  className="text-xs text-stone-500 hover:text-stone-900 transition-colors font-medium cursor-pointer"
                >
                  ← Return to Storefront
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const grossRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalFreeGiftsAwarded = orders.reduce((sum, o) => sum + o.freeGifts.length, 0);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-stone-900">
              LzgPaw Admin Management Console
            </h1>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
              Live Session
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Private management console for products, live order tracking statuses, and customer updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToStore && (
            <button
              onClick={onNavigateToStore}
              className="px-3.5 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              ← Back to Store
            </button>
          )}
          <button
            onClick={loadData}
            className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg text-xs font-medium flex items-center gap-1.5"
            title="Refresh Store Data"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Live Status Toast Banner */}
      {notificationStatusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationStatusMsg}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Gross Revenue (DPO Pay)</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-1">
            ${grossRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">100% Captured via DPO</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Total Orders</span>
            <Package className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-1">
            {orders.length}
          </div>
          <span className="text-[11px] text-stone-500">Free Worldwide Delivery</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Active Products</span>
            <Edit3 className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-1">
            {products.length}
          </div>
          <span className="text-[11px] text-stone-500">Compare-at Pricing Active</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Bundle Perks Awarded</span>
            <Gift className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-1">
            {totalFreeGiftsAwarded}
          </div>
          <span className="text-[11px] text-amber-800 font-medium">Multi-Item Orders</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          Orders & Live Status ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'products'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('bundle')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'bundle'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          Multi-Item Bundle Rules
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>DPO Pay API Keys & Admin Passkey</span>
        </button>
      </div>

      {/* TAB 1: ORDERS & TRACKING MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, emails, tracking #..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Status Filter:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800"
              >
                <option value="all">All Statuses</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 font-semibold">Order ID</th>
                    <th className="p-3.5 font-semibold">Customer</th>
                    <th className="p-3.5 font-semibold">Items & Gift</th>
                    <th className="p-3.5 font-semibold">Total (DPO)</th>
                    <th className="p-3.5 font-semibold">Current Status</th>
                    <th className="p-3.5 font-semibold text-right">Update Status (Push Alert)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        No orders matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-stone-900 block">#{order.id}</span>
                          <span className="text-[11px] text-stone-400 font-mono block mt-0.5">
                            {order.trackingNumber}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-stone-900 block">{order.customer.name}</span>
                          <span className="text-stone-500 block text-[11px]">{order.customer.email}</span>
                          <span className="text-stone-400 block text-[10px] mt-0.5">
                            {order.customer.city}, {order.customer.country}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-stone-700 block font-medium">
                            {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                          </span>
                          {order.freeGifts.length > 0 && (
                            <span className="text-[10px] text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded font-semibold inline-block mt-0.5">
                              🎁 Free Paw Balm Included
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-stone-900">
                          ${order.total.toFixed(2)}
                          <span className="text-[10px] text-emerald-700 block font-sans font-medium">
                            Paid via DPO
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                              order.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.orderStatus === 'shipped' || order.orderStatus === 'out_for_delivery'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-stone-50 border border-stone-300 text-stone-800 font-medium rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-stone-900 cursor-pointer"
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Mark as Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT CATALOG MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Manage inventory, regular prices, compare-at discounts, and product images.
            </p>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Pet Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-stone-200 p-4 flex gap-3 relative shadow-xs"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/product_orthopedic_bed_1790283966759.jpg';
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] text-stone-500 font-medium">{prod.category}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                          title="Edit product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1 text-stone-400 hover:text-red-600"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-1 mt-0.5">
                      {prod.name}
                    </h4>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-stone-900">${prod.price.toFixed(2)}</span>
                      {prod.compareAtPrice > prod.price && (
                        <span className="font-mono text-stone-400 line-through text-[10px] ml-1.5">
                          ${prod.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        prod.stockCount > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {prod.stockCount > 0 ? `${prod.stockCount} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BUNDLE OFFER RULES */}
      {activeTab === 'bundle' && bundleOffer && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-2xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h3 className="font-display font-bold text-base text-stone-900">
                  Multi-Item Bundle Offer & Bonus Perks
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                When customers add 2 or more products to their cart, multi-item savings and a companion care perk are automatically activated at checkout.
              </p>
            </div>
            <button
              onClick={handleToggleBundleActive}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                bundleOffer.active
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-300 text-stone-700'
              }`}
            >
              {bundleOffer.active ? 'Offer is Active' : 'Offer Disabled'}
            </button>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3 text-xs">
            <div>
              <label className="block text-stone-600 mb-1 font-medium">Bonus Perk Title</label>
              <input
                type="text"
                value={bundleOffer.freeGift.name}
                onChange={(e) => {
                  const updated = {
                    ...bundleOffer,
                    freeGift: { ...bundleOffer.freeGift, name: e.target.value },
                  };
                  StoreStorage.saveBundleOffer(updated);
                  setBundleOffer(updated);
                }}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-medium">Perk Description</label>
              <input
                type="text"
                value={bundleOffer.freeGift.description}
                onChange={(e) => {
                  const updated = {
                    ...bundleOffer,
                    freeGift: { ...bundleOffer.freeGift, description: e.target.value },
                  };
                  StoreStorage.saveBundleOffer(updated);
                  setBundleOffer(updated);
                }}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Items Required to Unlock</label>
                <input
                  type="number"
                  value={bundleOffer.requiredQuantity}
                  onChange={(e) => {
                    const updated = {
                      ...bundleOffer,
                      requiredQuantity: Number(e.target.value),
                    };
                    StoreStorage.saveBundleOffer(updated);
                    setBundleOffer(updated);
                  }}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Bonus Value Attribution ($)</label>
                <input
                  type="number"
                  value={bundleOffer.freeGift.value}
                  onChange={(e) => {
                    const updated = {
                      ...bundleOffer,
                      freeGift: { ...bundleOffer.freeGift, value: Number(e.target.value) },
                    };
                    StoreStorage.saveBundleOffer(updated);
                    setBundleOffer(updated);
                  }}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DPO PAY API KEYS & ADMIN SECURITY */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          {/* DPO Pay API Key Management */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-800" />
                  <h3 className="font-display font-bold text-base text-stone-900">
                    DPO Pay (Direct Pay Online) API Configuration
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Weka hapa Company Token na Service Type ulizopokea kutoka kwa DPO Pay ili kupokea malipo moja kwa moja.
                </p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                dpoConfig.environment === 'production' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {dpoConfig.environment} Mode
              </span>
            </div>

            {dpoSaveMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{dpoSaveMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                DpoConfigService.saveCredentials(dpoConfig);
                setDpoSaveMsg('✓ DPO Pay API Credentials saved successfully! Ready for checkout tokenization.');
                setTimeout(() => setDpoSaveMsg(''), 4000);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Environment (Hali ya Gateway)
                  </label>
                  <select
                    value={dpoConfig.environment}
                    onChange={(e) => setDpoConfig({ ...dpoConfig, environment: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium cursor-pointer"
                  >
                    <option value="sandbox">Sandbox (Majaribio / Testing)</option>
                    <option value="production">Production (Mauzo Halisi / Live Sales)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Default Currency (Sarafu)
                  </label>
                  <select
                    value={dpoConfig.currency}
                    onChange={(e) => setDpoConfig({ ...dpoConfig, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium cursor-pointer"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="TZS">TZS (Tanzanian Shilling)</option>
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="ZAR">ZAR (South African Rand)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  DPO Company Token *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paste Company Token from DPO Group (e.g. 9F4164C9-C229-450F-BC9E-E2FB41775700)"
                  value={dpoConfig.companyToken}
                  onChange={(e) => setDpoConfig({ ...dpoConfig, companyToken: e.target.value.trim() })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono text-xs focus:ring-2 focus:ring-stone-900"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Hii ni Token maalum unayopewa na DPO Pay baada ya akaunti ya merchant kuidhinishwa.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  DPO Service Type Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 38549 or standard ecommerce service code"
                  value={dpoConfig.serviceType}
                  onChange={(e) => setDpoConfig({ ...dpoConfig, serviceType: e.target.value.trim() })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono text-xs focus:ring-2 focus:ring-stone-900"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Service type code kwa ajili ya mauzo ya mtandaoni (Online Goods / Retail).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save DPO API Settings</span>
                </button>

                <span className="text-[11px] text-stone-500">
                  Settings are encrypted & saved securely in merchant storage.
                </span>
              </div>
            </form>

            {/* Documentation & File Guide */}
            <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-800" />
                <span>Mwongozo wa Kuweka API Keys kwenye Files (.env au Config):</span>
              </h4>
              <p className="text-stone-600 leading-relaxed">
                Ukipenda kuweka funguo zako za DPO Pay kwenye files za msimbo badala ya hapa, unaweza kuziweka kwenye faili la <code className="bg-stone-200 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> au <code className="bg-stone-200 px-1.5 py-0.5 rounded font-mono text-[11px]">src/config/dpoConfig.ts</code>:
              </p>
              <pre className="p-3 bg-stone-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
{`# Weka kwenye faili la .env:
VITE_DPO_COMPANY_TOKEN="COMPANY_TOKEN_YAKO_HAPA"
VITE_DPO_SERVICE_TYPE="SERVICE_TYPE_YAKO_HAPA"
VITE_DPO_ENV="production"`}
              </pre>
            </div>
          </div>

          {/* Change Admin Master Credentials (Username & Password) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Lock className="w-5 h-5 text-stone-700" />
              <div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  Badilisha Taarifa za Kuingilia Admin (Username & Password)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Unaweza kubadilisha Jina la Admin (Username) na Nenosiri (Master Password) wakati wowote kwa usalama wako.
                </p>
              </div>
            </div>

            {passwordMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                
                // Validate Username
                if (adminUsernameEdit.trim().length < 3) {
                  setPasswordMsg('Username lazima iwe na angalau herufi 3.');
                  return;
                }

                // If password fields are filled, validate them
                if (newMasterPassword) {
                  if (newMasterPassword.length < 6) {
                    setPasswordMsg('Nenosiri lazima liwe na angalau herufi au namba 6.');
                    return;
                  }
                  if (newMasterPassword !== confirmMasterPassword) {
                    setPasswordMsg('Nenosiri jipya na la kurudia hayalingani.');
                    return;
                  }
                  StoreStorage.setAdminPassword(newMasterPassword);
                }

                StoreStorage.setAdminUsername(adminUsernameEdit.trim());
                setUsername(adminUsernameEdit.trim());
                setPasswordMsg('✓ Taarifa za Admin (Username & Password) zimehifadhiwa kikamilifu!');
                setNewMasterPassword('');
                setConfirmMasterPassword('');
                setTimeout(() => setPasswordMsg(''), 4000);
              }}
              className="space-y-4 text-xs max-w-md"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Admin Username (Jina la Kuingilia) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or pluziga"
                  value={adminUsernameEdit}
                  onChange={(e) => setAdminUsernameEdit(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium text-xs focus:ring-2 focus:ring-stone-900"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Hili ndilo jina utakalotumia unapoingia kwenye ukurasa huu wa Admin.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  New Master Password (Nenosiri Jipya)
                </label>
                <input
                  type="password"
                  placeholder="Weka nenosiri jipya (au acha tupu kubaki na la sasa)..."
                  value={newMasterPassword}
                  onChange={(e) => setNewMasterPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Confirm New Password (Rudia Nenosiri Jipya)
                </label>
                <input
                  type="password"
                  placeholder="Rudia nenosiri jipya..."
                  value={confirmMasterPassword}
                  onChange={(e) => setConfirmMasterPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Admin Credentials</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <h3 className="font-display font-bold text-lg text-stone-900">
              {editingProduct ? 'Edit Product' : 'Add New Pet Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Ergonomic Pet Feeder"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as Product['category'] })}
                    className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="Dogs">Dogs</option>
                    <option value="Cats">Cats</option>
                    <option value="Care & Grooming">Care & Grooming</option>
                    <option value="Toys & Accessories">Toys & Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Compare Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.compareAtPrice}
                    onChange={(e) => setProductForm({ ...productForm, compareAtPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Stock Inventory Units</label>
                  <input
                    type="number"
                    value={productForm.stockCount}
                    onChange={(e) => setProductForm({ ...productForm, stockCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Image Asset URL / Path</label>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Details regarding materials, vet approval, comfort..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Features (comma separated)</label>
                <input
                  type="text"
                  value={productForm.features}
                  onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-lg text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
