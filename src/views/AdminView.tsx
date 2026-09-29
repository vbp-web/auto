import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Tag,
  Star,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Product, Order, Coupon, Review } from '../types/index.ts';
import { useToast } from '../context/ToastContext.tsx';

interface AdminViewProps {
  onBackToStore: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToStore }) => {
  const { user, quickLoginDemo } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'inventory' | 'coupons' | 'reviews'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('ApexFit Precision');
  const [prodCategory, setProdCategory] = useState('Interior');
  const [prodPrice, setProdPrice] = useState(3999);
  const [prodMrp, setProdMrp] = useState(5999);
  const [prodStock, setProdStock] = useState(25);
  const [prodSku, setProdSku] = useState('APX-MOD-01');

  // Add Coupon Modal
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [coupCode, setCoupCode] = useState('');
  const [coupDiscount, setCoupDiscount] = useState(15);
  const [coupMinOrder, setCoupMinOrder] = useState(2000);
  const [coupMaxDiscount, setCoupMaxDiscount] = useState(800);

  useEffect(() => {
    async function loadAdminData() {
      if (user?.role !== 'ADMIN') {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [an, prods, ords, coups, revs] = await Promise.all([
          api.admin.getAnalytics(),
          api.admin.getInventory(),
          api.orders.getAll(),
          api.coupons.getAll(),
          api.admin.getReviews()
        ]);
        setAnalytics(an);
        setProducts(prods);
        setOrders(ords);
        setCoupons(coups);
        setReviews(revs);
      } catch (err) {
        console.error('Failed loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 border border-red-200 dark:border-red-900 dark:text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Sign in using the pre-seeded demo administrator credentials to manage products, inventory, orders, and view live analytics.
        </p>
        <button
          onClick={() => quickLoginDemo('ADMIN')}
          className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-red-600/20 cursor-pointer"
        >
          Sign in as Admin (admin@example.com)
        </button>
      </div>
    );
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updated = await api.orders.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      success('Order Updated', `Status changed to ${status}`);
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      success('Product Deleted', 'Item removed from catalog.');
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const handleStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      const updated = await api.products.update(product.id, {
        stock: newStock,
        stockStatus: newStock === 0 ? 'OUT_OF_STOCK' : newStock <= product.lowStockThreshold ? 'LOW_STOCK' : 'IN_STOCK'
      });
      setProducts(prev => prev.map(p => (p.id === product.id ? updated : p)));
    } catch (err: any) {
      error('Stock Update Failed', err.message);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.products.create({
        name: prodName,
        brand: prodBrand,
        category: prodCategory,
        subcategory: 'Custom Accessories',
        price: prodPrice,
        mrp: prodMrp,
        stock: prodStock,
        sku: prodSku,
        description: `${prodName} engineered with automotive precision.`,
        universalFit: true,
        warranty: '2 Years Manufacturer Warranty',
        deliveryDays: 3
      });
      setProducts(prev => [created, ...prev]);
      setShowAddProductModal(false);
      success('Product Added', `${created.name} is now live.`);
      setProdName('');
    } catch (err: any) {
      error('Creation Failed', err.message);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.coupons.create({
        code: coupCode,
        discountType: 'PERCENTAGE',
        discountValue: coupDiscount,
        minOrderAmount: coupMinOrder,
        maxDiscountAmount: coupMaxDiscount,
        description: `${coupDiscount}% off up to ₹${coupMaxDiscount}`
      });
      setCoupons(prev => [...prev, created]);
      setShowAddCouponModal(false);
      success('Coupon Created', `Code ${created.code} is active.`);
      setCoupCode('');
    } catch (err: any) {
      error('Creation Failed', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-zinc-950 dark:text-white font-display">AutoApex Admin Console</span>
            <span className="text-[10px] font-mono uppercase bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded font-semibold">
              CONTROL ROOM
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Manage catalog, real-time inventory, Razorpay payments, and dispatch timelines.</p>
        </div>

        <button
          onClick={onBackToStore}
          className="px-3.5 py-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors cursor-pointer"
        >
          Exit to Customer Store
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-850 text-xs font-semibold">
        {[
          { id: 'analytics', label: 'Dashboard & Revenue', icon: LayoutDashboard },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
          { id: 'inventory', label: 'Inventory & Stock Alerts', icon: Boxes },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-sm">
              <span className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider block">Total Revenue</span>
              <span className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums mt-1 block">
                ₹{analytics.totalRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">Verified via Razorpay</span>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-sm">
              <span className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider block">Total Orders</span>
              <span className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums mt-1 block">
                {analytics.totalOrders}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-1">Delhivery Automated Dispatch</span>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-sm">
              <span className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider block">Total Customers</span>
              <span className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums mt-1 block">
                {analytics.totalCustomers}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-1">Active Accounts</span>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-sm">
              <span className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider block">Low Stock Alerts</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums mt-1 block">
                {analytics.lowStockCount} Items
              </span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-500/80 block mt-1">Replenishment Needed</span>
            </div>
          </div>

          {/* Revenue Chart Trend */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              7-Day Net Sales Volume (₹)
            </h3>
            <div className="grid grid-cols-7 gap-2 h-44 items-end pt-4">
              {analytics.revenueTimeline.map((item: any) => (
                <div key={item.date} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums font-mono">₹{(item.revenue / 1000).toFixed(1)}k</span>
                  <div
                    className="w-full bg-red-600 rounded-t-lg transition-all duration-300 hover:bg-red-500"
                    style={{ height: `${Math.max(15, (item.revenue / 45000) * 100)}%` }}
                  />
                  <span className="text-[10px] text-zinc-500">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Catalog Inventory</h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-850">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img src={prod.thumbnail} alt="" className="w-9 h-9 rounded object-cover bg-zinc-100 dark:bg-zinc-950 shrink-0 border border-zinc-200 dark:border-zinc-800" />
                        <div>
                          <span className="font-semibold text-zinc-900 dark:text-white block line-clamp-1">{prod.name}</span>
                          <span className="text-[10px] text-zinc-500">{prod.brand}</span>
                        </div>
                      </td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-300">{prod.category}</td>
                      <td className="p-3 font-mono text-zinc-500 dark:text-zinc-400">{prod.sku}</td>
                      <td className="p-3 font-bold text-zinc-950 dark:text-white tabular-nums">₹{prod.price.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            prod.stockStatus === 'IN_STOCK'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-900'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Orders Tab with Status Stepper */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Customer Shipments & Status</h3>

          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-3 text-xs shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="font-bold text-zinc-950 dark:text-white text-sm">Order #{order.orderNumber}</span>
                    <span className="text-zinc-500 block text-[11px] mt-0.5">
                      Customer: {order.customerName} ({order.customerPhone}) · Total: ₹{order.total.toLocaleString()}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Update Status:</span>
                    <select
                      value={order.orderStatus}
                      onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-900 dark:text-white font-semibold"
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {order.items.map((it, i) => (
                    <span key={i} className="bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-850">
                      {it.name} (x{it.quantity})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Live Inventory Controller</h3>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-850">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3">Threshold</th>
                  <th className="p-3 text-right">Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {products.map(prod => (
                  <tr key={prod.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition-colors">
                    <td className="p-3 font-semibold text-zinc-900 dark:text-white">{prod.name}</td>
                    <td className="p-3 font-mono text-zinc-500 dark:text-zinc-400">{prod.sku}</td>
                    <td className="p-3">
                      <span className={`font-bold tabular-nums ${prod.stock <= prod.lowStockThreshold ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500 tabular-nums">{prod.lowStockThreshold}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStockAdjust(prod, -5)}
                          className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded text-xs transition-colors"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleStockAdjust(prod, -1)}
                          className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded text-xs transition-colors"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStockAdjust(prod, 1)}
                          className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded text-xs transition-colors"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleStockAdjust(prod, 10)}
                          className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-emerald-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-emerald-400 rounded text-xs font-bold transition-colors"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Active Promotional Coupons</h3>
            <button
              onClick={() => setShowAddCouponModal(true)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map(c => (
              <div key={c.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-2 text-xs shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">ACTIVE</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">{c.description}</p>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850 text-[11px] text-zinc-500 space-y-0.5">
                  <p>Min Order: ₹{c.minOrderAmount.toLocaleString()}</p>
                  <p>Max Discount: ₹{c.maxDiscountAmount.toLocaleString()}</p>
                  <p>Used: {c.usedCount} / {c.usageLimit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Customer Feedback Moderation</h3>
          <div className="space-y-3">
            {reviews.map(rev => (
              <div key={rev.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-950 dark:text-white">{rev.userName}</span>
                    <span className="text-zinc-500 ml-2">Rating: {rev.rating}/5</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900 font-semibold">
                    APPROVED
                  </span>
                </div>
                <h5 className="font-semibold text-zinc-800 dark:text-zinc-200">{rev.title}</h5>
                <p className="text-zinc-600 dark:text-zinc-400">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddProductModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <form
            onSubmit={handleCreateProduct}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 text-xs shadow-2xl transition-colors"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Create New Accessory</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Product Title</label>
              <input
                type="text"
                value={prodName}
                onChange={e => setProdName(e.target.value)}
                placeholder="e.g. ApexGrip Carbon Steering Wrap"
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Category</label>
                <select
                  value={prodCategory}
                  onChange={e => setProdCategory(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white"
                >
                  <option value="Interior">Interior</option>
                  <option value="Exterior">Exterior</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Car Care">Car Care</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">SKU</label>
                <input
                  type="text"
                  value={prodSku}
                  onChange={e => setProdSku(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={prodPrice}
                  onChange={e => setProdPrice(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">MRP (₹)</label>
                <input
                  type="number"
                  value={prodMrp}
                  onChange={e => setProdMrp(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Initial Stock</label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={e => setProdStock(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-md shadow-red-600/20 cursor-pointer"
            >
              Publish Product to Storefront
            </button>
          </form>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddCouponModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <form
            onSubmit={handleCreateCoupon}
            className="relative w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-3 text-xs shadow-2xl transition-colors"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Create Discount Code</h3>
              <button onClick={() => setShowAddCouponModal(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Coupon Code</label>
              <input
                type="text"
                value={coupCode}
                onChange={e => setCoupCode(e.target.value.toUpperCase())}
                placeholder="e.g. MONSOON20"
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-2 text-zinc-900 dark:text-white uppercase font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={coupDiscount}
                  onChange={e => setCoupDiscount(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-2 text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Max Cap (₹)</label>
                <input
                  type="number"
                  value={coupMaxDiscount}
                  onChange={e => setCoupMaxDiscount(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-2 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded mt-2 shadow-md shadow-red-600/20 cursor-pointer"
            >
              Activate Coupon
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
