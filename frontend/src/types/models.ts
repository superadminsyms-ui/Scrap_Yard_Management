export enum CustomerType {
  REGULAR = 'REGULAR',
  VIP = 'VIP',
  WHOLESALE = 'WHOLESALE',
}

export enum MaterialType {
  ALUMINIUM = 'ALUMINIUM',
  IRON = 'IRON',
  MOTOR = 'MOTOR',
  BATTERY = 'BATTERY',
  STAINLESS_STEEL = 'STAINLESS_STEEL',
  REFER = 'REFER',
  CIRCUIT_BOARD = 'CIRCUIT_BOARD',
  COPPER = 'COPPER',
  BRASS = 'BRASS',
  CATALYST = 'CATALYST',
  ALUMINIUM_CANS = 'ALUMINIUM_CANS',
}

export enum MovementType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  TRANSFER = 'TRANSFER',
}

export enum ContainerSize {
  FT_20 = 'FT_20',
  FT_40 = 'FT_40',
}

export enum UnitOfMeasure {
  KILOGRAMS = 'KILOGRAMS',
  POUNDS = 'POUNDS',
  TONNES = 'TONNES',
}

export enum ReportPeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMIANNUAL',
}

export interface Company {
  id: number
  name: string
  location: string
}

export interface CompanyFormData {
  name: string
  location: string
}

export interface ScrapYard {
  companyName: string
  name: string
  location: string
  active: boolean
}

export interface ScrapYardListItem extends ScrapYard {
  id: number
}

export interface ScrapYardFormData {
  name: string
  location: string
  active: boolean
  companyId: number
}

export interface Container {
  id: number
  description: string
  materialType: MaterialType
  containerSize: ContainerSize
  materialWeight: number
  unit: string
}

export interface ContainerFormData {
  description: string
  materialWeight: number
  containerSize: ContainerSize
  scrapYardId: number
  materialType: MaterialType
  unitOfMeasure: UnitOfMeasure
}

export interface ContainerUpdateFormData {
  description?: string
  materialType?: MaterialType
}

export interface Customer {
  id: number
  name: string
  personalId: string
  typeCustomer: CustomerType
  companyName: string
}

export interface CustomerFormData {
  name: string
  personalId: string
  typeCustomer: CustomerType
  companyId: number
}

export interface Manager {
  name: string
  email: string
  phone: string
  scrapYardName: string
}

export interface ManagerListItem extends Manager {
  id: number
}

export interface ManagerFormData {
  name: string
  email: string
  phone: string
  scrapYardId: number
}

export interface InvoiceDetailItem {
  detailId: number
  materialType: MaterialType
  unit: UnitOfMeasure
  weight: number
  unitPrice: number
  subtotal: number
  containerId: number
}

export interface Invoice {
  customerName: string
  invoiceId: number
  customerId: number
  customerType: CustomerType
  scrapyardName: string
  scrapyardId: number
  createdAt: string
  details: InvoiceDetailItem[]
  totalPaid: number
  discount: number
  managerName: string
}

export interface InvoiceSummary {
  invoiceId: number
  customerName: string
  customerType: CustomerType
  scrapyardName: string
  scrapyardId: number
  createdAt: string
  totalPaid: number
  discount: number
}

export interface InvoiceDetailFormItem {
  materialType: MaterialType
  unit: UnitOfMeasure
  weight: number
  unitPrice: number
  containerId: number
}

export interface InvoiceFormData {
  customerId: number
  scrapYardId: number
  discount: number
  details: InvoiceDetailFormItem[]
  managerId: number
}

export interface Movement {
  id: number
  scrapYardName: string
  containerId: number
  containerDescription: string
  materialType: MaterialType
  destination: string
  amountMoved: number
  unitOfMeasure: UnitOfMeasure
  amountMovedLbs: number
  movementDate: string
  managerName: string
  movementType: MovementType
}

export interface MovementFormData {
  scrapYardId: number
  containerId: number
  destination: string
  amountMoved: number
  unitOfMeasure: UnitOfMeasure
  materialType: MaterialType
  managerId: number
  movementType: MovementType
}

export interface MaterialStockItem {
  materialType: MaterialType
  totalWeight: number
  containerCount: number
  weightUnit: string
}

export interface YardStockSummary {
  scrapYardId: number
  scrapYardName: string
  totalWeight: number
  containerCount: number
  materialBreakdown: MaterialStockItem[]
  weightUnit: string
}

export interface ContainerStockItem {
  containerId: number
  description: string
  materialType: MaterialType
  containerSize: ContainerSize
  materialWeight: number
  scrapYardName: string
  unit: string
}

export interface MaterialPricing {
  materialType: MaterialType
  totalWeight: number
  totalSpent: number
  averageUnitPrice: number
  lineCount: number
}

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  MANAGER = 'MANAGER',
}

export interface User {
  id: number
  email: string
  role: UserRole
  yardId: number | null
  managerName?: string
  mustChangePassword: boolean
  active: boolean
  twoFactorEnabled: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
  email: string
  role: string
  yardId: number | null
  managerName?: string
  mustChangePassword: boolean
  requires2FA: boolean
  tempToken?: string
  twoFactorEnabled: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
  scrapYardId?: number
  role: UserRole
}

export interface RegisterResponse {
  id: number
  email: string
  role: string
  managerName?: string
  yardId: number | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface DashboardStats {
  totalCompanies: number | null
  totalScrapyards: number | null
  totalContainers: number
  totalCustomers: number
  totalInvoices: number
  totalMovements: number
  totalSpent: number
  recentInvoices: InvoiceSummary[]
  recentMovements: Movement[]
  scrapyardName?: string
  scrapyardLocation?: string
}

export interface UpdateProfileRequest {
  email?: string
  currentPassword: string
  newPassword?: string
}

export interface UserListResponse {
  id: number
  email: string
  role: string
  active: boolean
  mustChangePassword: boolean
  managerName: string | null
  managerId: number | null
  phone: string | null
  yardId: number | null
  createdAt: string
}

export interface UserUpdateRequest {
  email?: string
  newPassword?: string
}

export interface BackupFileInfo {
  filename: string
  sizeBytes: number
  createdAt: string
}

export interface TwoFASetupResponse {
  secret: string
  qrCodeUrl: string
}

export interface TwoFAStatusResponse {
  enabled: boolean
}

export interface Disable2FARequest {
  currentPassword: string
  code: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ResetPasswordResponse {
  message: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}
