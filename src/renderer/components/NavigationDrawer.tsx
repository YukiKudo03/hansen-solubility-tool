import React, { useState } from 'react';
import { NAV_CATEGORIES, getCategoryForTab } from '../navigation';
import type { Tab } from '../navigation';

interface NavigationDrawerProps {
  activeTab: Tab;
  onSelect: (tab: Tab) => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ activeTab, onSelect }) => {
  const activeCategory = getCategoryForTab(activeTab);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(activeCategory ? [activeCategory.id] : [])
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <nav
      data-testid="navigation-drawer"
      className="w-60 h-full bg-md3-surface-container-low overflow-y-auto flex flex-col"
    >
      {NAV_CATEGORIES.map((category) => {
        const isExpanded = expandedCategories.has(category.id);

        return (
          <div key={category.id}>
            <button
              className="flex items-center gap-3 px-4 py-2 w-full text-left text-md3-on-surface hover:bg-md3-surface-container-highest"
              onClick={() => toggleCategory(category.id)}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>

            {isExpanded && (
              <div>
                {category.items.map((item) => {
                  const isActive = item.id === activeTab;
                  return (
                    <button
                      key={item.id}
                      className={
                        `pl-12 pr-4 py-2 w-full text-left rounded-md3-xl ` +
                        (isActive
                          ? 'bg-md3-secondary-container text-md3-on-secondary-container font-medium'
                          : 'text-md3-on-surface-variant hover:bg-md3-surface-container-highest')
                      }
                      onClick={() => onSelect(item.id)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default NavigationDrawer;
