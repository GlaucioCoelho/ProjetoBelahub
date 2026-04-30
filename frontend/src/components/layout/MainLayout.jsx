import React, { useState } from 'react';
import styles from './MainLayout.module.css';
import SidebarMenu from './SidebarMenu';
import PWAInstallPrompt from '../PWAInstallPrompt';
import { useAuthStore } from '../../store/authStore';
import { NavigationProvider } from '../../store/navigationContext';
import DashboardSalao from '../../pages/DashboardSalao';
import AppointmentsPage from '../../pages/modules/AppointmentsPage';
import WhatsAppPage from '../../pages/modules/WhatsAppPage';
import SalesPage from '../../pages/modules/SalesPage';
import CommandsPage from '../../pages/modules/CommandsPage';
import CashFlowPage from '../../pages/modules/CashFlowPage';
import PayrollPage from '../../pages/modules/PayrollPage';
import ExpensesPage from '../../pages/modules/ExpensesPage';
import InvoicesPage from '../../pages/modules/InvoicesPage';
import ServicesPage from '../../pages/modules/ServicesPage';
import ProductsPage from '../../pages/modules/ProductsPage';
import PackagesPage from '../../pages/modules/PackagesPage';
import ClientsPage from '../../pages/modules/ClientsPage';
import CollaboratorsPage from '../../pages/modules/CollaboratorsPage';
import ReportsPage from '../../pages/modules/ReportsPage';
import OnlineAgendaPage from '../../pages/modules/OnlineAgendaPage';
import SettingsPage from '../../pages/modules/SettingsPage';
import BlzProPage from '../../pages/modules/BlzProPage';
import TrussPage from '../../pages/modules/TrussPage';
import {
  Home, Calendar, DollarSign, Users, Settings, Menu, X, Bell
} from 'lucide-react';

const BOTTOM_NAV = [
  { id: 'dashboard',    icon: Home,     label: 'Início'    },
  { id: 'appointments', icon: Calendar, label: 'Agenda'    },
  { id: 'cash-flow',    icon: DollarSign,label: 'Finanças' },
  { id: 'clients',      icon: Users,    label: 'Clientes'  },
  { id: 'settings',     icon: Settings, label: 'Config'    },
];

const MainLayout = () => {
  const [currentPage, setCurrentPage]   = useState('dashboard');
  const [drawerOpen,  setDrawerOpen]    = useState(false);
  const { usuario } = useAuthStore();
  const userName = usuario?.nome || usuario?.name || 'Usuário';

  const navigate = (id) => {
    setCurrentPage(id);
    setDrawerOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':     return <DashboardSalao />;
      case 'blz-pro':       return <BlzProPage />;
      case 'truss':         return <TrussPage />;
      case 'appointments':  return <AppointmentsPage />;
      case 'whatsapp':      return <WhatsAppPage />;
      case 'sales':         return <SalesPage />;
      case 'commands':      return <CommandsPage />;
      case 'cash-flow':     return <CashFlowPage />;
      case 'payroll':       return <PayrollPage />;
      case 'expenses':      return <ExpensesPage />;
      case 'invoices':      return <InvoicesPage />;
      case 'services':      return <ServicesPage />;
      case 'products':      return <ProductsPage />;
      case 'packages':      return <PackagesPage />;
      case 'clients':       return <ClientsPage />;
      case 'collaborators': return <CollaboratorsPage />;
      case 'reports':       return <ReportsPage />;
      case 'online-agenda': return <OnlineAgendaPage />;
      case 'settings':      return <SettingsPage />;
      default:              return <DashboardSalao />;
    }
  };

  const initials = userName.split(' ').map(n => n[0]).slice(0, 2).join('');

  return (
    <NavigationProvider onNavigate={navigate}>
      <PWAInstallPrompt />
      <div className={styles.layoutContainer}>

        {/* ── Desktop sidebar ── */}
        <div className={styles.desktopSidebar}>
          <SidebarMenu onNavigate={navigate} activePage={currentPage} userName={userName} />
        </div>

        {/* ── Mobile drawer overlay ── */}
        {drawerOpen && (
          <div className={styles.overlay} onClick={() => setDrawerOpen(false)} />
        )}

        {/* ── Mobile drawer ── */}
        <div className={`${styles.mobileDrawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
          <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>
            <X size={20} />
          </button>
          <SidebarMenu onNavigate={navigate} activePage={currentPage} userName={userName} />
        </div>

        {/* ── Mobile top header ── */}
        <header className={styles.mobileHeader}>
          <button className={styles.hamburger} onClick={() => setDrawerOpen(true)}>
            <Menu size={22} />
          </button>
          <div className={styles.mobileLogoWrap}>
            <img src="/logo-belahub.png" alt="BelaHub" className={styles.mobileLogoImg} />
            <span className={styles.mobileLogoText}>
              Bela<span className={styles.mobileLogoTextHub}>Hub</span>
            </span>
          </div>
          <div className={styles.mobileHeaderRight}>
            <button className={styles.headerIconBtn}>
              <Bell size={20} />
            </button>
            <div className={styles.mobileAvatar}>{initials}</div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className={styles.mainContent}>
          {renderPage()}
        </main>

        {/* ── Mobile bottom nav ── */}
        <nav className={styles.bottomNav}>
          {BOTTOM_NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`${styles.bottomNavItem} ${currentPage === id ? styles.bottomNavActive : ''}`}
              onClick={() => navigate(id)}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </NavigationProvider>
  );
};

export default MainLayout;
