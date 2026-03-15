import { useState, useEffect } from 'react';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

function getScreenSize(): ScreenSize {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia('(min-width: 840px)').matches) return 'desktop';
  if (window.matchMedia('(min-width: 600px)').matches) return 'tablet';
  return 'mobile';
}

export function useMediaQuery(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => getScreenSize());

  useEffect(() => {
    const desktopMql = window.matchMedia('(min-width: 840px)');
    const tabletMql = window.matchMedia('(min-width: 600px)');

    const update = () => setScreenSize(getScreenSize());

    desktopMql.addEventListener('change', update);
    tabletMql.addEventListener('change', update);

    return () => {
      desktopMql.removeEventListener('change', update);
      tabletMql.removeEventListener('change', update);
    };
  }, []);

  return screenSize;
}
