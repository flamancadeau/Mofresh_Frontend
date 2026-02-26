import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  ArrowRightLeft,
  Plus,
  Loader2,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { productsService, sitesService } from '@/api';
import type { ProductEntity, SiteEntity, StockMovementType } from '@/types/api.types';

export const HubInventory: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [sites, setSites] = useState<SiteEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'MOVEMENTS'>('PRODUCTS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductEntity | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    quantityKg: 0,
    unit: '',
    sellingPricePerUnit: 0,
    supplierId: '',
    coldRoomId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, sts, movs] = await Promise.all([
        productsService.getAllProducts({ siteId: user?.siteId || undefined }),
        sitesService.getAllSites(),
        productsService.getStockMovements({ siteId: user?.siteId || undefined })
      ]);
      setProducts(prods);
      setSites(sts);
      setMovements(movs);
    } catch (error: any) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.siteId]);

  // Find the site this manager is responsible for
  const managerSite = sites.find(s => s.id === user?.siteId);

  const hubProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStockUpdate = async (product: ProductEntity, adjustment: number) => {
    try {
      const type: StockMovementType = adjustment > 0 ? 'IN' as StockMovementType : 'OUT' as StockMovementType;
      await productsService.adjustStock(product.id, {
        movementType: type,
        quantityKg: Math.abs(adjustment),
        reason: `${type} adjustment by ${user?.firstName || 'Manager'}`
      });

      toast.success(`${adjustment > 0 ? 'Stock In' : 'Stock Out'} processed`);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stock');
    }
  };

  const handleOpenProductModal = (product?: ProductEntity) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        category: product.category,
        quantityKg: product.quantityKg,
        unit: product.unit,
        sellingPricePerUnit: product.sellingPricePerUnit,
        supplierId: product.supplierId,
        coldRoomId: product.coldRoomId || '',
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        category: '',
        quantityKg: 0,
        unit: 'KG',
        sellingPricePerUnit: 0,
        supplierId: user?.id || '',
        coldRoomId: '',
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, productForm);
        toast.success('Product updated successfully');
      } else {
        await productsService.createProduct({
          ...productForm,
          siteId: user?.siteId || '',
          imageUrl: '',
        });
        toast.success('Product added successfully');
      }
      await fetchData();
      setIsProductModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg font-black uppercase tracking-tighter border border-gray-200">
              {managerSite?.name || 'Kigali Central Hub'}
            </span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">Inventory</h2>
          <p className="text-gray-500 text-sm font-medium">Manage products and track stock movements</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
            <ArrowRightLeft className="w-4 h-4" /> Stock Movement
          </button>
          <button
            onClick={() => handleOpenProductModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#38a169] text-white rounded-xl font-bold text-sm hover:bg-[#2f855a] transition-all shadow-lg shadow-green-900/20"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#2E8B2E] animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Inventory...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('PRODUCTS')}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'PRODUCTS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('MOVEMENTS')}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'MOVEMENTS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Stock Movements
              </button>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#38a169]/20 outline-none transition-all"
                />
              </div>
              <select
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none cursor-pointer hover:border-gray-300"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'PRODUCTS' ? (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                        <th className="px-8 py-5">Product</th>
                        <th className="px-8 py-5">Category</th>
                        <th className="px-8 py-5">Quantity</th>
                        <th className="px-8 py-5">Price</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium">
                      {hubProducts.map((p) => (
                        <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center overflow-hidden shrink-0">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {p.id.slice(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm text-gray-600">{p.category}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleStockUpdate(p, -5)}
                                className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                              >
                                <ArrowDownLeft className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-bold text-gray-900 w-12 text-center">{p.quantityKg} kg</span>
                              <button
                                onClick={() => handleStockUpdate(p, 5)}
                                className="p-1 hover:bg-green-50 text-green-600 rounded transition-colors"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm text-gray-600">RF {(p.sellingPricePerUnit || 0).toLocaleString()}/kg</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenProductModal(p)}
                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-400 hover:text-blue-600"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {hubProducts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                            No active product inventory at this hub location
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="movements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {movements.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                          <th className="px-8 py-5">Product ID</th>
                          <th className="px-8 py-5">Type</th>
                          <th className="px-8 py-5">Quantity</th>
                          <th className="px-8 py-5">Reason</th>
                          <th className="px-8 py-5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-medium">
                        {movements.map((m) => (
                          <tr key={m.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-5 font-bold text-gray-800 text-sm">{m.productId.slice(0, 8).toUpperCase()}</td>
                            <td className="px-8 py-5">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${m.movementType === 'IN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {m.movementType}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-sm font-bold text-gray-900">{m.quantityKg} kg</td>
                            <td className="px-8 py-5 text-sm text-gray-600">{m.reason}</td>
                            <td className="px-8 py-5 text-xs text-gray-400 font-bold">{new Date(m.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ArrowRightLeft className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Stock Movements History</h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-sm">No inventory transactions have been recorded yet.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {managerSite?.name || 'Your Hub'}
                  </p>
                </div>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name *</label>
                  <input
                    required
                    type="text"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                    placeholder="e.g. Fresh Tomatoes"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800 resize-none"
                    rows={3}
                    placeholder="Product description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category *</label>
                    <input
                      required
                      type="text"
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                      placeholder="Vegetables, Fruits, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit *</label>
                    <select
                      required
                      value={productForm.unit}
                      onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                    >
                      <option value="">Select...</option>
                      <option value="KG">Kilogram (KG)</option>
                      <option value="LITRE">Litre (L)</option>
                      <option value="PIECE">Piece</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity (kg) *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={productForm.quantityKg}
                      onChange={e => setProductForm({ ...productForm, quantityKg: parseFloat(e.target.value) })}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price per Unit (Rwf) *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={productForm.sellingPricePerUnit}
                      onChange={e => setProductForm({ ...productForm, sellingPricePerUnit: parseFloat(e.target.value) })}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                      placeholder="1500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex-1 py-4 border border-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-[#38a169] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#2f855a] transition-all shadow-lg shadow-green-900/20"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
