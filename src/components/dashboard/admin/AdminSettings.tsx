import React, { useState } from 'react';
import {
    User,
    Phone,
    Mail,
    Camera,
    Save,
    Lock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/authSlice';
import { toast } from 'sonner';

export const AdminSettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    // Settings Form State
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        profilePicture: null as File | null,
        newPassword: '',
        confirmPassword: '',
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePicture || null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, profilePicture: file }));

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpdateProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user?.id) return;

        setIsSaving(true);
        try {
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmPassword) {
                    toast.error('Passwords do not match');
                    setIsSaving(false);
                    return;
                }
                if (formData.newPassword.length < 8) {
                    toast.error('Password must be at least 8 characters');
                    setIsSaving(false);
                    return;
                }
            }

            await dispatch(updateUser({
                id: user.id,
                userData: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    avatar: formData.profilePicture || undefined,
                    password: formData.newPassword || undefined,
                }
            })).unwrap();

            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">System Administrator Settings</h2>
                    <p className="text-gray-500 text-sm">Manage your administrative profile and security</p>
                </div>
                <button
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#1a4d2e] hover:bg-[#2a6d3e] text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#1a4d2e]/10 flex items-center justify-center bg-gray-50 text-gray-400">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-12 h-12" />
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 bg-[#1a4d2e] p-2.5 rounded-full text-white shadow-lg transform transition-transform group-hover:scale-110"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-sm font-bold text-[#1a4d2e] uppercase tracking-widest">{user?.role}</p>
                    </div>
                    <div className="w-full pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-3 text-sm text-gray-500 justify-center">
                            <Mail className="w-4 h-4 text-[#ffb703]" /> {user?.email}
                        </div>
                    </div>
                </div>

                {/* Right Column: Fields */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleUpdateProfile}>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#1a4d2e]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#1a4d2e]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#1a4d2e]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 md:col-span-2">
                            <h4 className="text-sm font-black text-gray-900 mb-4">Security & Password</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#1a4d2e]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#1a4d2e]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
