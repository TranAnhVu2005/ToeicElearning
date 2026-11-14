import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  CreditCard,
  GraduationCap,
  Users,
} from 'lucide-react';

const ADMIN_TABS = [
  {
    to: '/admin/dashboard',
    label: 'Tổng quan',
    icon: Activity,
  },
  {
    to: '/admin/tests',
    label: 'Quản lý đề thi',
    icon: BookOpen,
  },
  {
    to: '/admin/users',
    label: 'Người dùng',
    icon: Users,
  },
  {
    to: '/admin/payments',
    label: 'Giao dịch VNPAY',
    icon: CreditCard,
  },
  {
    to: '/admin/teacher-applications',
    label: 'Hồ sơ giáo viên',
    icon: GraduationCap,
  },
];

const AdminNavTabs = ({ className = '' }) => {
  return (
    <nav
      aria-label="Điều hướng phân hệ quản trị"
      className={`admin-nav-tabs flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 mb-6 ${className}`.trim()}
    >
      {ADMIN_TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `inline-flex min-h-[40px] items-center gap-2 rounded-[2px] border px-3.5 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                  : 'border-slate-300 bg-white/95 text-slate-700 hover:border-[#1D4ED8] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]'
              }`
            }
          >
            <Icon size={16} aria-hidden="true" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default AdminNavTabs;

