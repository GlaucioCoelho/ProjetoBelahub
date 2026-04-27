import React from 'react';
import BasePage from './BasePage';
import { BarChart3 } from 'lucide-react';

const ReportsPage = () => {
  return (
    <BasePage
      title="Relatórios"
      description="Gerencie Relatórios do seu salão"
      icon={BarChart3}
    />
  );
};

export default ReportsPage;
