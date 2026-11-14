import React from 'react';
import AdminNavTabs from './AdminNavTabs';
import defaultAdminBanner from '../../assets/img/coursepage/thuvien.jpg';

/**
 * Shared Editorial header banner for all Admin management screens.
 * Renders a restrained photo backdrop fading seamlessly into #F8FAFC,
 * paired with a clean serif heading, action controls, and AdminNavTabs.
 */
const AdminPageHeader = ({
  eyebrow = 'Khu vực quản trị',
  eyebrowIcon: EyebrowIcon = null,
  title,
  description,
  actions = null,
  showTabs = true,
  bannerImage = defaultAdminBanner,
}) => {
  return (
    <header
      className="admin-editorial-hero border-b border-slate-300/90"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.76) 0%, rgba(248, 250, 252, 0.84) 68%, rgba(241, 245, 249, 0.92) 100%), url("${bannerImage}")`,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1D4ED8]">
              {EyebrowIcon && <EyebrowIcon size={14} aria-hidden="true" />}
              <span>{eyebrow}</span>
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#111111] sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </div>

        {showTabs && <AdminNavTabs className="border-b-0 pb-0 mb-0" />}
      </div>
    </header>
  );
};

export default AdminPageHeader;
