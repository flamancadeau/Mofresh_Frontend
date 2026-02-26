import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define types for our mock data
export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SITE_MANAGER' | 'SUPPLIER' | 'BUYER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  location?: string;
  joinedDate: string;
  siteId?: string; // Links to a Site for Managers
}

export interface MockSite {
  id: string;
  name: string;
  location: string;
  managerId?: string; // Links to a User
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'OFFLINE';
  capacity: number; // Percentage
}

export interface MockAsset {
  id: string;
  name: string;
  type: 'COLD_ROOM' | 'COLD_BOX' | 'COLD_PLATE' | 'TRICYCLE';
  siteId?: string; // Links to a Site
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'DECOMMISSIONED' | 'RENTED';
  health: number; // 0-100
  temperature?: number;
  lastService: string;
  imageUrl?: string;
}

export interface MockCategory {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface MockProduct {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  stock: number;
  supplierId: string;
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK';
  imageUrl?: string;
  siteId?: string; // Hub where it's stored
  room?: string; // Specific cold room
}

export interface MockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  siteId: string;
  room: string;
  performedBy: string;
  timestamp: string;
}

export interface MockTransaction {
  id: string;
  userId: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  type: 'SALE' | 'RENTAL' | 'SERVICE';
  date: string;
  items: string[];
  siteId?: string;
  isVerifiedByManager: boolean;
}

export interface MockSupplierRequest {
  id: string;
  email: string;
  description: string;
  targetBranch: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedDate: string;
}

export interface MockDataState {
  sites: MockSite[];
  assets: MockAsset[];
  categories: MockCategory[];
  products: MockProduct[];
  movements: MockMovement[];
  transactions: MockTransaction[];
  supplierRequests: MockSupplierRequest[];
  users: MockUser[];
}

