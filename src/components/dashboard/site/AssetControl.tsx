import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Thermometer,
  ShieldCheck,
  Box,
  Truck,
  Plus,
  Trash2,
  Edit3,
  X,
  MapPin,
  ImageIcon,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { infrastructureService, logisticsService, sitesService } from '@/api';
import type {
  AssetStatus,
  AssetType,
  ColdBoxEntity,
  ColdPlateEntity,
  ColdRoomEntity,
  SiteEntity,
  TricycleEntity,
  PowerType,
} from '@/types/api.types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';




type AssetViewType = 'COLD_ROOM' | 'COLD_BOX' | 'COLD_PLATE' | 'TRICYCLE';

interface AssetView {
  id: string;
  name: string;
  type: AssetViewType;
  status: AssetStatus | string;
  siteId?: string;
  temperature?: number;
  health: number;
  imageUrl?: string;
  lastService?: string;
  // Cold Room specific
  totalCapacityKg?: number;
  usedCapacityKg?: number;
  temperatureMin?: number;
  temperatureMax?: number;
  powerType?: PowerType;
  // Cold Box specific
  identificationNumber?: string;
  sizeOrCapacity?: string;
  location?: string;
  // Cold Plate specific
  coolingSpecification?: string;
  // Tricycle specific
  plateNumber?: string;
  capacity?: string;
  category?: string;
}

