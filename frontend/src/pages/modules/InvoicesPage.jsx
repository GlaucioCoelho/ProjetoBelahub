import React from 'react';
import BasePage from './BasePage';
import { FileText } from 'lucide-react';

const InvoicesPage = () => {
  return (
    <BasePage
      title="Notas Fiscais"
      description="Gerencie Notas Fiscais do seu salão"
      icon={FileText}
    />
  );
};

export default InvoicesPage;
