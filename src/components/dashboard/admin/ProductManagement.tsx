import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, Package, LayoutGrid, Loader2
} from 'lucide-react';
import { productsService, usersService, sitesService, infrastructureService } from '@/api';
import type { ProductEntity, UserEntity, SiteEntity, ColdRoomEntity } from '@/types/api.types';
import { ProductCategory, StockMovementType } from '@/types/api.types';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';

export const ProductManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [suppliers, setSuppliers] = useState<UserEntity[]>([]);
  const [sites, setSites] = useState<SiteEntity[]>([]);
  const [coldRooms, setColdRooms] = useState<ColdRoomEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, allUsers, allSites] = await Promise.all([
        productsService.getAllProducts(),
        usersService.getAllUsers(),
        sitesService.getAllSites()
      ]);
      setProducts(prods);
      setSuppliers(allUsers.filter(u => u.role === 'SUPPLIER'));
      setSites(allSites);
    } catch (error: any) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Standardized categories from enum
  const categoriesList = Object.values(ProductCategory).map((cat) => ({
    id: cat,
    name: cat,
    description: `All ${cat.replace('_', ' ').toLowerCase()} related products`
  }));

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductEntity | null>(null);
  const [productForm, setProductForm] = useState<Partial<ProductEntity>>({});
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<File | null>(null);
  const productImageInputRef = React.useRef<HTMLInputElement>(null);

  // Stock Adjustment State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    productId: '',
    movementType: 'IN' as StockMovementType,
    quantityKg: 0,
    reason: ''
  });

  useEffect(() => {
    if (productForm.siteId) {
      void infrastructureService.getColdRooms(productForm.siteId).then(setColdRooms);
    } else {
      setColdRooms([]);
    }
  }, [productForm.siteId]);

  const handleOpenProductModal = (product?: ProductEntity) => {
    if (product) {
      setEditingProduct(product);
      setProductForm(product);
      setProductImagePreview(product.imageUrl || null);
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: ProductCategory.VEGETABLES,
        sellingPricePerUnit: 0,
        quantityKg: 0,
        supplierId: '',
        siteId: user?.siteId || '',
        coldRoomId: '',
        description: '',
        unit: 'kg'
      });
      setProductImagePreview(null);
      setSelectedProductImage(null);
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.category || !productForm.supplierId || !productForm.siteId || !productForm.coldRoomId) {
      toast.error('Please fill in Name, Category, Supplier, Site and Cold Room');
      return;
    }

    try {
      if (selectedProductImage) {
        const formData = new FormData();
        formData.append('name', productForm.name!);
        formData.append('category', productForm.category!);
        formData.append('unit', productForm.unit || 'kg');
        formData.append('supplierId', productForm.supplierId!);
        formData.append('coldRoomId', productForm.coldRoomId!);
        formData.append('siteId', productForm.siteId!);
        formData.append('sellingPricePerUnit', String(productForm.sellingPricePerUnit));
        formData.append('description', productForm.description || '');
        formData.append('image', selectedProductImage);

        if (editingProduct) {
          await productsService.updateProduct(editingProduct.id, formData);
          toast.success('Product updated with new image');
        } else {
          formData.append('quantityKg', String(productForm.quantityKg));
          await productsService.createProduct(formData);
          toast.success('Product added with image');
        }
      } else {
        // Fallback to JSON if no new image selected
        const payload = {
          name: productForm.name,
          category: productForm.category,
          quantityKg: productForm.quantityKg,
          unit: productForm.unit || 'kg',
          supplierId: productForm.supplierId,
          coldRoomId: productForm.coldRoomId,
          siteId: productForm.siteId,
          sellingPricePerUnit: productForm.sellingPricePerUnit,
          imageUrl: productForm.imageUrl,
          description: productForm.description,
        };

        if (editingProduct) {
          const { quantityKg, ...updatePayload } = payload;
          await productsService.updateProduct(editingProduct.id, updatePayload as any);
          toast.success('Product updated');
        } else {
          await productsService.createProduct(payload as any);
          toast.success('Product added');
        }
      }
      fetchData();
      setIsProductModalOpen(false);
      setSelectedProductImage(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsService.deleteProduct(id);
        toast.success('Product deleted');
        fetchData();
      } catch (error: any) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter((p: ProductEntity) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCategories = categoriesList.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getSupplierName = (id: string) => {
    const s = suppliers.find((u: UserEntity) => u.id === id);
    return s ? `${s.firstName} ${s.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Inventory & Products</h2>
          <p className="text-gray-500 text-sm">Manage the marketplace catalog and categories</p>
        </div>
        <button
          onClick={() => activeTab === 'PRODUCTS' ? handleOpenProductModal() : toast.info('Category management is handled via products.')}
          className="flex items-center gap-2 bg-[#1a4d2e] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#143d24] transition-colors shadow-lg shadow-[#1a4d2e]/20"
        >
          <Plus className="w-4 h-4" /> {activeTab === 'PRODUCTS' ? 'Add Product' : 'Add Category'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'PRODUCTS' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CATEGORIES' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Categories
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#38a169]/20 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#1a4d2e] animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Marketplace...</p>
        </div>
      ) : activeTab === 'PRODUCTS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-[#38a169]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#38a169] overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{product.name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.category}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => {
                    setAdjustData({ productId: product.id, movementType: 'IN' as StockMovementType, quantityKg: 0, reason: '' });
                    setIsAdjustModalOpen(true);
                  }} className="p-2 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-lg" title="Adjust Stock">
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleOpenProductModal(product)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Price</span>
                  <span className="font-black text-[#1a4d2e]">{(product.sellingPricePerUnit || 0).toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Stock</span>
                  <span className={`font-black ${product.quantityKg < 50 ? 'text-red-500' : 'text-gray-900'}`}>{product.quantityKg} kg</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-50">
                  <span className="text-gray-500 font-medium text-xs uppercase tracking-tighter">Supplier</span>
                  <span className="font-bold text-gray-700 text-xs truncate max-w-[120px]">{getSupplierName(product.supplierId)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-[#38a169]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-gray-900">{cat.name}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{cat.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {products.filter((p: ProductEntity) => p.category === cat.name).length} Products
                </span>
                <button disabled className="text-gray-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 z-10">
              <h3 className="text-xl font-black text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name || ''}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                  <select
                    value={productForm.category || ''}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-bold"
                  >
                    {Object.values(ProductCategory).map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Supplier</label>
                  <select
                    value={productForm.supplierId || ''}
                    onChange={e => setProductForm({ ...productForm, supplierId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-bold"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((u: UserEntity) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Site / Hub</label>
                  <select
                    value={productForm.siteId || ''}
                    onChange={e => setProductForm({ ...productForm, siteId: e.target.value, coldRoomId: '' })}
                    disabled={user?.role === 'SITE_MANAGER'}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-bold disabled:opacity-50"
                  >
                    <option value="">Select Site</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cold Room</label>
                  <select
                    value={productForm.coldRoomId || ''}
                    onChange={e => setProductForm({ ...productForm, coldRoomId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-bold"
                    required
                  >
                    <option value="">Select Cold Room</option>
                    {coldRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Price (Rwf)</label>
                    <input
                      type="number"
                      value={productForm.sellingPricePerUnit || 0}
                      onChange={e => setProductForm({ ...productForm, sellingPricePerUnit: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Initial Stock (kg)</label>
                    <input
                      type="number"
                      value={productForm.quantityKg || 0}
                      disabled={!!editingProduct}
                      onChange={e => setProductForm({ ...productForm, quantityKg: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-bold disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Product Image</label>
                  <div
                    onClick={() => productImageInputRef.current?.click()}
                    className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative group"
                  >
                    {productImagePreview ? (
                      <>
                        <img src={productImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Package className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload from Device</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={productImageInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedProductImage(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProductImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={productForm.description || ''}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium h-32 resize-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full py-4 bg-[#1a4d2e] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#1a4d2e]/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                  {editingProduct ? 'Update Product Metadata' : 'Register Agricultural Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">Adjust Stock Level</h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await productsService.adjustStock(adjustData.productId, {
                  movementType: adjustData.movementType,
                  quantityKg: adjustData.quantityKg,
                  reason: adjustData.reason
                });
                toast.success('Stock adjusted successfully');
                setIsAdjustModalOpen(false);
                fetchData();
              } catch (error: any) {
                toast.error(error.message || 'Failed to adjust stock');
              }
            }} className="space-y-6">
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjustData({ ...adjustData, movementType: 'IN' as StockMovementType })}
                  className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${adjustData.movementType === 'IN' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}
                >
                  Stock In (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustData({ ...adjustData, movementType: 'OUT' as StockMovementType })}
                  className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${adjustData.movementType === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
                >
                  Stock Out (-)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Quantity (kg)</label>
                <input
                  type="number"
                  value={adjustData.quantityKg}
                  onChange={e => setAdjustData({ ...adjustData, quantityKg: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-black text-center text-2xl"
                  required
                  min="0.1"
                  step="0.1"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Adjustment Reason</label>
                <textarea
                  value={adjustData.reason}
                  onChange={e => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="e.g., Bulk delivery, Quality audit, Return..."
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium h-24 resize-none"
                  required
                />
              </div>

              <button type="submit" className="w-full py-4 bg-[#1a4d2e] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#1a4d2e]/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                Confirm {adjustData.movementType === 'IN' ? 'Addition' : 'Deduction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
