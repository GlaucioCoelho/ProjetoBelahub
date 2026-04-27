import React from 'react';
import styles from './SidebarMenu.module.css';
import {
  Home, Calendar, Users, Package, FileText, MessageCircle,
  TrendingUp, CreditCard, MinusCircle, Settings, LogOut,
  ShoppingBag, Layers, BarChart2, Globe, ChevronRight,
  BookOpen, UserCheck, Receipt,
} from 'lucide-react';

const menuStructure = [
  {
    items: [
      { label: 'Página principal', icon: Home, id: 'dashboard' },
    ],
  },
  {
    section: 'Atendimento',
    items: [
      { label: 'Atendimentos', icon: Calendar,      id: 'appointments' },
      { label: 'WhatsApp',     icon: MessageCircle, id: 'whatsapp'     },
      { label: 'Vendas',       icon: ShoppingBag,   id: 'sales'        },
      { label: 'Comandas',     icon: Receipt,       id: 'commands'     },
    ],
  },
  {
    section: 'Financeiro',
    items: [
      { label: 'Fluxo de Caixa',  icon: TrendingUp,  id: 'cash-flow' },
      { label: 'Remunerações',    icon: CreditCard,  id: 'payroll'   },
      { label: 'Despesas',        icon: MinusCircle, id: 'expenses'  },
      { label: 'Notas Fiscais',   icon: FileText,    id: 'invoices'  },
    ],
  },
  {
    section: 'Cadastros',
    items: [
      { label: 'Serviços',  icon: Layers,   id: 'services'  },
      { label: 'Produtos',  icon: Package,  id: 'products'  },
      { label: 'Pacotes',   icon: BookOpen, id: 'packages'  },
    ],
  },
  {
    section: 'Relacionamento',
    items: [
      { label: 'Clientes',       icon: Users,     id: 'clients'       },
      { label: 'Colaboradores',  icon: UserCheck, id: 'collaborators' },
      { label: 'Relatórios',     icon: BarChart2, id: 'reports'       },
      { label: 'Agenda Online',  icon: Globe,     id: 'online-agenda' },
    ],
  },
  {
    divider: true,
    items: [
      { label: 'Configurações', icon: Settings, id: 'settings' },
      { label: 'Sair',          icon: LogOut,   id: 'logout', isLogout: true },
    ],
  },
];

const SidebarMenu = ({ onNavigate, activePage, userName }) => {
  const initials = userName
    ? userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleClick = (item) => {
    if (item.isLogout) {
      localStorage.removeItem('userToken');
      window.location.href = '/login';
      return;
    }
    if (onNavigate) onNavigate(item.id);
  };

  return (
    <div className={styles.sidebar}>
      {/* ── Logo ── */}
      <div className={styles.logoSection}>
        <div className={styles.logoRow}>
          <div className={styles.logoIconWrap}>
            <img
              src="/logo-belahub.png"
              alt="BelaHub"
              className={styles.logoImg}
            />
          </div>
          <div className={styles.logoTextWrap}>
            <span className={styles.logoTextBela}>Bela</span>
            <span className={styles.logoTextHub}>Hub</span>
          </div>
        </div>

        {userName && (
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userName}</div>
              <span className={styles.userPlan}>Plano Pro</span>
            </div>
            <ChevronRight size={14} className={styles.userChevron} />
          </div>
        )}
      </div>

      {/* ── Menu ── */}
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuStructure.map((group, gi) => (
            <React.Fragment key={gi}>
              {group.divider && <li className={styles.divider} />}
              {group.section && (
                <li className={styles.sectionHeader}>{group.section}</li>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      className={`${styles.menuItem} ${isActive ? styles.active : ''} ${item.isLogout ? styles.logout : ''}`}
                      onClick={() => handleClick(item)}
                    >
                      <Icon className={styles.icon} size={17} />
                      <span className={styles.label}>{item.label}</span>
                      {item.isNew && <span className={styles.badge}>NOVO</span>}
                    </button>
                  </li>
                );
              })}
            </React.Fragment>
          ))}
        </ul>
      </nav>

      {/* ── Footer user ── */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerAvatar}>{initials}</div>
          <div>
            <div className={styles.footerName}>{userName || 'Usuário'}</div>
            <div className={styles.footerRole}>Administrador</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;
