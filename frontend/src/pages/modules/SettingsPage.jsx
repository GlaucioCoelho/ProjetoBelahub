import React from 'react';
import BasePage from './BasePage';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return (
    <BasePage
      title="Configurações"
      description="Gerencie Configurações do seu salão"
      icon={Settings}
    />
  );
};

export default SettingsPage;
