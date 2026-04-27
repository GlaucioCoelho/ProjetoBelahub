import React from 'react';
import BasePage from './BasePage';
import { MessageCircle } from 'lucide-react';

const WhatsAppPage = () => {
  return (
    <BasePage
      title="WhatsApp"
      description="Gerencie WhatsApp do seu salão"
      icon={MessageCircle}
    />
  );
};

export default WhatsAppPage;