export const AssetControl: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [assets, setAssets] = useState<AssetView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(user?.siteId ?? undefined);
  const [sites, setSites] = useState<SiteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [assetFilter, setAssetFilter] = useState<AssetType | 'ALL'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetView | null>(null);
  const [formData, setFormData] = useState<Partial<AssetView>>({
    name: '',
    type: 'COLD_ROOM',
    status: 'AVAILABLE',
    health: 100,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const mapColdRoomToAsset = (room: ColdRoomEntity): AssetView => ({
    id: room.id,
    name: room.name,
    type: 'COLD_ROOM',
    status: 'IN_USE',
    siteId: room.siteId,
    temperature: room.temperatureMax ?? room.temperatureMin,
    health: 100,
  });

  const mapColdBoxToAsset = (box: ColdBoxEntity): AssetView => ({
    id: box.id,
    name: box.identificationNumber,
    type: 'COLD_BOX',
    status: box.status,
    siteId: box.siteId,
    health: 100,
    imageUrl: box.imageUrl,
  });

  const mapColdPlateToAsset = (plate: ColdPlateEntity): AssetView => ({
    id: plate.id,
    name: plate.identificationNumber,
    type: 'COLD_PLATE',
    status: plate.status,
    siteId: plate.siteId,
    health: 100,
    imageUrl: plate.imageUrl,
  });

  const mapTricycleToAsset = (tricycle: TricycleEntity): AssetView => ({
    id: tricycle.id,
    name: tricycle.plateNumber,
    type: 'TRICYCLE',
    status: tricycle.status,
    siteId: tricycle.siteId,
    health: 100,
    imageUrl: tricycle.imageUrl,
  });

  const managerSite = sites.find(s => s.id === (selectedSiteId ?? user?.siteId));

  // Filter assets to only show those belonging to THIS hub
  const hubAssets = assets;
  const filteredAssets = hubAssets.filter(asset =>
    assetFilter === 'ALL' || asset.type === assetFilter
  );

  const loadData = async (siteId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [allSites, coldRooms, coldBoxes, coldPlates, tricycles] = await Promise.all([
        sitesService.getAllSites(),
        infrastructureService.getColdRooms(siteId),
        logisticsService.getColdBoxes(siteId),
        logisticsService.getColdPlates(siteId),
        logisticsService.getTricycles(siteId),
      ]);

      setSites(allSites);

      const mappedAssets: AssetView[] = [
        ...coldRooms.map(mapColdRoomToAsset),
        ...coldBoxes.map(mapColdBoxToAsset),
        ...coldPlates.map(mapColdPlateToAsset),
        ...tricycles.map(mapTricycleToAsset),
      ].filter(a => !siteId || a.siteId === siteId);

      setAssets(mappedAssets);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load assets';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(user?.siteId ?? undefined);
  }, [user?.siteId]);



  const handleOpenModal = (asset?: AssetView) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData(asset);
      setImagePreview(asset.imageUrl || null);
    } else {
      setEditingAsset(null);
      setFormData({
        name: '',
        type: 'COLD_ROOM',
        siteId: user?.siteId || undefined,
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
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSiteId = selectedSiteId || user?.siteId;
    if (!currentSiteId) {
      toast.error('Site ID not found');
      return;
    }

    try {
      const type = formData.type as AssetType | undefined;
      if (!type) {
        toast.error('Please choose an asset type');
        return;
      }

      let updated: AssetView | null = null;

      if (editingAsset) {
        if (type === 'COLD_ROOM') {
          const dto = {
            name: formData.name || editingAsset.name,
            siteId: currentSiteId,
            totalCapacityKg: formData.totalCapacityKg || 0,
            temperatureMin: formData.temperatureMin || 0,
            temperatureMax: formData.temperatureMax || formData.temperature || undefined,
          };
          const room = await infrastructureService.updateColdRoom(editingAsset.id, dto);
          updated = mapColdRoomToAsset(room);
        }
      } else {
        if (type === 'COLD_ROOM') {
          const dto = {
            name: formData.name || '',
            siteId: currentSiteId,
            totalCapacityKg: formData.totalCapacityKg || 0,
            temperatureMin: formData.temperatureMin || 0,
            temperatureMax: formData.temperatureMax ?? formData.temperature ?? 0,
            powerType: formData.powerType || 'GRID',
          };
          const room = await infrastructureService.createColdRoom(dto as any);
          updated = mapColdRoomToAsset(room);
        } else if (type === 'COLD_BOX') {
          const box = await logisticsService.createColdBox({
            identificationNumber: formData.identificationNumber || '',
            siteId: currentSiteId,
            sizeOrCapacity: formData.sizeOrCapacity || '',
            location: formData.location || '',
            imageUrl: formData.imageUrl,
          });
          updated = mapColdBoxToAsset(box);
        } else if (type === 'COLD_PLATE') {
          const plate = await logisticsService.createColdPlate({
            identificationNumber: formData.identificationNumber || formData.name || '',
            coolingSpecification: formData.coolingSpecification || '',
            siteId: currentSiteId,
            imageUrl: formData.imageUrl,
          });
          updated = mapColdPlateToAsset(plate);
        } else if (type === 'TRICYCLE') {
          const tricycle = await logisticsService.createTricycle({
            plateNumber: formData.plateNumber || formData.name || '',
            siteId: currentSiteId,
            capacity: formData.capacity || '',
            category: formData.category || 'FRUITS_VEGETABLES',
            imageUrl: formData.imageUrl,
          });
          updated = mapTricycleToAsset(tricycle);
        }
      }

      if (updated) {
        setAssets(prev =>
          editingAsset ? prev.map(a => (a.id === editingAsset.id ? updated! : a)) : [updated!, ...prev],
        );
      }

      toast.success(editingAsset ? 'Asset updated successfully' : 'New asset added to hub');
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save asset';
      toast.error(message);
    }
  };

  const handleDelete = async (asset: AssetView) => {
    if (window.confirm("Are you sure you want to decommission this asset?")) {
      try {
        if (asset.type === 'COLD_ROOM') {
          await infrastructureService.deleteColdRoom(asset.id);
        } else if (asset.type === 'COLD_BOX') {
          await logisticsService.deleteAsset('boxes', asset.id);
        } else if (asset.type === 'COLD_PLATE') {
          await logisticsService.deleteAsset('plates', asset.id);
        } else if (asset.type === 'TRICYCLE') {
          await logisticsService.deleteAsset('tricycles', asset.id);
        }
        setAssets(prev => prev.filter(a => a.id !== asset.id));
        toast.error('Asset decommissioned');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete asset';
        toast.error(message);
      }
    }
  };

  const toggleStatus = async (asset: AssetView) => {
    const newStatus = asset.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE' as any;
    try {
      if (asset.type === 'TRICYCLE') {
        await logisticsService.updateAssetStatus('tricycles', asset.id, newStatus);
      } else if (asset.type === 'COLD_BOX') {
        await logisticsService.updateAssetStatus('boxes', asset.id, newStatus);
      } else if (asset.type === 'COLD_PLATE') {
        await logisticsService.updateAssetStatus('plates', asset.id, newStatus);
      }
      setAssets(prev => prev.map(a => (a.id === asset.id ? { ...a, status: newStatus } : a)));
      toast.success(`${asset.name} is now ${newStatus}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-100 pb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[#38a169]/10 text-[#38a169] rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Asset Control Center</h2>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm font-bold text-gray-500">{managerSite?.name || 'Loading...'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Site selection for admins */}
          {(!user?.siteId || sites.length > 1) && (
            <select
              value={selectedSiteId ?? ''}
              onChange={(e) => {
                const siteId = e.target.value;
                setSelectedSiteId(siteId || undefined);
                void loadData(siteId || undefined);
                const site = sites.find(s => s.id === siteId);
                if (site) {
                  toast.info(`Switched context to ${site.name}`);
                }
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none hover:border-gray-300 transition-all"
            >
              {!user?.siteId && <option value="">All Sites</option>}
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          )}

          <select
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value as AssetType | 'ALL')}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none hover:border-gray-300 transition-all"
          >
            <option value="ALL">All Assets</option>
            <option value="COLD_ROOM">Cold Rooms</option>
            <option value="COLD_BOX">Cold Boxes</option>
            <option value="COLD_PLATE">Cold Plates</option>
            <option value="TRICYCLE">Tricycles</option>
          </select>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[#38a169] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#2f855a] transition-all shadow-lg shadow-green-900/20"
          >
            <Plus className="w-4 h-4" /> Register New Asset
          </button>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading && (
            <p className="text-sm text-gray-500">Loading assets from MoFresh API...</p>
          )}
          {error && !loading && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!loading && !error && filteredAssets.map(asset => {
            const Icon = asset.type === 'TRICYCLE' ? Truck : Box;
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={asset.id}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-[#38a169]/30 transition-all hover:shadow-xl hover:shadow-gray-200/50 relative overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${asset.status === 'OPERATIONAL' ? 'bg-[#38a169]' : 'bg-orange-500'}`} />

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden ${asset.status === 'OPERATIONAL' ? 'bg-green-50 text-[#38a169]' : 'bg-orange-50 text-orange-600'
                      }`}>
                      {asset.imageUrl ? (
                        <img src={asset.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-7 h-7" />
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(asset)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(asset)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight">{asset.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{asset.type.replace('_', ' ')}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {asset.identificationNumber || asset.plateNumber || asset.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Asset-specific details */}
                  {asset.type === 'COLD_ROOM' && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Thermometer className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Temperature</span>
                        </div>
                        <span className="text-lg font-black text-blue-600">
                          {asset.temperatureMin}°C - {asset.temperatureMax}°C
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">Capacity</span>
                        <span className="font-bold text-gray-900">
                          {asset.usedCapacityKg?.toFixed(0) || 0} / {asset.totalCapacityKg?.toFixed(0) || 0} kg
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000 bg-[#38a169]"
                          style={{ width: `${Math.min(100, ((asset.usedCapacityKg || 0) / (asset.totalCapacityKg || 1)) * 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Power: {asset.powerType}
                      </div>
                    </div>
                  )}

                  {asset.type === 'COLD_BOX' && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 space-y-1">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Size:</span> {asset.sizeOrCapacity}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {asset.location}
                      </div>
                    </div>
                  )}

                  {asset.type === 'COLD_PLATE' && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Cooling Spec:</span> {asset.coolingSpecification}
                      </div>
                    </div>
                  )}

                  {asset.type === 'TRICYCLE' && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 space-y-1">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Capacity:</span> {asset.capacity}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Category:</span> {asset.category}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${asset.status === 'AVAILABLE' || asset.status === 'OPERATIONAL' ? 'bg-green-500' :
                        asset.status === 'MAINTENANCE' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {asset.status}
                      </span>
                    </div>
                  </div>
                </div>

                {asset.type !== 'COLD_ROOM' && (
                  <button
                    onClick={() => toggleStatus(asset)}
                    className={`w-full mt-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${asset.status === 'MAINTENANCE'
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-900/20'
                      : 'bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-600 border border-gray-100'
                      }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    {asset.status === 'MAINTENANCE' ? 'Restore to Operation' : 'Request Maintenance'}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredAssets.length === 0 && !loading && (
        <div className="text-center py-20">
          <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Assets Found</h3>
          <p className="text-gray-500">Register new assets to manage your hub inventory</p>
        </div>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">
                    {editingAsset ? 'Edit Asset' : 'Register Asset'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {managerSite?.name || 'Your Hub'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6">
                {/* Asset Type Selection (only for new assets) */}
                {!editingAsset && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Type</label>
                    <select
                      required
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as AssetType })}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                    >
                      <option value="COLD_ROOM">Cold Room</option>
                      <option value="COLD_BOX">Cold Box</option>
                      <option value="COLD_PLATE">Cold Plate</option>
                      <option value="TRICYCLE">Tricycle</option>
                    </select>
                  </div>
                )}

                {/* Cold Room Fields */}
                {formData.type === 'COLD_ROOM' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                        placeholder="e.g. Cold Room Alpha"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Capacity (kg) *</label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          value={formData.totalCapacityKg || ''}
                          onChange={e => setFormData({ ...formData, totalCapacityKg: parseFloat(e.target.value) })}
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                          placeholder="5000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Power Type *</label>
                        <select
                          required
                          value={formData.powerType || 'GRID'}
                          onChange={e => setFormData({ ...formData, powerType: e.target.value as PowerType })}
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                        >
                          <option value="GRID">Grid</option>
                          <option value="SOLAR">Solar</option>
                          <option value="HYBRID">Hybrid</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min Temperature (°C) *</label>
                        <input
                          required
                          type="number"
                          step="0.1"
                          value={formData.temperatureMin || ''}
                          onChange={e => setFormData({ ...formData, temperatureMin: parseFloat(e.target.value) })}
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                          placeholder="-20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Temperature (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.temperatureMax || ''}
                          onChange={e => setFormData({ ...formData, temperatureMax: parseFloat(e.target.value) })}
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                          placeholder="-10"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Cold Box Fields */}
                {formData.type === 'COLD_BOX' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identification Number *</label>
                      <input
                        required
                        type="text"
                        value={formData.identificationNumber || ''}
                        onChange={e => setFormData({ ...formData, identificationNumber: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                        placeholder="CB-001"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Size/Capacity *</label>
                        <input
                          required
                          type="text"
                          value={formData.sizeOrCapacity || ''}
                          onChange={e => setFormData({ ...formData, sizeOrCapacity: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                          placeholder="50L"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location *</label>
                        <input
                          required
                          type="text"
                          value={formData.location || ''}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                          placeholder="Storage Area A"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Cold Plate Fields */}
                {formData.type === 'COLD_PLATE' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identification Number *</label>
                      <input
                        required
                        type="text"
                        value={formData.identificationNumber || ''}
                        onChange={e => setFormData({ ...formData, identificationNumber: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                        placeholder="CP-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cooling Specification *</label>
                      <input
                        required
                        type="text"
                        value={formData.coolingSpecification || ''}
                        onChange={e => setFormData({ ...formData, coolingSpecification: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                        placeholder="PCM -5°C"
                      />
                    </div>
                  </>
                )}

                {/* Tricycle Fields */}
                {formData.type === 'TRICYCLE' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Plate Number *</label>
                      <input
                        required
                        type="text"
                        value={formData.plateNumber || ''}
                        onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                        placeholder="RAD-123"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Capacity *</label>
                        <input
                          required
                          type="text"
                          value={formData.capacity || ''}
                          onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                          placeholder="200kg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category *</label>
                        <select
                          required
                          value={formData.category || ''}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#38a169] transition-all font-bold text-gray-800"
                        >
                          <option value="">Select...</option>
                          <option value="DAIRY">Dairy</option>
                          <option value="MEAT">Meat</option>
                          <option value="FRUITS_VEGETABLES">Fruits & Vegetables</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Image Upload (for all types) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Image (Optional)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative group"
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
                        <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Photo</span>
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

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 border border-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-[#38a169] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#2f855a] transition-all shadow-lg shadow-green-900/20"
                  >
                    {editingAsset ? 'Update Asset' : 'Register Asset'}
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
