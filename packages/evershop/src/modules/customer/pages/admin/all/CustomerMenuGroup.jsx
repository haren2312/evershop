import { NavigationItemGroup } from '@components/admin/NavigationItemGroup';
import { User } from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';

export default function CustomerMenuGroup({ customerGrid }) {
  return (
    <NavigationItemGroup
      id="customerMenuGroup"
      name="Customer"
      items={[
        {
          Icon: User,
          url: customerGrid,
          title: 'Customers'
        }
      ]}
    />
  );
}

CustomerMenuGroup.propTypes = {
  customerGrid: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'adminMenu',
  sortOrder: 40
};

export const query = `
  query Query {
    customerGrid: url(routeId:"customerGrid")
  }
`;
