import React, { useState } from 'react';
import s from './admin.module.css';
import {
  LayoutDashboard, Building2, CreditCard, Users,
  ScrollText, Settings, LogOut, Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AdminDashboard from './AdminDashboard';
import AdminTenants   from './AdminTenants';
import AdminPlans     from './AdminPlans';
import AdminAuditLog  from './AdminAuditLog';
import AdminSettings  from './AdminSettings';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard, section: 'principal' },
  { id: 'tenants',   label: 'Empresas',   icon: Building2,       section: 'principal' },
  { id: 'plans',     label: 'Planos',     icon: CreditCard,      section: 'principal' },
  { id: 'audit',     label: 'Auditoria',  icon: ScrollText,      section: 'sistema'   },
  { id: 'settings',  label: 'Configurações', icon: Settings,     section: 'sistema'   },
];

function Page({ page }) {
  if (page === 'dashboard') return <AdminDashboard />;
  if (page === 'tenants')   return <AdminTenants />;
  if (page === 'plans')     return <AdminPlans />;
  if (page === 'audit')     return <AdminAuditLog />;
  if (page === 'settings')  return <AdminSettings />;
  return null;
}

const PAGE_TITLE = {
  dashboard: { title: 'Dashboard', sub: 'Visão geral do SaaS BelaHub' },
  tenants:   { title: 'Empresas',  sub: 'Gestão de clientes e assinaturas' },
  plans:     { title: 'Planos',    sub: 'Configuração de planos e preços' },
  audit:     { title: 'Auditoria', sub: 'Registro de atividades do sistema' },
  settings:  { title: 'Configurações', sub: 'Ajustes gerais da plataforma' },
};

export default function AdminLayout() {
  const [page, setPage] = useState('dashboard');
  const { usuario, logout } = useAuthStore();
  const { title, sub } = PAGE_TITLE[page] || PAGE_TITLE.dashboard;

  const initials = (name = '') => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={s.root}>
      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.sidebarBrand}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
              <span className={s.brandName}>BelaHub</span>
              <span className={s.brandBadge}>ADMIN</span>
            </div>
            <div className={s.brandSub}>Painel Administrativo</div>
          </div>
        </div>

        <nav className={s.nav}>
          {['principal', 'sistema'].map(sec => {
            const items = NAV.filter(n => n.section === sec);
            return (
              <React.Fragment key={sec}>
                <div className={s.navSection}>{sec === 'principal' ? 'Principal' : 'Sistema'}</div>
                {items.map(item => (
                  <button
                    key={item.id}
                    className={`${s.navItem} ${page === item.id ? s.navItemActive : ''}`}
                    onClick={() => setPage(item.id)}
                  >
                    <item.icon size={16}/>
                    {item.label}
                  </button>
                ))}
              </React.Fragment>
            );
          })}
        </nav>

        <div className={s.sidebarFooter}>
          <div className={s.adminInfo}>
            <div className={s.adminAvatar}>{initials(usuario?.nome || 'A')}</div>
            <div>
              <div className={s.adminName}>{usuario?.nome || 'Admin'}</div>
              <div className={s.adminRole}>Super Admin</div>
            </div>
            <button className={s.logoutBtn} onClick={logout} title="Sair">
              <LogOut size={16}/>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={s.main}>
        <header className={s.topbar}>
          <div>
            <div className={s.topbarTitle}>{title}</div>
            <div className={s.topbarSub}>{sub}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(124,58,237,0.06)',border:'1px solid rgba(124,58,237,0.15)',borderRadius:8,padding:'6px 12px'}}>
              <Shield size={14} style={{color:'#7c3aed'}}/>
              <span style={{fontSize:12,fontWeight:700,color:'#7c3aed'}}>Super Admin</span>
            </div>
          </div>
        </header>
        <div className={s.content}>
          <Page page={page}/>
        </div>
      </div>
    </div>
  );
}
