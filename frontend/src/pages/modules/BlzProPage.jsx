import React from 'react';
import BasePage from './BasePage';
import { ShoppingCart } from 'lucide-react';

const BlzProPage = () => {
  return (
    <BasePage
      title="Compre em BLZ Pro"
      description="Gerencie Compre em BLZ Pro do seu salão"
      icon={ShoppingCart}
    />
  );
};

export default BlzProPage;
