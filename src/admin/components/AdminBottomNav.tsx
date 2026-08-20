import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Sliders, Menu } from 'lucide-react';

interface AdminBottomNavProps {
  onOpenMore: () => void;
  unreadOrdersCount?: number;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({ onOpenMore, unreadOrdersCount = 0 }) => {
  const navItems = [
    { label: 'Home', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: unreadOrdersCount },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Content', path: '/admin/content/homepage', icon: Sliders }
  ];

  return (
    <nav
      aria-label="Mobile Admin Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-curator-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-2xl transition-all relative select-none ${
                isActive
                  ? 'text-curator-coral font-bold'
                  : 'text-curator-muted hover:text-curator-charcoal'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                    }`}
                  />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-curator-coral text-white text-[9px] font-mono font-bold flex items-center justify-center animate-bounce">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 font-sans">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-curator-coral mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* More Options Drawer Button */}
        <button
          type="button"
          onClick={onOpenMore}
          aria-label="Open More Admin Options"
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-2xl text-curator-muted hover:text-curator-coral transition-colors select-none active:scale-95"
        >
          <Menu className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight mt-0.5 font-sans">
            More
          </span>
        </button>
      </div>
    </nav>
  );
};
