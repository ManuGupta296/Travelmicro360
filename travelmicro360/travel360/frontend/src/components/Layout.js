import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Plane, Bell, User, LayoutDashboard, Users, Briefcase,
  FileText, CreditCard, ShieldCheck, BarChart3, Settings, Package, BookOpen,
  ClipboardCheck, Building2, PieChart, LogOut, Receipt, MapPin
} from 'lucide-react';
import NotificationBell from './shared/NotificationBell';

const SIDEBAR_CONFIG = {
  TRAVELER: [
    { group: 'Travel', items: [
      { to: '/traveler/home', icon: <Home size={18}/>, label: 'Home' },
      { to: '/traveler/trips', icon: <Plane size={18}/>, label: 'My Bookings' },
      { to: '/traveler/itineraries', icon: <MapPin size={18}/>, label: 'My Trips' },
      { to: '/notifications', icon: <Bell size={18}/>, label: 'Notifications' },
      { to: '/profile', icon: <User size={18}/>, label: 'Profile' },
    ]},
  ],
  TRAVEL_AGENT: [
    { group: 'Agent', items: [
      { to: '/agent/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { to: '/agent/customers', icon: <Users size={18}/>, label: 'Customers' },
      { to: '/agent/group-booking', icon: <BookOpen size={18}/>, label: 'New Booking' },
      { to: '/agent/bookings', icon: <BookOpen size={18}/>, label: 'My Bookings' },
      { to: '/agent/commissions', icon: <CreditCard size={18}/>, label: 'Commissions' },
    ]},
  ],
  CORPORATE_MANAGER: [
    { group: 'Corporate', items: [
      { to: '/corp/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { to: '/corp/employees', icon: <Users size={18}/>, label: 'Employees' },
      { to: '/corp/approvals', icon: <ClipboardCheck size={18}/>, label: 'Approvals' },
      { to: '/corp/budget', icon: <PieChart size={18}/>, label: 'Budget' },
      { to: '/corp/reports', icon: <BarChart3 size={18}/>, label: 'Reports' },
    ]},
  ],
  FINANCE_OFFICER: [
    { group: 'Finance', items: [
      { to: '/finance/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { to: '/finance/invoices', icon: <Receipt size={18}/>, label: 'Invoices' },
      { to: '/finance/payments', icon: <CreditCard size={18}/>, label: 'Payments' },
      { to: '/finance/settlements', icon: <Briefcase size={18}/>, label: 'Settlements' },
      { to: '/finance/revenue', icon: <BarChart3 size={18}/>, label: 'Revenue' },
      { to: '/finance/kpi-reports', icon: <PieChart size={18}/>, label: 'KPI Reports' },
    ]},
  ],
  COMPLIANCE_OFFICER: [
    { group: 'Compliance', items: [
      { to: '/compliance/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { to: '/compliance/audit-logs', icon: <FileText size={18}/>, label: 'Audit Logs' },
      { to: '/compliance/reports', icon: <ShieldCheck size={18}/>, label: 'Reports' },
      { to: '/compliance/violations', icon: <ShieldCheck size={18}/>, label: 'Violations' },
    ]},
  ],
  ADMIN: [
    { group: 'Administration', items: [
      { to: '/admin/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { to: '/admin/users', icon: <Users size={18}/>, label: 'Users' },
      { to: '/admin/partners', icon: <Building2 size={18}/>, label: 'Partners' },
      { to: '/admin/inventory', icon: <Package size={18}/>, label: 'Inventory' },
      // { to: '/admin/settings', icon: <Settings size={18}/>, label: 'Settings' }, // hidden from nav (route + page kept intact)
    ]},
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarItems = SIDEBAR_CONFIG[user?.role] || SIDEBAR_CONFIG.TRAVELER;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">Travel<span>360</span></div>
        <nav className="sidebar-nav">
          {sidebarItems.map(group => (
            <div key={group.group}>
              <div className="sidebar-group-label">{group.group}</div>
              {group.items.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  {item.icon} {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button className="sidebar-link w-100 border-0 bg-transparent text-start" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="app-main">
        <header className="app-topbar">
          <div className="flex-grow-1">
            <span className="text-muted small">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <NotificationBell />
            <div className="d-flex align-items-center gap-2">
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-light), var(--teal))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700
              }}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="small fw-medium d-none d-md-inline">{user?.name}</span>
            </div>
          </div>
        </header>
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

