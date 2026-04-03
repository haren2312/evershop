import { NavigationItem } from '@components/admin/NavigationItem.js';
import { GiftIcon } from 'lucide-react';
import React from 'react';

interface NewCouponQuickLinkProps {
  couponNew: string;
}

export default function NewProductQuickLink({
  couponNew
}: NewCouponQuickLinkProps) {
  return <NavigationItem Icon={GiftIcon} title="New Coupon" url={couponNew} />;
}

export const layout = {
  areaId: 'quickLinks',
  sortOrder: 30
};

export const query = `
  query Query {
    couponNew: url(routeId:"couponNew")
  }
`;
