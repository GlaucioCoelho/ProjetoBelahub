import React from 'react';
import BasePage from './BasePage';
import { Globe } from 'lucide-react';

const OnlineAgendaPage = () => {
  return (
    <BasePage
      title="Agenda Online"
      description="Gerencie Agenda Online do seu salão"
      icon={Globe}
    />
  );
};

export default OnlineAgendaPage;
