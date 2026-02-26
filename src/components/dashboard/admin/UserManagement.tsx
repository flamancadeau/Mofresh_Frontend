import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import usersService from '@/api/services/users.service';
import sitesService from '@/api/services/sites.service';
import { UserRole, type UserEntity, type SiteEntity } from '@/types/api.types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [sites, setSites] = useState<SiteEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'SUPPLIER' | 'CLIENT' | 'SITE_MANAGER' | 'SUPER_ADMIN'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.CLIENT,
    siteId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersData, sitesData] = await Promise.all([
        usersService.getAllUsers(),
        sitesService.getAllSites()
      ]);

      setUsers(usersData);
      setSites(sitesData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user?: UserEntity) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        password: '', // Don't populate password on edit
        role: user.role,
        siteId: user.siteId || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: UserRole.CLIENT,
        siteId: sites[0]?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsActionLoading(true);
    try {
      if (editingUser) {
        // Update User
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
        };
        // Only include password if changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        await usersService.updateUser(editingUser.id, updateData);
        toast.success(`User updated: ${formData.firstName}`);
      } else {
        // Register User
        const registrationData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          siteId: formData.siteId,
        };

        // Only include password if it's not empty
        if (formData.password.trim()) {
          registrationData.password = formData.password;
        }

        await usersService.register(registrationData);
        toast.success(`User created: ${formData.firstName}`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setIsActionLoading(true);
      try {
        await usersService.deleteUser(id);
        toast.success('User deleted');
        fetchData();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete user');
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(search) || email.includes(search);
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getSiteName = (siteId: string | null) => {
    if (!siteId) return '-';
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : '-';
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser.role === 'ADMIN'; // Frontend role 'ADMIN' maps to backend 'SUPER_ADMIN'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">User Management</h2>
          <p className="text-gray-500 text-sm">Manage access and roles across the platform</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#1a4d2e] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#143d24] transition-colors shadow-lg shadow-[#1a4d2e]/20"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#38a169]/20 transition-all shadow-sm"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#38a169]/20 shadow-sm"
        >
          <option value="ALL">All Roles</option>
          <option value="SUPPLIER">Suppliers</option>
          <option value="CLIENT">Clients</option>
          <option value="SITE_MANAGER">Site Managers</option>
          <option value="SUPER_ADMIN">Super Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-6">User</th>
                <th className="px-8 py-6">Role</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Site</th>
                <th className="px-8 py-6">Date Joined</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-12 text-center text-gray-400 font-medium h-[400px]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-10 h-10 text-[#38a169] animate-spin" />
                      <p className="animate-pulse">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-12 text-center text-gray-400 font-medium">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#38a169]/10 rounded-xl flex items-center justify-center text-[#38a169] font-black">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${u.role === UserRole.SUPPLIER ? 'bg-orange-100 text-orange-600' :
                          u.role === UserRole.CLIENT ? 'bg-blue-100 text-blue-600' :
                            u.role === UserRole.SITE_MANAGER ? 'bg-purple-100 text-purple-600' :
                              'bg-red-100 text-red-600'
                        }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${u.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                      {getSiteName(u.siteId)}
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={isActionLoading}
                          onClick={() => handleOpenModal(u)}
                          className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          disabled={isActionLoading}
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isActionLoading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                    required
                    disabled={isActionLoading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                    required
                    disabled={isActionLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                    required
                    disabled={isActionLoading || !!editingUser}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                    placeholder="+250..."
                    required
                    disabled={isActionLoading}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {editingUser ? 'New Password (Optional)' : 'Password (Optional)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                  required={false}
                  disabled={isActionLoading}
                  placeholder={editingUser ? 'Leave blank to keep current' : 'Leave blank to auto-generate'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                    disabled={isActionLoading}
                  >
                    <option value={UserRole.CLIENT}>Client</option>
                    <option value={UserRole.SUPPLIER}>Supplier</option>
                    <option value={UserRole.SITE_MANAGER}>Site Manager</option>
                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Site / Location</label>
                  <select
                    value={formData.siteId}
                    onChange={e => setFormData({ ...formData, siteId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#38a169] rounded-xl outline-none font-medium transition-all"
                    disabled={isActionLoading || !!editingUser}
                    required
                  >
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                    {sites.length === 0 && <option value="">No sites available</option>}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isActionLoading}
                className="w-full mt-4 py-3 bg-[#1a4d2e] hover:bg-[#143d24] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-[#1a4d2e]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
