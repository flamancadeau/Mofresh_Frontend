import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/cartSlice';
import { useNavigate, Link } from 'react-router';
import { Plus, Star, ChevronRight, Loader2 } from 'lucide-react';
import { productsService, sitesService } from '@/api';
import type { ProductEntity, SiteEntity } from '@/types/api.types';
import { ProductCategory } from '@/types/api.types';
import { toast } from 'sonner';

// Category images
import cat1 from '@/assets/vegetables.png';
import cat2 from '@/assets/meat.png';
import cat3 from '@/assets/fruits.png';
import cat4 from '@/assets/freezer.png';

import pro1 from '@/assets/brocoli.png';

interface ProductDisplay extends ProductEntity {
  badge?: string | null;
  badgeColor?: string;
  rating: number;
  unit: string;
}

function ViewAll() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [sites, setSites] = useState<SiteEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryOptions = [
    { value: ProductCategory.VEGETABLES, label: t('vegetables'), image: cat1 },
    { value: ProductCategory.MEAT, label: t('meat'), image: cat2 },
    { value: ProductCategory.FRESH_FRUITS, label: t('fruits'), image: cat3 },
    { value: ProductCategory.DAIRY, label: t('dairy'), image: pro1 }, // Temporary img
    { value: ProductCategory.MEDECINE, label: t('medecine'), image: cat4 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, sitesData] = await Promise.all([
          productsService.getAllPublicProducts(),
          sitesService.getAllSites()
        ]);

        // Add mock rating and badges for display purposes since backend doesn't have them yet
        const displayProducts = productsData.map(p => ({
          ...p,
          rating: 4 + Math.floor(Math.random() * 2),
          badge: p.quantityKg < 10 ? t('lowStock') : null,
          badgeColor: 'bg-orange-400',
          unit: p.unit || 'Kg'
        }));

        setProducts(displayProducts);
        setSites(sitesData);
      } catch (error) {
        console.error('Failed to fetch marketplace data:', error);
        toast.error('Failed to load marketplace data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === null || product.category === selectedCategory;
    const locationMatch = selectedLocation === null || product.siteId === selectedLocation;
    return categoryMatch && locationMatch;
  });

  const handleAddToCart = (product: ProductDisplay) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.sellingPricePerUnit,
      image: product.imageUrl || pro1,
      unit: product.unit
    }));
    navigate('/cart');
  };

  return (
    <>
      <Header />
      <main className="w-full bg-white dark:bg-gray-900">
        {/* Breadcrumb */}
        <div className="w-full max-w-[1728px] mx-auto px-4 sm:px-8 lg:px-16 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-[#2d6a4f] dark:hover:text-[#9be15d]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/view-all" className="hover:text-[#2d6a4f] dark:hover:text-[#9be15d]">Marketplace</Link>
            {selectedCategory && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#2d6a4f] dark:text-[#9be15d] font-semibold">
                  {categoryOptions.find(c => c.value === selectedCategory)?.label}
                </span>
              </>
            )}
            {selectedLocation && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#2d6a4f] dark:text-[#9be15d] font-semibold">
                  {sites.find(s => s.id === selectedLocation)?.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-[1728px] mx-auto px-4 sm:px-8 lg:px-16 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Categories</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === null}
                        onChange={() => setSelectedCategory(null)}
                        className="w-4 h-4 border-gray-300 text-[#2E8B2E] focus:ring-[#2E8B2E]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#2E8B2E]">All Products</span>
                    </label>
                    {categoryOptions.map((category) => (
                      <label key={category.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.value}
                          onChange={() => setSelectedCategory(category.value)}
                          className="w-4 h-4 border-gray-300 text-[#2E8B2E] focus:ring-[#2E8B2E]"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#2E8B2E]">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Locations</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="location"
                        checked={selectedLocation === null}
                        onChange={() => setSelectedLocation(null)}
                        className="w-4 h-4 border-gray-300 text-[#2E8B2E] focus:ring-[#2E8B2E]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#2E8B2E]">All Locations</span>
                    </label>
                    {sites.map((site) => (
                      <label key={site.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="location"
                          checked={selectedLocation === site.id}
                          onChange={() => setSelectedLocation(site.id)}
                          className="w-4 h-4 border-gray-300 text-[#2E8B2E] focus:ring-[#2E8B2E]"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#2E8B2E]">{site.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Mobile Filter Grid */}
              <div className="lg:hidden grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select
                    value={selectedCategory === null ? 'all' : selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value === 'all' ? null : e.target.value as ProductCategory)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-[#2E8B2E]/20 outline-none transition-all"
                  >
                    <option value="all">All Products</option>
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Location</label>
                  <select
                    value={selectedLocation === null ? 'all' : selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value === 'all' ? null : e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-[#2E8B2E]/20 outline-none transition-all"
                  >
                    <option value="all">All Locations</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Showing <span className="text-[#2E8B2E]">{filteredProducts.length}</span> Results
                </p>
                {(selectedCategory || selectedLocation) && (
                  <button
                    onClick={() => { setSelectedCategory(null); setSelectedLocation(null); }}
                    className="text-xs font-black text-[#2E8B2E] uppercase tracking-widest hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Loader2 className="w-10 h-10 text-[#2E8B2E] animate-spin mb-4" />
                  <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-sm">
                    Loading Marketplace...
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-sm">
                    No products found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-[#2E8B2E] flex flex-col"
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden aspect-square bg-gray-50 dark:bg-gray-900/50 p-4">
                        <img
                          src={product.imageUrl || pro1}
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                        {product.badge && (
                          <div
                            className={`absolute top-4 right-4 ${product.badgeColor} text-[10px] font-black uppercase tracking-widest text-gray-900 px-3 py-1.5 rounded-full shadow-sm`}
                          >
                            {product.badge}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col p-4 sm:p-5">
                        <div className="mb-2">
                          <span className="text-[10px] font-black text-[#2E8B2E] uppercase tracking-widest">
                            {sites.find(s => s.id === product.siteId)?.name}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1 line-clamp-1">
                            {product.name}
                          </h3>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < product.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200 dark:text-gray-700'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 ml-1">
                            ({product.rating}.0)
                          </span>
                        </div>

                        {/* Price & Action */}
                        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between gap-4">
                          <div>
                            <span className="text-lg font-black text-gray-900 dark:text-white">
                              {product.sellingPricePerUnit.toLocaleString()} Rwf
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                              / {product.unit}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-10 h-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center hover:bg-[#2E8B2E] dark:hover:bg-[#2E8B2E] hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ViewAll;
