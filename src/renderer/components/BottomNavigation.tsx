import React, { useState } from 'react';
import { NAV_CATEGORIES, getCategoryForTab } from '../navigation';
import type { Tab } from '../navigation';

interface BottomNavigationProps {
  activeTab: Tab;
  onSelect: (tab: Tab) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onSelect }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const activeCategory = getCategoryForTab(activeTab);

  const handleCategoryClick = (categoryId: string) => {
    setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleItemClick = (tabId: Tab) => {
    onSelect(tabId);
    setOpenCategory(null);
  };

  return (
    <nav
      data-testid="bottom-navigation"
      className="w-full bg-md3-surface-container flex justify-around items-center h-16 relative"
    >
      {NAV_CATEGORIES.map((category) => {
        const isActive = activeCategory?.id === category.id;
        const isOpen = openCategory === category.id;

        return (
          <div key={category.id} className="relative flex flex-col items-center">
            {isOpen && (
              <div className="absolute bottom-full mb-2 bg-md3-surface-container-low shadow-lg rounded-md3-md z-50 min-w-36">
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

            <button
              className="flex flex-col items-center gap-1 px-3 py-1"
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
          </div>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
