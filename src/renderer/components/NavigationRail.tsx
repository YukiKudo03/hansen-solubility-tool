import React, { useState, useRef, useEffect } from 'react';
import { NAV_CATEGORIES, getCategoryForTab } from '../navigation';
import type { Tab } from '../navigation';

interface NavigationRailProps {
  activeTab: Tab;
  onSelect: (tab: Tab) => void;
}

const NavigationRail: React.FC<NavigationRailProps> = ({ activeTab, onSelect }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const activeCategory = getCategoryForTab(activeTab);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openCategory) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleItemClick = (tabId: Tab) => {
    onSelect(tabId);
    setOpenCategory(null);
  };

  return (
    <nav
      ref={navRef}
      data-testid="navigation-rail"
      aria-label="メインナビゲーション"
      className="w-20 h-full bg-md3-surface-container flex flex-col items-center py-4 gap-2 relative"
    >
      {NAV_CATEGORIES.map((category) => {
        const isActive = activeCategory?.id === category.id;
        const isOpen = openCategory === category.id;

        return (
          <div key={category.id} className="relative w-full flex flex-col items-center">
            <button
              className="flex flex-col items-center gap-1 w-full py-2 px-1"
              aria-expanded={openCategory === category.id}
              onClick={() => handleCategoryClick(category.id)}
            >
              <span
                className={
                  `flex items-center justify-center w-14 h-8 ` +
                  (isActive ? 'bg-md3-secondary-container rounded-md3-lg' : '')
                }
              >
                {category.icon}
              </span>
              <span className="text-md3-label-sm text-md3-on-surface-variant">
                {category.label}
              </span>
            </button>

            {isOpen && (
              <div className="absolute left-full top-0 ml-2 bg-md3-surface-container-low shadow-lg rounded-md3-md z-50 min-w-36">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    className="block w-full text-left px-4 py-2 text-md3-on-surface hover:bg-md3-surface-container-highest"
                    onClick={() => handleItemClick(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default NavigationRail;
