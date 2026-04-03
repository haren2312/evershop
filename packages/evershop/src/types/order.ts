export type PaymentStatus = {
  name: string;
  badge: string;
  isDefault: boolean;
  isCancelable?: boolean;
};

export type ShipmentStatus = {
  name: string;
  badge: string;
  isDefault: boolean;
  isCancelable?: boolean;
};

export type OrderStatus = {
  name: string;
  badge: string;
  isDefault: boolean;
  next: string[];
};
