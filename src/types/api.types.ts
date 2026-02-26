// API Types based on Mofresh Backend API
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SITE_MANAGER = 'SITE_MANAGER',
  SUPPLIER = 'SUPPLIER',
  CLIENT = 'CLIENT',
  VENDOR = 'VENDOR',
}

export enum AccountType {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
}

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  VOID = 'VOID',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export enum PowerType {
  GRID = 'GRID',
  OFF_GRID = 'OFF_GRID',
  HYBRID = 'HYBRID',
}

export enum AssetType {
  COLD_BOX = 'COLD_BOX',
  COLD_PLATE = 'COLD_PLATE',
  TRICYCLE = 'TRICYCLE',
  COLD_ROOM = 'COLD_ROOM',
}

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum ProductCategory {
  VEGETABLES = 'VEGETABLES',
  FRESH_FRUITS = 'FRESH_FRUITS',
  MEAT = 'MEAT',
  DAIRY = 'DAIRY',
  MEDECINE = 'MEDECINE',
  PHARMACEUTICAL = 'PHARMACEUTICAL',
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  otpRequired?: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: UserEntity;
}

export interface VerifyOtpDto {
  email: string;
  code: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: UserEntity;
}

export interface ResendOtpDto {
  email: string;
}

export interface RequestPasswordResetDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

// User Types
export interface UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  siteId: string | null;
  isActive: boolean;
  accountType?: AccountType;
  businessName?: string;
  tinNumber?: string;
  businessCertificateDocument?: string | null;
  nationalIdDocument?: string | null;
  profilePicture?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaymentEntity {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionReference?: string;
  createdAt: string;
}

export interface RevenueReportFilters {
  siteId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UnpaidInvoicesFilters {
  siteId?: string;
  page?: number;
  limit?: number;
}

export interface RegisterClientPersonalDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  siteId?: string;
  nationalIdDocument?: File;
}

export interface RegisterClientBusinessDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessName: string;
  tinNumber: string;
  businessCertificateDocument: File;
  password: string;
  siteId?: string;
  nationalIdDocument?: File;
}

export interface RegisterSupplierDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  siteId: string;
  businessName: string;
  tinNumber: string;
  businessCertificateDocument: File;
  nationalIdDocument: File;
  password?: string;
}

export interface RegisterSiteManagerDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  siteId: string;
  password: string;
}

export interface VendorRequestDto {
  email: string;
  phone: string;
  description: string;
  businessName?: string;
  tinNumber?: string;
  NationalIdDocument?: File;
  BusinessCertificateDocument?: File;
}

export interface ReplyVendorRequestDto {
  email: string;
  message: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  role?: UserRole;
  password?: string;
  avatar?: File;
  businessCertificateDocument?: File;
  nationalIdDocument?: File;
}

