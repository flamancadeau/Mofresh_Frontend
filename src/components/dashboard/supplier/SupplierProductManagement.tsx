import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Package, ImageIcon, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { productsService, sitesService } from '@/api';
import type { ProductEntity, SiteEntity } from '@/types/api.types';
import { ProductCategory } from '@/types/api.types';

export const SupplierProductManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [sites, setSites] = useState<SiteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductEntity | null>(null);

  const [formData, setFormData] = useState<Partial<ProductEntity>>({
    name: '',
    sellingPricePerUnit: 0,
    quantityKg: 0,
    category: ProductCategory.VEGETABLES,
    isActive: true,
    imageUrl: '',
    siteId: '',
    description: '',
    unit: 'kg'
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allProds, allSites] = await Promise.all([
        productsService.getAllProducts(),
        sitesService.getAllSites()
      ]);
      // Filter products for this supplier
      setProducts(allProds.filter(p => p.supplierId === user?.id));
      setSites(allSites);
    } catch (error: any) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const supplierProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (product?: ProductEntity) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
      setImagePreview(product.imageUrl || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sellingPricePerUnit: 0,
        quantityKg: 0,
        category: ProductCategory.VEGETABLES,
        isActive: true,
        imageUrl: '',
        siteId: sites[0]?.id || '',
        description: '',
        supplierId: user?.id,
        unit: 'kg'
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.siteId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, {
          ...formData,
          price: undefined,
          image: undefined
        } as any);
        toast.success('Product updated successfully');
      } else {
        await productsService.createProduct({
          ...formData,
          supplierId: user?.id
        } as any);
        toast.success('Product listed in marketplace');
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        await productsService.deleteProduct(id);
        toast.success('Product deleted');
        fetchData();
      } catch (error: any) {
        toast.error('Failed to delete product');
      }
    }
  };

  const getSiteName = (id: string) => sites.find(s => s.id === id)?.name || 'Central';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">My <span className="text-[#38a169]">Products</span></h2>
          <p className="text-gray-500 text-sm">Manage your inventory and marketplace listings</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#1a4d2e] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#143d24] transition-all shadow-lg shadow-[#1a4d2e]/20"
        >
          <Plus className="w-5 h-5" /> List New Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search my products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#38a169]/5 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#2E8B2E] animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supplierProducts.map(product => (
            <motion.div
              key={product.id}
              layout
              className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group hover:border-[#38a169]/30 transition-all hover:shadow-xl hover:shadow-gray-200/50"
            >
              <div className="h-48 bg-gray-50 relative overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <Package className="w-12 h-12" />
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2">No Image</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenModal(product)} className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-600 rounded-xl transition-all shadow-sm">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-500 rounded-xl transition-all shadow-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{product.name}</h3>
                    <span className="text-sm font-black text-[#1a4d2e]">{(product.sellingPricePerUnit || 0).toLocaleString()} Rwf</span>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{product.category}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400">Inventory Presence</span>
                    <span className={product.quantityKg < 50 ? 'text-red-500' : 'text-green-600'}>{product.quantityKg} kg available</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${product.quantityKg < 50 ? 'bg-orange-400' : 'bg-[#38a169]'}`}
                      style={{ width: `${Math.min((product.quantityKg / 1000) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{getSiteName(product.siteId || '')}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${product.isActive ? 'bg-green-50 text-[#38a169]' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {supplierProducts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No products listed in your marketplace catalog</p>
            </div>
          )}
        </div>
      )}

      {/* Product List Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-black text-gray-900">{editingProduct ? 'Edit Listing' : 'List New Product'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#38a169]/20 outline-none font-bold"
                    placeholder="e.g., Organic Red Potatoes"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#38a169]/20 outline-none font-bold"
                    >
                      <option value={ProductCategory.VEGETABLES}>Vegetables</option>
                      <option value={ProductCategory.FRESH_FRUITS}>Fruits</option>
                      <option value={ProductCategory.DAIRY}>Dairy</option>
                      <option value={ProductCategory.MEAT}>Meat</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Drop-off Hub</label>
                    <select
                      value={formData.siteId}
                      onChange={e => setFormData({ ...formData, siteId: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#38a169]/20 outline-none font-bold"
                    >
                      <option value="">Select Hub</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (Rwf)</label>
                    <input
                      type="number"
                      value={formData.sellingPricePerUnit || 0}
                      onChange={e => setFormData({ ...formData, sellingPricePerUnit: Number(e.target.value) })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#38a169]/20 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Level (kg)</label>
                    <input
                      type="number"
                      value={formData.quantityKg || 0}
                      onChange={e => setFormData({ ...formData, quantityKg: Number(e.target.value) })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#38a169]/20 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#38a169]/20 outline-none font-medium h-24 resize-none"
                    placeholder="Provide details about quality, harvest date, etc."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Image</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative group"
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload From Device</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                <button type="submit" className="w-full py-5 bg-[#1a4d2e] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#1a4d2e]/20 hover:bg-[#143d24] transition-all flex items-center justify-center gap-2">
                  {editingProduct ? 'Update Product' : 'Confirm Marketplace Listing'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
