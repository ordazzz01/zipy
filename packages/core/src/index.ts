import { z } from 'zod';

// ─── Constants ──────────────────────────────────────────────────────────

export const ROLES = ['customer', 'merchant', 'driver', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ─── Auth ────────────────────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .regex(/^\+?\d{10,15}$/, 'Teléfono inválido (10-15 dígitos, opcional +)');

export const addressSchema = z.object({
  street: z.string().min(1, 'Calle requerida'),
  extNumber: z.string().optional(),
  intNumber: z.string().optional(),
  neighborhood: z.string().min(1, 'Colonia requerida'),
  city: z.string().min(1, 'Ciudad requerida'),
  state: z.string().min(1, 'Estado requerido'),
  zipCode: z.string().regex(/^\d{5}$/, 'CP inválido (5 dígitos)'),
  reference: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});
export type Address = z.infer<typeof addressSchema>;

// ─── User profiles ───────────────────────────────────────────────────────

export const customerProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email().optional(),
  phone: phoneSchema,
  displayName: z.string().min(1),
  defaultAddressId: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type CustomerProfile = z.infer<typeof customerProfileSchema>;

export const merchantProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  phone: phoneSchema,
  businessName: z.string().min(1),
  businessAddress: addressSchema,
  logoUrl: z.string().url().optional(),
  open: z.boolean().default(false),
  createdAt: z.string().datetime(),
});
export type MerchantProfile = z.infer<typeof merchantProfileSchema>;

export const driverProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email().optional(),
  phone: phoneSchema,
  displayName: z.string().min(1),
  vehicle: z.enum(['car', 'motorcycle', 'bicycle', 'on_foot']),
  licensePlate: z.string().optional(),
  available: z.boolean().default(false),
  currentOrderId: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type DriverProfile = z.infer<typeof driverProfileSchema>;

export const adminProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  superadmin: z.boolean().default(false),
  createdAt: z.string().datetime(),
});
export type AdminProfile = z.infer<typeof adminProfileSchema>;

// ─── Merchant catalog ────────────────────────────────────────────────────

export const categorySchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  name: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
});
export type Category = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  categoryId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(), // en centavos MXN (evita floats)
  imageUrl: z.string().url().optional(),
  available: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative(),
});
export type Product = z.infer<typeof productSchema>;

export const cartItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

// ─── Order ────────────────────────────────────────────────────────────────

export const orderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  merchantId: z.string(),
  driverId: z.string().optional(),
  items: z.array(cartItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.enum(ORDER_STATUSES),
  deliveryAddress: addressSchema,
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Order = z.infer<typeof orderSchema>;

// ─── Named export barrel ──────────────────────────────────────────────────

export const schemas = {
  phone: phoneSchema,
  address: addressSchema,
  customerProfile: customerProfileSchema,
  merchantProfile: merchantProfileSchema,
  driverProfile: driverProfileSchema,
  adminProfile: adminProfileSchema,
  category: categorySchema,
  product: productSchema,
  cartItem: cartItemSchema,
  order: orderSchema,
} as const;
