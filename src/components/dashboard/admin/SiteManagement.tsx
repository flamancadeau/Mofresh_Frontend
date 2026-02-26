import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MapPin,
  Check,
  ExternalLink,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import sitesService from "@/api/services/sites.service";
import type { SiteEntity } from "@/types/api.types";

export const SiteManagement: React.FC = () => {
  const [sites, setSites] = useState<SiteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteEntity | null>(null);
  const [formData, setFormData] = useState<Partial<SiteEntity>>({
    name: "",
    location: "",
    managerId: "",
  });

  const fetchSites = async () => {
    try {
      const data = await sitesService.getAllSites();
      setSites(data);
    } catch (error: any) {
      toast.error("Failed to fetch sites");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSites();
      setLoading(false);
    };
    init();
  }, []);

  const handleOpenModal = (site?: SiteEntity) => {
    if (site) {
      setEditingSite(site);
      setFormData({
        name: site.name,
        location: site.location,
        managerId: site.managerId || "",
      });
    } else {
      setEditingSite(null);
      setFormData({ name: "", location: "" });
    }
    setIsModalOpen(true);
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingSite) {
        await sitesService.updateSite(editingSite.id, {
          name: formData.name,
          location: formData.location,
          managerId: formData.managerId || undefined,
        });
        toast.success(`Site updated: ${formData.name}`);
      } else {
        await sitesService.createSite({
          name: formData.name!,
          location: formData.location!,
        });
        toast.success(`Site created: ${formData.name}`);
      }
      fetchSites();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save site");
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (confirm("Are you sure you want to delete this site?")) {
      try {
        await sitesService.deleteSite(id);
        toast.success("Site deleted");
        fetchSites();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete site");
      }
    }
  };

  const filteredSites = sites.filter(
    (s: SiteEntity) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Site Management</h2>
          <p className="text-gray-500 text-sm">
            Monitor and manage distribution hubs and sites
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#1a4d2e] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#143d24] transition-colors shadow-lg shadow-[#1a4d2e]/20"
        >
          <Plus className="w-4 h-4" /> Add New Site
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search sites by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#38a169]/20 transition-all shadow-sm"
        />
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#1a4d2e] animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Loading sites...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-[#38a169]/30 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-50 text-[#38a169] rounded-2xl flex items-center justify-center">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      {site.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-400">
                      {site.location}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(site)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Edit Site"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-400 hover:text-[#1a4d2e]" />
                  </button>
                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Site"
                  >
                    <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-600" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center text-xs mb-1.5"></div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider bg-green-50 text-green-600`}
                >
                  OPERATIONAL
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">
                {editingSite ? "Edit Site" : "Add New Site"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveSite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Site Name
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                  placeholder="e.g., Central Distribution Hub"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Location / City
                </label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                  placeholder="e.g., Kigali"
                  required
                />
              </div>
              {editingSite && <div className="space-y-2"></div>}

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-[#1a4d2e] hover:bg-[#143d24] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-[#1a4d2e]/20 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Site
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