// Site Types
export interface SiteEntity {
  id: string;
  name: string;
  location: string;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateSiteDto {
  name: string;
  location: string;
  managerId?: string;
}

export interface UpdateSiteDto {
  name?: string;
  location?: string;
  managerId?: string;
}

// Infrastructure (ColdRoom) Types
export interface ColdRoomEntity {
  id: string;
  name: string;
  siteId: string;
  totalCapacityKg: number;
  usedCapacityKg: number;
  temperatureMin: number;
  temperatureMax: number | null;
  powerType: PowerType;
  status: AssetStatus;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateColdRoomDto {
  name: string;
  siteId: string;
  totalCapacityKg: number;
  temperatureMin: number;
  temperatureMax?: number;
  powerType: PowerType;
  status?: AssetStatus;
  image?: File;
}

export interface ColdRoomOccupancy {
  totalCapacityKg: number;
  usedCapacityKg: number;
  availableKg: number;
  occupancyPercentage: number;
  canAcceptMore: boolean;
}

// Logistics (Cold Assets) Types
export interface TricycleEntity {
  id: string;
  plateNumber: string;
  siteId: string;
  capacity: string;
  category: string;
  imageUrl?: string;
  status: AssetStatus;
}

export interface ColdBoxEntity {
  id: string;
  identificationNumber: string;
  sizeOrCapacity: string;
  siteId: string;
  location: string;
  imageUrl?: string;
  status: AssetStatus;
}

export interface ColdPlateEntity {
  id: string;
  identificationNumber: string;
  coolingSpecification: string;
  siteId: string;
  imageUrl?: string;
  status: AssetStatus;
}

export interface CreateTricycleDto {
  plateNumber: string;
  siteId: string;
  capacity: string;
  category: string;
  imageUrl?: string;
}

export interface CreateColdBoxDto {
  identificationNumber: string;
  sizeOrCapacity: string;
  siteId: string;
  location: string;
  imageUrl?: string;
}

export interface CreateColdPlateDto {
  identificationNumber: string;
  coolingSpecification: string;
  siteId: string;
  imageUrl?: string;
}

// Product Types
export interface ProductEntity {
  id: string;
  name: string;
  category: ProductCategory;
  quantityKg: number;
  unit: string;
  supplierId: string;
  coldRoomId: string;
  siteId: string;
  sellingPricePerUnit: number;
  price?: number; // Component Compatibility
  imageUrl: string;
  image?: string; // Component Compatibility
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateProductDto {
  name: string;
  category: string;
  quantityKg: number;
  unit: string;
  supplierId: string;
  coldRoomId: string;
  siteId: string;
  sellingPricePerUnit: number;
  imageUrl: string;
  description: string;
}

export interface AdjustStockDto {
  movementType: StockMovementType;
  quantityKg: number;
  reason: string;
}

// Stock Movement Types
export interface StockMovementEntity {
  id: string;
  productId: string;
  coldRoomId: string;
  quantityKg: number;
  movementType: StockMovementType;
  reason: string;
  createdAt: string;
}

export interface CreateStockMovementDto {
  productId: string;
  coldRoomId: string;
  quantityKg: number;
  movementType: StockMovementType;
  reason: string;
}

// Order Types
export enum OrderStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  INVOICED = 'INVOICED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface CreateOrderDto {
  deliveryAddress: string;
  notes?: string;
  items: { productId: string; quantityKg: number }[];
}

export interface OrderEntity {
  id: string;
  clientId: string;
  siteId: string;
  status: OrderStatus;
  deliveryAddress: string;
  notes: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Invoice Types
export interface InvoiceItemResponseDto {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  orderId: string | null;
  rentalId: string | null;
  clientId: string;
  siteId: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  items: InvoiceItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface MarkPaidDto {
  paymentMethod: string;
  reference?: string;
}

export interface VoidInvoiceDto {
  reason: string;
}

export interface GenerateOrderInvoiceDto {
  orderId: string;
  dueDate: string;
}

export interface GenerateRentalInvoiceDto {
  rentalId: string;
  dueDate: string;
}

// Payment Types
export interface InitiatePaymentDto {
  invoiceId: string;
  phoneNumber: string;
}

// Rental Types
export enum RentalStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateRentalDto {
  assetType: AssetType;
  coldBoxId?: string;
  coldPlateId?: string;
  tricycleId?: string;
  coldRoomId?: string;
  rentalStartDate: string;
  rentalEndDate: string;
  estimatedFee: number;
  capacityNeededKg?: number;
}

export interface RentalEntity {
  id: string;
  clientId: string;
  assetType: AssetType;
  status: RentalStatus;
  rentalStartDate: string;
  rentalEndDate: string;
  estimatedFee: number;
  image?: string; // Component Compatibility
  assetName?: string; // Component Compatibility
  hubLocation?: string; // Component Compatibility
  createdAt: string;
  updatedAt: string;
}

// Audit Log Types
export interface CreateAuditLogDto {
  entityType: string;
  entityId: string;
  action: AuditAction;
  userId: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface AuditLogEntity {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  userId: string;
  details: Record<string, any>;
  timestamp: string;
  user: UserEntity;
}

// Report Types
export interface RevenueReportResponseDto {
  totalRevenue: number;
  productSales: number;
  rentalIncome: number;
  bySite?: Record<string, number>;
}

export interface UnpaidInvoicesReportDto {
  totalUnpaidAmount: number;
  count: number;
  invoices: InvoiceResponseDto[];
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Error Response
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