// Initial Mock Data
const initialState: MockDataState = {
  users: [
    { id: 'u1', firstName: 'Super', lastName: 'Admin', email: 'admin@mofresh.rw', role: 'SUPER_ADMIN', status: 'ACTIVE', joinedDate: '2025-01-01' },
    { id: 'u2', firstName: 'Jane', lastName: 'Uwimana', email: 'jane@mofresh.rw', role: 'SITE_MANAGER', status: 'ACTIVE', siteId: 's1', location: 'Kigali Central Hub', joinedDate: '2025-02-10' },
    { id: 'u3', firstName: 'John', lastName: 'Mugabo', email: 'john@client.com', role: 'BUYER', status: 'ACTIVE', joinedDate: '2025-02-15' },
    { id: 'u4', firstName: 'Mary', lastName: 'Ingabire', email: 'mary@supplier.com', role: 'SUPPLIER', status: 'ACTIVE', location: 'Musanze', joinedDate: '2025-02-18' },
    { id: 'u5', firstName: 'Manager', lastName: 'Musanze', email: 'musanze@mofresh.rw', role: 'SITE_MANAGER', status: 'ACTIVE', siteId: 's2', location: 'Musanze Northern Hub', joinedDate: '2025-02-15' },
    { id: 'u6', firstName: 'Manager', lastName: 'Rubavu', email: 'rubavu@mofresh.rw', role: 'SITE_MANAGER', status: 'ACTIVE', siteId: 's3', location: 'Rubavu Western Hub', joinedDate: '2025-02-16' },
    { id: 'u7', firstName: 'Manager', lastName: 'Huye', email: 'huye@mofresh.rw', role: 'SITE_MANAGER', status: 'ACTIVE', siteId: 's4', location: 'Huye Southern Hub', joinedDate: '2025-02-17' },
  ],
  sites: [
    { id: 's1', name: 'Kigali Central Hub', location: 'Kigali, Rwanda', managerId: 'u2', status: 'OPERATIONAL', capacity: 85 },
    { id: 's2', name: 'Musanze Northern Hub', location: 'Musanze, Rwanda', managerId: 'u5', status: 'OPERATIONAL', capacity: 45 },
    { id: 's3', name: 'Rubavu Western Hub', location: 'Rubavu, Rwanda', status: 'MAINTENANCE', capacity: 0 },
    { id: 's4', name: 'Huye Southern Hub', location: 'Huye, Rwanda', status: 'OPERATIONAL', capacity: 70 },
  ],
  assets: [
    { id: 'a1', name: 'Cold Room Alpha', type: 'COLD_ROOM', siteId: 's1', status: 'OPERATIONAL', health: 95, temperature: -18, lastService: '2023-12-10' },
    { id: 'a2', name: 'Tricycle 01', type: 'TRICYCLE', siteId: 's1', status: 'OPERATIONAL', health: 82, lastService: '2024-01-05' },
    { id: 'a3', name: 'Tricycle 02', type: 'TRICYCLE', siteId: 's1', status: 'MAINTENANCE', health: 45, lastService: '2023-11-20' },
    { id: 'a4', name: 'Cold Box 101', type: 'COLD_BOX', siteId: 's2', status: 'OPERATIONAL', health: 98, temperature: -5, lastService: '2024-02-01' },
    { id: 'a5', name: 'Cold Room Beta', type: 'COLD_ROOM', siteId: 's4', status: 'RENTED', health: 90, temperature: -20, lastService: '2024-01-15' },
  ],
  categories: [
    { id: 'c1', name: 'Vegetables', description: 'Fresh farm vegetables', imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a000451b501?w=400' },
    { id: 'c2', name: 'Fruits', description: 'Tropical and seasonal fruits', imageUrl: 'https://images.unsplash.com/photo-1610832958506-ee563384239d?w=400' },
    { id: 'c3', name: 'Dairy', description: 'Milk, cheese, and yogurt', imageUrl: 'https://images.unsplash.com/photo-1550583724-1255d14266a2?w=400' },
  ],
  products: [
    { id: 'p1', name: 'Fresh Tomatoes', categoryId: 'c1', price: 1500, stock: 500, supplierId: 'u4', status: 'ACTIVE', siteId: 's1', room: 'Room A1', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
    { id: 'p2', name: 'Organic Onions', categoryId: 'c1', price: 1200, stock: 300, supplierId: 'u4', status: 'ACTIVE', siteId: 's1', room: 'Room A1', imageUrl: 'https://images.unsplash.com/photo-1580149405543-33bc45002f61?w=400' },
    { id: 'p3', name: 'Avocados', categoryId: 'c2', price: 800, stock: 150, supplierId: 'u4', status: 'ACTIVE', siteId: 's2', room: 'Cold Box 101', imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400' },
    { id: 'p4', name: 'Irish Potatoes', categoryId: 'c1', price: 800, stock: 1200, supplierId: 'u4', status: 'ACTIVE', siteId: 's1', room: 'Room B2', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=200' },
    { id: 'p5', name: 'Fresh Carrots', categoryId: 'c1', price: 1200, stock: 35, supplierId: 'u4', status: 'ACTIVE', siteId: 's1', room: 'Room A1', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=200' },
    { id: 'p6', name: 'Fresh Milk', categoryId: 'c3', price: 1000, stock: 800, supplierId: 'u4', status: 'ACTIVE', siteId: 's1', room: 'Room C3', imageUrl: 'https://images.unsplash.com/photo-1563636619-e910ef2a844b?auto=format&fit=crop&q=80&w=200' },
  ],
  movements: [],
  transactions: [
    { id: 't1', userId: 'u3', amount: 45000, status: 'PAID', type: 'SALE', date: '2025-02-18', items: ['Fresh Tomatoes', 'Organic Onions'], siteId: 's1', isVerifiedByManager: true },
    { id: 't2', userId: 'u3', amount: 15000, status: 'PENDING', type: 'RENTAL', date: '2025-02-19', items: ['Box #402 Rental'], siteId: 's1', isVerifiedByManager: false },
  ],
  supplierRequests: [
    { id: 'req-1', email: 'farmer@site.com', description: 'Fresh vegetables supply', targetBranch: 's1', status: 'PENDING', requestedDate: '2025-02-20' },
  ],
};

const mockDataSlice = createSlice({
  name: 'mockData',
  initialState,
  reducers: {
    // User Actions
    addUser: (state, action: PayloadAction<MockUser>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<MockUser>) => {
      const index = state.users.findIndex((u: MockUser) => u.id === action.payload.id);
      if (index !== -1) state.users[index] = action.payload;
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u: MockUser) => u.id !== action.payload);
    },

    // Site Actions
    addSite: (state, action: PayloadAction<MockSite>) => {
      state.sites.push(action.payload);
    },
    updateSite: (state, action: PayloadAction<MockSite>) => {
      const index = state.sites.findIndex((s: MockSite) => s.id === action.payload.id);
      if (index !== -1) state.sites[index] = action.payload;
    },
    deleteSite: (state, action: PayloadAction<string>) => {
      state.sites = state.sites.filter((s: MockSite) => s.id !== action.payload);
    },

    // Asset Actions
    addAsset: (state, action: PayloadAction<MockAsset>) => {
      state.assets.push(action.payload);
    },
    updateAsset: (state, action: PayloadAction<MockAsset>) => {
      const index = state.assets.findIndex((a: MockAsset) => a.id === action.payload.id);
      if (index !== -1) state.assets[index] = action.payload;
    },
    deleteAsset: (state, action: PayloadAction<string>) => {
      state.assets = state.assets.filter((a: MockAsset) => a.id !== action.payload);
    },

    // Category Actions
    addCategory: (state, action: PayloadAction<MockCategory>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<MockCategory>) => {
      const index = state.categories.findIndex((c: MockCategory) => c.id === action.payload.id);
      if (index !== -1) state.categories[index] = action.payload;
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((c: MockCategory) => c.id !== action.payload);
    },

    // Product Actions
    addProduct: (state, action: PayloadAction<MockProduct>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<MockProduct>) => {
      const index = state.products.findIndex((p: MockProduct) => p.id === action.payload.id);
      if (index !== -1) state.products[index] = action.payload;
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p: MockProduct) => p.id !== action.payload);
    },

    // Movement Actions
    addMovement: (state, action: PayloadAction<MockMovement>) => {
      state.movements.push(action.payload);
    },

    // Transaction Actions
    addTransaction: (state, action: PayloadAction<MockTransaction>) => {
      state.transactions.push(action.payload);
    },
    verifyTransaction: (state, action: PayloadAction<string>) => {
      const index = state.transactions.findIndex((t: MockTransaction) => t.id === action.payload);
      if (index !== -1) state.transactions[index].isVerifiedByManager = true;
    },
    updateTransactionStatus: (state, action: PayloadAction<{ id: string, status: 'PAID' | 'PENDING' | 'FAILED' }>) => {
      const index = state.transactions.findIndex((t: MockTransaction) => t.id === action.payload.id);
      if (index !== -1) state.transactions[index].status = action.payload.status;
    },

    // Supplier Request Actions
    addSupplierRequest: (state, action: PayloadAction<MockSupplierRequest>) => {
      state.supplierRequests.push(action.payload);
    },
    approveSupplierRequest: (state, action: PayloadAction<string>) => {
      const reqIndex = state.supplierRequests.findIndex((r: MockSupplierRequest) => r.id === action.payload);
      if (reqIndex !== -1) {
        state.supplierRequests[reqIndex].status = 'APPROVED';
        const req = state.supplierRequests[reqIndex];
        const newUser: MockUser = {
          id: `u-${Date.now()}`,
          firstName: 'Supplier',
          lastName: req.email.split('@')[0],
          email: req.email,
          role: 'SUPPLIER',
          status: 'ACTIVE',
          location: state.sites.find((s: MockSite) => s.id === req.targetBranch)?.name || 'Central Hub',
          joinedDate: new Date().toISOString().split('T')[0]
        };
        state.users.push(newUser);
      }
    },
    rejectSupplierRequest: (state, action: PayloadAction<string>) => {
      const index = state.supplierRequests.findIndex((r: MockSupplierRequest) => r.id === action.payload);
      if (index !== -1) state.supplierRequests[index].status = 'REJECTED';
    },
  },
});

export const {
  addUser, updateUser, deleteUser,
  addSite, updateSite, deleteSite,
  addAsset, updateAsset, deleteAsset,
  addCategory, updateCategory, deleteCategory,
  addProduct, updateProduct, deleteProduct,
  addMovement,
  addTransaction, verifyTransaction, updateTransactionStatus,
  addSupplierRequest, approveSupplierRequest, rejectSupplierRequest,
} = mockDataSlice.actions;

export default mockDataSlice.reducer;
