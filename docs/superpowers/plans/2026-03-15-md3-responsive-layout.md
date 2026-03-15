# MD3レスポンシブUIレイアウト Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 上部タブナビゲーションを MD3 準拠の左サイドバーに変更し、レスポンシブ対応（モバイル/タブレット/デスクトップ）+ コンパクトウィンドウ化する

**Architecture:** Tailwind CSSにMD3デザイントークンを追加し、画面幅に応じてNavigation Drawer(≥840px) / Navigation Rail(600-839px) / Bottom Navigation(<600px)を切り替える。12メニュー項目を5カテゴリにグループ化。TDDで各ナビコンポーネントを実装。

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3.4 (MD3 custom theme), Vitest, Playwright

---

## Chunk 1: ブランチ + MD3デザイントークン + ウィンドウサイズ

### Task 1: ブランチ作成

- [ ] **Step 1: フィーチャーブランチ作成**

```bash
git checkout -b feature/md3-responsive-layout
```

---

### Task 2: MD3デザイントークン設定

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: `tailwind.config.ts` にMD3テーマを追加**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/renderer/**/*.{tsx,ts,html}'],
  theme: {
    extend: {
      colors: {
        md3: {
          primary: '#1976D2',
          'on-primary': '#FFFFFF',
          'primary-container': '#D1E4FF',
          'on-primary-container': '#001D36',
          secondary: '#535F70',
          'on-secondary': '#FFFFFF',
          'secondary-container': '#D7E3F7',
          'on-secondary-container': '#101C2B',
          surface: '#F8F9FF',
          'surface-dim': '#D8DAE0',
          'surface-container-lowest': '#FFFFFF',
          'surface-container-low': '#F2F3F9',
          'surface-container': '#ECEDF3',
          'surface-container-high': '#E6E8EE',
          'surface-container-highest': '#E1E2E8',
          'on-surface': '#191C20',
          'on-surface-variant': '#43474E',
          outline: '#73777F',
          'outline-variant': '#C3C7CF',
          error: '#BA1A1A',
          'on-error': '#FFFFFF',
          'error-container': '#FFDAD6',
        },
      },
      borderRadius: {
        'md3-sm': '8px',
        'md3-md': '12px',
        'md3-lg': '16px',
        'md3-xl': '28px',
      },
      fontSize: {
        'md3-display-sm': ['36px', { lineHeight: '44px', fontWeight: '400' }],
        'md3-headline-sm': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'md3-title-lg': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'md3-title-md': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'md3-title-sm': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'md3-body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'md3-body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'md3-body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'md3-label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'md3-label-md': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'md3-label-sm': ['11px', { lineHeight: '16px', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: コミット**

```bash
git add tailwind.config.ts
git commit -m "feat: MD3デザイントークン（カラー・角丸・タイポグラフィ）をTailwind設定に追加"
```

---

### Task 3: ウィンドウサイズ変更

**Files:**
- Modify: `src/main/main.ts`

- [ ] **Step 1: ウィンドウサイズを変更**

`src/main/main.ts` の `createWindow` 内のBrowserWindow設定を変更:

```typescript
// 変更前
width: 1200,
height: 800,
minWidth: 900,
minHeight: 600,

// 変更後
width: 960,
height: 680,
minWidth: 700,
minHeight: 500,
```

- [ ] **Step 2: コミット**

```bash
git add src/main/main.ts
git commit -m "feat: ウィンドウサイズをFull HD 2/3以下に変更 (960×680, min 700×500)"
```

---

## Chunk 2: ナビゲーション共通定義 + useMediaQuery Hook (TDD)

### Task 4: ナビゲーション定義ファイル

**Files:**
- Create: `src/renderer/navigation.ts`

- [ ] **Step 1: ナビゲーション定義を作成**

```typescript
/**
 * ナビゲーション定義 — タブID・ラベル・カテゴリのマスターデータ
 */

export type Tab =
  | 'report' | 'contactAngle' | 'swelling' | 'chemicalResistance'
  | 'nanoDispersion' | 'plasticizer' | 'carrierSelection'
  | 'blendOptimizer' | 'drugSolubility'
  | 'database' | 'mixture'
  | 'settings';

export interface NavItem {
  id: Tab;
  label: string;
}

export interface NavCategory {
  id: string;
  label: string;
  icon: string;  // Emoji icon for MD3 Navigation Rail / Bottom Nav
  items: NavItem[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'evaluation',
    label: '評価',
    icon: '📊',
    items: [
      { id: 'report', label: '溶解性評価' },
      { id: 'contactAngle', label: '接触角推定' },
      { id: 'swelling', label: '膨潤度予測' },
      { id: 'chemicalResistance', label: '耐薬品性予測' },
    ],
  },
  {
    id: 'selection',
    label: '選定',
    icon: '🔍',
    items: [
      { id: 'nanoDispersion', label: 'ナノ粒子分散' },
      { id: 'plasticizer', label: '可塑剤選定' },
      { id: 'carrierSelection', label: 'キャリア選定' },
    ],
  },
  {
    id: 'optimization',
    label: '最適化',
    icon: '⚡',
    items: [
      { id: 'blendOptimizer', label: 'ブレンド最適化' },
      { id: 'drugSolubility', label: '薬物溶解性' },
    ],
  },
  {
    id: 'data',
    label: 'データ',
    icon: '💾',
    items: [
      { id: 'database', label: 'データベース編集' },
      { id: 'mixture', label: '混合溶媒' },
    ],
  },
  {
    id: 'config',
    label: '設定',
    icon: '⚙️',
    items: [
      { id: 'settings', label: '設定' },
    ],
  },
];

/** 全タブのフラットリスト */
export const ALL_TABS: NavItem[] = NAV_CATEGORIES.flatMap((c) => c.items);

/** タブIDからカテゴリを逆引き */
export function getCategoryForTab(tabId: Tab): NavCategory | undefined {
  return NAV_CATEGORIES.find((c) => c.items.some((item) => item.id === tabId));
}
```

- [ ] **Step 2: コミット**

```bash
git add src/renderer/navigation.ts
git commit -m "feat: ナビゲーション定義ファイル追加（5カテゴリ・12タブ）"
```

---

### Task 5: useMediaQuery Hook (TDD)

**Files:**
- Create: `tests/renderer/useMediaQuery.test.ts`
- Create: `src/renderer/hooks/useMediaQuery.ts`

- [ ] **Step 1: テスト作成（RED）**

```typescript
// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '../../src/renderer/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let listeners: Map<string, ((e: { matches: boolean }) => void)>;

  beforeEach(() => {
    listeners = new Map();
    matchMediaMock = vi.fn((query: string) => {
      const mql = {
        matches: false,
        media: query,
        addEventListener: vi.fn((_, handler) => { listeners.set(query, handler); }),
        removeEventListener: vi.fn(),
      };
      return mql;
    });
    Object.defineProperty(window, 'matchMedia', { value: matchMediaMock, writable: true });
  });

  it('幅840px以上でdesktopを返す', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(min-width: 840px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());
    expect(result.current).toBe('desktop');
  });

  it('幅600-839pxでtabletを返す', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(min-width: 600px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());
    expect(result.current).toBe('tablet');
  });

  it('幅600px未満でmobileを返す', () => {
    matchMediaMock.mockImplementation(() => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());
    expect(result.current).toBe('mobile');
  });
});
```

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/renderer/useMediaQuery.test.ts
```
Expected: FAIL

- [ ] **Step 3: 実装（GREEN）**

```typescript
import { useState, useEffect } from 'react';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

/**
 * MD3ブレークポイントに基づく画面サイズ検出
 * - mobile: <600px
 * - tablet: 600-839px
 * - desktop: ≥840px
 */
export function useMediaQuery(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => getScreenSize());

  useEffect(() => {
    const desktopMql = window.matchMedia('(min-width: 840px)');
    const tabletMql = window.matchMedia('(min-width: 600px)');

    const update = () => {
      setScreenSize(getScreenSize());
    };

    desktopMql.addEventListener('change', update);
    tabletMql.addEventListener('change', update);

    return () => {
      desktopMql.removeEventListener('change', update);
      tabletMql.removeEventListener('change', update);
    };
  }, []);

  return screenSize;
}

function getScreenSize(): ScreenSize {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia('(min-width: 840px)').matches) return 'desktop';
  if (window.matchMedia('(min-width: 600px)').matches) return 'tablet';
  return 'mobile';
}
```

- [ ] **Step 4: テスト実行で全パスを確認**

```bash
npx vitest run tests/renderer/useMediaQuery.test.ts
```
Expected: ALL PASS

- [ ] **Step 5: コミット**

```bash
git add tests/renderer/useMediaQuery.test.ts src/renderer/hooks/useMediaQuery.ts
git commit -m "feat: useMediaQuery Hook追加（MD3ブレークポイント: mobile/tablet/desktop）"
```

---

## Chunk 3: NavigationDrawer (TDD)

### Task 6: NavigationDrawer テスト + 実装

**Files:**
- Create: `tests/renderer/NavigationDrawer.test.tsx`
- Create: `src/renderer/components/NavigationDrawer.tsx`

- [ ] **Step 1: テスト作成（RED）**

```tsx
// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import NavigationDrawer from '../../src/renderer/components/NavigationDrawer';

describe('NavigationDrawer', () => {
  const onSelect = vi.fn();

  it('5カテゴリが表示される', () => {
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('評価')).toBeInTheDocument();
    expect(screen.getByText('選定')).toBeInTheDocument();
    expect(screen.getByText('最適化')).toBeInTheDocument();
    expect(screen.getByText('データ')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('アクティブタブのカテゴリが展開されサブ項目が表示される', () => {
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('溶解性評価')).toBeInTheDocument();
    expect(screen.getByText('接触角推定')).toBeInTheDocument();
  });

  it('アクティブタブにMD3ハイライトが適用される', () => {
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    const activeItem = screen.getByText('溶解性評価').closest('button');
    expect(activeItem?.className).toContain('bg-md3-secondary-container');
  });

  it('サブ項目クリックでonSelectが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('接触角推定'));
    expect(onSelect).toHaveBeenCalledWith('contactAngle');
  });

  it('カテゴリクリックで展開が切り替わる', async () => {
    const user = userEvent.setup();
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    // 「選定」カテゴリをクリック
    await user.click(screen.getByText('選定'));
    expect(screen.getByText('ナノ粒子分散')).toBeInTheDocument();
  });

  it('data-testid="navigation-drawer"が設定される', () => {
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    expect(screen.getByTestId('navigation-drawer')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/renderer/NavigationDrawer.test.tsx
```
Expected: FAIL

- [ ] **Step 3: 実装（GREEN）**

MD3 Navigation Drawer — 左サイドバー（240px幅）にカテゴリ+サブ項目を表示。
アクティブカテゴリは展開状態、アクティブタブは `bg-md3-secondary-container` でハイライト。
カテゴリクリックで展開トグル。サブ項目クリックで `onSelect(tabId)` を呼ぶ。
MD3の `rounded-md3-xl` (28px角丸) をアクティブ項目のインジケータに使用。

Props: `activeTab: Tab`, `onSelect: (tab: Tab) => void`

- [ ] **Step 4: テスト実行で全パスを確認**

```bash
npx vitest run tests/renderer/NavigationDrawer.test.tsx
```
Expected: ALL PASS

- [ ] **Step 5: コミット**

```bash
git add tests/renderer/NavigationDrawer.test.tsx src/renderer/components/NavigationDrawer.tsx
git commit -m "feat: MD3 NavigationDrawer コンポーネント追加（5カテゴリ・展開式サイドバー）"
```

---

## Chunk 4: NavigationRail + BottomNavigation (TDD)

### Task 7: NavigationRail テスト + 実装

**Files:**
- Create: `tests/renderer/NavigationRail.test.tsx`
- Create: `src/renderer/components/NavigationRail.tsx`

- [ ] **Step 1: テスト作成（RED）**

```tsx
// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import NavigationRail from '../../src/renderer/components/NavigationRail';

describe('NavigationRail', () => {
  const onSelect = vi.fn();

  it('5カテゴリアイコンが表示される', () => {
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('💾')).toBeInTheDocument();
    expect(screen.getByText('⚙️')).toBeInTheDocument();
  });

  it('カテゴリラベルが表示される', () => {
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('評価')).toBeInTheDocument();
    expect(screen.getByText('選定')).toBeInTheDocument();
  });

  it('アクティブカテゴリにMD3インジケータが表示される', () => {
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    // 評価カテゴリにアクティブ状態のインジケータ
    const activeIcon = screen.getByText('📊').closest('button');
    expect(activeIcon?.querySelector('.bg-md3-secondary-container')).toBeInTheDocument();
  });

  it('カテゴリクリックで展開ポップオーバーが表示される', async () => {
    const user = userEvent.setup();
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('📊'));
    // サブメニューが表示される
    expect(screen.getByText('溶解性評価')).toBeInTheDocument();
  });

  it('サブ項目クリックでonSelectが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('📊'));
    await user.click(screen.getByText('接触角推定'));
    expect(onSelect).toHaveBeenCalledWith('contactAngle');
  });

  it('data-testid="navigation-rail"が設定される', () => {
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    expect(screen.getByTestId('navigation-rail')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: テスト実行で失敗 → 実装（GREEN）**

MD3 Navigation Rail — 左端80px幅。アイコン+ラベルを縦積み。
カテゴリクリックでポップオーバーメニュー表示。
MD3のpill-shapedインジケータ（`rounded-md3-lg`）をアクティブカテゴリに使用。

- [ ] **Step 3: テスト全パス → コミット**

```bash
git add tests/renderer/NavigationRail.test.tsx src/renderer/components/NavigationRail.tsx
git commit -m "feat: MD3 NavigationRail コンポーネント追加（タブレット向け・ポップオーバーメニュー）"
```

---

### Task 8: BottomNavigation テスト + 実装

**Files:**
- Create: `tests/renderer/BottomNavigation.test.tsx`
- Create: `src/renderer/components/BottomNavigation.tsx`

- [ ] **Step 1: テスト作成（RED）**

```tsx
// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import BottomNavigation from '../../src/renderer/components/BottomNavigation';

describe('BottomNavigation', () => {
  const onSelect = vi.fn();

  it('5カテゴリが下部に表示される', () => {
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('評価')).toBeInTheDocument();
    expect(screen.getByText('選定')).toBeInTheDocument();
    expect(screen.getByText('最適化')).toBeInTheDocument();
    expect(screen.getByText('データ')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('アクティブカテゴリにMD3インジケータが表示される', () => {
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    const activeItem = screen.getByText('評価').closest('button');
    expect(activeItem?.querySelector('.bg-md3-secondary-container')).toBeInTheDocument();
  });

  it('カテゴリタップでサブメニューが表示される', async () => {
    const user = userEvent.setup();
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('評価'));
    expect(screen.getByText('溶解性評価')).toBeInTheDocument();
  });

  it('サブ項目タップでonSelectが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('評価'));
    await user.click(screen.getByText('膨潤度予測'));
    expect(onSelect).toHaveBeenCalledWith('swelling');
  });

  it('data-testid="bottom-navigation"が設定される', () => {
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: テスト実行で失敗 → 実装（GREEN）**

MD3 Bottom Navigation Bar — 画面下部固定。5カテゴリのアイコン+ラベル。
タップでポップアップメニュー表示。MD3のpill-shapedアクティブインジケータ。

- [ ] **Step 3: テスト全パス → コミット**

```bash
git add tests/renderer/BottomNavigation.test.tsx src/renderer/components/BottomNavigation.tsx
git commit -m "feat: MD3 BottomNavigation コンポーネント追加（モバイル向け・ポップアップメニュー）"
```

---

## Chunk 5: App.tsx レスポンシブ統合 (TDD)

### Task 9: App.tsx テスト更新 + 全面書き換え

**Files:**
- Modify: `tests/renderer/App.test.tsx`
- Modify: `src/renderer/App.tsx`

- [ ] **Step 1: テスト更新（RED）**

`tests/renderer/App.test.tsx` を以下に書き換え:

```tsx
// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../../src/renderer/App';
import { setupMockApi } from './setup';
import { resetIdCounter } from './factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('App', () => {
  it('ヘッダーにアプリタイトル表示', () => {
    render(<App />);
    expect(screen.getByText('Hansen溶解度パラメータ 溶解性評価ツール')).toBeInTheDocument();
  });

  it('ナビゲーションが表示される', () => {
    render(<App />);
    // デスクトップ幅ではNavigationDrawerが表示される
    // カテゴリが表示されることを確認
    expect(screen.getByText('評価')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('初期タブが「溶解性評価」', () => {
    render(<App />);
    expect(screen.getByText('評価条件')).toBeInTheDocument();
  });

  it('ナビ項目クリックでビューが切り替わる', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 設定カテゴリをクリック（1項目のみなので直接遷移）
    await user.click(screen.getByText('設定'));
    // 設定の中の「設定」サブ項目をクリック（表示されている場合）
    const settingsSubItem = screen.queryByRole('button', { name: /^設定$/ });
    if (settingsSubItem && settingsSubItem !== screen.getByText('設定').closest('button')) {
      await user.click(settingsSubItem);
    }

    await waitFor(() => {
      expect(screen.getByText('リスク判定閾値設定')).toBeInTheDocument();
    });
  });

  it('MD3 Surface背景色が適用される', () => {
    const { container } = render(<App />);
    const appRoot = container.firstChild as HTMLElement;
    expect(appRoot.className).toContain('bg-md3-surface');
  });
});
```

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/renderer/App.test.tsx
```
Expected: FAIL

- [ ] **Step 3: App.tsx 全面書き換え（GREEN）**

```tsx
import React, { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import NavigationDrawer from './components/NavigationDrawer';
import NavigationRail from './components/NavigationRail';
import BottomNavigation from './components/BottomNavigation';
import { useMediaQuery } from './hooks/useMediaQuery';
import type { Tab } from './navigation';

// View imports (既存12件すべて)
import ReportView from './components/ReportView';
import DatabaseEditor from './components/DatabaseEditor';
import SettingsView from './components/SettingsView';
import MixtureLab from './components/MixtureLab';
import NanoDispersionView from './components/NanoDispersionView';
import ContactAngleView from './components/ContactAngleView';
import SwellingView from './components/SwellingView';
import DrugSolubilityView from './components/DrugSolubilityView';
import BlendOptimizerView from './components/BlendOptimizerView';
import ChemicalResistanceView from './components/ChemicalResistanceView';
import PlasticizerView from './components/PlasticizerView';
import CarrierSelectionView from './components/CarrierSelectionView';

const VIEW_MAP: Record<Tab, React.ComponentType> = {
  report: ReportView,
  database: DatabaseEditor,
  mixture: MixtureLab,
  nanoDispersion: NanoDispersionView,
  contactAngle: ContactAngleView,
  blendOptimizer: BlendOptimizerView,
  swelling: SwellingView,
  drugSolubility: DrugSolubilityView,
  chemicalResistance: ChemicalResistanceView,
  plasticizer: PlasticizerView,
  carrierSelection: CarrierSelectionView,
  settings: SettingsView,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('report');
  const screenSize = useMediaQuery();
  const ActiveView = VIEW_MAP[activeTab];

  return (
    <div className="h-screen bg-md3-surface flex flex-col">
      {/* ヘッダー */}
      <header className="bg-md3-surface-container-low border-b border-md3-outline-variant px-4 py-2 shrink-0">
        <h1 className="text-md3-title-lg text-md3-on-surface">
          Hansen溶解度パラメータ 溶解性評価ツール
        </h1>
      </header>

      {/* メインエリア: ナビ + コンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* デスクトップ: NavigationDrawer */}
        {screenSize === 'desktop' && (
          <NavigationDrawer activeTab={activeTab} onSelect={setActiveTab} />
        )}

        {/* タブレット: NavigationRail */}
        {screenSize === 'tablet' && (
          <NavigationRail activeTab={activeTab} onSelect={setActiveTab} />
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto p-4">
          <ErrorBoundary>
            <ActiveView />
          </ErrorBoundary>
        </main>
      </div>

      {/* モバイル: BottomNavigation */}
      {screenSize === 'mobile' && (
        <BottomNavigation activeTab={activeTab} onSelect={setActiveTab} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: テスト実行で全パスを確認**

```bash
npx vitest run tests/renderer/App.test.tsx
```
Expected: ALL PASS

- [ ] **Step 5: コミット**

```bash
git add tests/renderer/App.test.tsx src/renderer/App.tsx
git commit -m "feat: App.tsxをMD3レスポンシブレイアウトに全面書き換え（Drawer/Rail/Bottom Nav）"
```

---

## Chunk 6: MD3スタイル適用 + E2Eテスト修正

### Task 10: Badge コンポーネントのMD3スタイル統一

**Files:**
- Modify: `src/renderer/components/RiskBadge.tsx`
- Modify: `src/renderer/components/DispersibilityBadge.tsx`
- Modify: `src/renderer/components/WettabilityBadge.tsx`
- Modify: `src/renderer/components/SwellingBadge.tsx`
- Modify: `src/renderer/components/DrugSolubilityBadge.tsx`
- Modify: `src/renderer/components/ChemicalResistanceBadge.tsx`
- Modify: `src/renderer/components/PlasticizerBadge.tsx`
- Modify: `src/renderer/components/CarrierBadge.tsx`

- [ ] **Step 1: 全BadgeのTailwindクラスをMD3スタイルに更新**

各Badgeの `className` を MD3 Tonal Button スタイルに統一:

```
// 変更前
className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ..."

// 変更後
className="inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md font-medium ..."
```

色クラスはそのまま維持（各Badge独自のカラーマッピング）。

- [ ] **Step 2: ビルド確認**

```bash
npx vitest run tests/unit/
```
Expected: ALL PASS

- [ ] **Step 3: コミット**

```bash
git add src/renderer/components/*Badge.tsx
git commit -m "style: 全BadgeコンポーネントをMD3 Tonal Buttonスタイルに統一"
```

---

### Task 11: E2Eテストのナビゲーションセレクタ修正

**Files:**
- Modify: `tests/e2e/helpers.ts`

- [ ] **Step 1: `clickTab` ヘルパーをサイドバー対応に修正**

```typescript
/**
 * ナビゲーションからタブを選択する（MD3レスポンシブ対応）
 * デスクトップ幅ではNavigationDrawer内のボタンをクリック
 */
export async function clickTab(page: Page, tabText: string): Promise<void> {
  // まずサイドバー(NavigationDrawer)内のサブ項目を探す
  const drawerItem = page.locator('[data-testid="navigation-drawer"] button', { hasText: tabText });
  if (await drawerItem.count() > 0) {
    await drawerItem.scrollIntoViewIfNeeded();
    await drawerItem.click();
    return;
  }
  // カテゴリを展開してからサブ項目をクリック
  const allButtons = page.locator('[data-testid="navigation-drawer"] button');
  const count = await allButtons.count();
  for (let i = 0; i < count; i++) {
    await allButtons.nth(i).click();
    await page.waitForTimeout(200);
    const item = page.locator('[data-testid="navigation-drawer"] button', { hasText: tabText });
    if (await item.count() > 0) {
      await item.click();
      return;
    }
  }
  // フォールバック: テキストで直接検索
  await page.getByText(tabText).click();
}
```

- [ ] **Step 2: ビルド + E2Eテスト実行**

```bash
npm run build
npx playwright test tests/e2e/ --timeout 60000 --workers 1
```

- [ ] **Step 3: コミット**

```bash
git add tests/e2e/helpers.ts
git commit -m "test: E2Eヘルパーをサイドバーナビゲーション対応に修正"
```

---

### Task 12: 全テスト確認 + マージ

- [ ] **Step 1: 全ユニットテスト実行**

```bash
npx vitest run
```
Expected: ALL PASS

- [ ] **Step 2: ビルド確認**

```bash
npm run build
```
Expected: OK

- [ ] **Step 3: E2Eテスト実行**

```bash
npx playwright test tests/e2e/ --timeout 60000 --workers 1
```
Expected: ALL PASS

- [ ] **Step 4: masterへマージ**

```bash
git checkout master
git merge feature/md3-responsive-layout --no-ff -m "feat: MD3レスポンシブUIレイアウトに全面刷新（Drawer/Rail/Bottom Nav）"
```
