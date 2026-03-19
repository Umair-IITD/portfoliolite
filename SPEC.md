# PortfolioLite — Technical Specification

**Version:** 1.0.0  
**Platform:** Android (React Native + Expo SDK 52)  
**Document saved as:** `SPEC.md` (repo root)  
**Last updated:** 2026-03-19

---

## Table of Contents

12. [Project Overview](#1-project-overview)
13. [Screen Specifications](#2-screen-specifications)
14. [SQLite Schema](#3-sqlite-schema)
15. [TypeScript Types](#4-typescript-types)
16. [Navigation Structure](#5-navigation-structure)
17. [Supabase + Razorpay Setup](#6-supabase--razorpay-setup)
18. [Dependencies](#7-dependencies)
19. [Folder Structure](#8-folder-structure)
20. [README Commands](#9-readme-commands)

---

## 1. Project Overview

PortfolioLite is a fully offline, no-login mobile app for Indian retail investors aged 25–45. It lets users manually track multiple asset classes — mutual funds, stocks, gold, FDs, crypto, PPF, and real estate — and view a consolidated net worth dashboard. All data is stored locally on-device using SQLite. No server, no cloud sync, no account is ever required.

### Design Tokens

| Token | Value |
|---|---|
| Background | `#0A0F1E` |
| Card | `#111827` |
| Card2 | `#1A2236` |
| Accent Blue | `#3B82F6` |
| Teal | `#00D4B4` |
| Gold (₹ values) | `#F5A623` |
| Text Primary | `#F1F5F9` |
| Text Secondary | `#94A3B8` |
| Text Muted | `#64748B` |
| Card Border Radius | `16px` |
| Font Family | Inter or DM Sans |

### Tier Summary

| Feature | Free | Pro (₹49 one-time) |
|---|---|---|
| Asset entries | Up to 5 | Unlimited |
| Net worth dashboard | ✅ | ✅ |
| Net worth timeline chart | ❌ | ✅ |
| CSV export | ❌ | ✅ |
| Biometric lock | ✅ | ✅ |

---

## 2. Screen Specifications

### 2.1 `BiometricGateScreen`

**Navigation type:** Stack (root / initial screen before tab navigator mounts)  
**Figma file:** `src/design/01-biometric-gate.fig`

**Purpose:** Guards app entry with device biometrics (fingerprint / face unlock). Shown on every cold launch if biometric lock is enabled in settings.

#### Props

```typescript
// No external props — this is a root screen
type BiometricGateScreenProps = NativeStackScreenProps<RootStackParamList, 'BiometricGate'>;
```

#### State Variables

```typescript
const [authStatus, setAuthStatus] = useState<'idle' | 'authenticating' | 'failed' | 'success'>('idle');
const [errorMessage, setErrorMessage] = useState<string | null>(null);
const [isBiometricAvailable, setIsBiometricAvailable] = useState<boolean>(false);
```

#### Child Components

| Component | Path | Role |
|---|---|---|
| `AppLogo` | `components/ui/AppLogo` | Animated logo mark shown while authenticating |
| `BiometricPromptButton` | `components/auth/BiometricPromptButton` | Triggers `LocalAuthentication.authenticateAsync()` |
| `ErrorBanner` | `components/ui/ErrorBanner` | Displays auth failure message |

#### Key Logic

- On mount: call `LocalAuthentication.hasHardwareAsync()` and `isEnrolledAsync()` to detect capability.
- If biometrics are unavailable or disabled in settings, skip directly to the tab navigator.
- On success: `navigation.replace('MainTabs')`.
- On failure (3 attempts): show PIN fallback prompt (future v1.1).

---

### 2.2 `HomeScreen`

**Navigation type:** Bottom Tab (tab index 0)  
**Figma file:** `src/design/02-home.fig`

**Purpose:** Main dashboard. Shows total net worth in ₹, allocation breakdown by asset class, and a summary card list of all holdings.

#### Props

```typescript
type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;
```

#### State Variables

```typescript
const [netWorth, setNetWorth] = useState<number>(0);
const [allocationData, setAllocationData] = useState<AllocationSlice[]>([]);
const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(true);
const [lastSnapshotDate, setLastSnapshotDate] = useState<string | null>(null);
const [isPro, setIsPro] = useState<boolean>(false);
```

#### Child Components

| Component | Path | Role |
|---|---|---|
| `NetWorthHero` | `components/home/NetWorthHero` | Large ₹ value display with teal accent |
| `AllocationPieChart` | `components/charts/AllocationPieChart` | Donut chart using `react-native-svg` |
| `AllocationLegend` | `components/home/AllocationLegend` | Color-coded legend rows per asset type |
| `AssetSummaryCard` | `components/home/AssetSummaryCard` | Mini card per asset showing value and gain/loss |
| `AddAssetFAB` | `components/ui/AddAssetFAB` | Floating action button → navigates to `AddAsset` modal |
| `ProBadge` | `components/ui/ProBadge` | Shown if user is Pro tier |
| `SkeletonLoader` | `components/ui/SkeletonLoader` | Placeholder while DB reads |

#### Key Logic

- On focus (not just mount): re-query DB so values refresh after returning from `AddAssetScreen`.
- `useFocusEffect` + `useCallback` pattern from `@react-navigation/native`.
- Auto-capture a snapshot to `snapshots` table once per calendar day.
- If `assets.length >= 5 && !isPro`: show a soft upsell banner at the bottom.

---

### 2.3 `AddAssetScreen`

**Navigation type:** Stack Modal (presented over `HomeScreen` or `HoldingsScreen`)  
**Figma file:** `src/design/03-add-asset.fig`

**Purpose:** Form to add a new asset or edit an existing one. Supports all 8 asset types.

#### Props

```typescript
type AddAssetScreenProps = NativeStackScreenProps<RootStackParamList, 'AddAsset'>;

// Route params
type AddAssetParams = {
  mode: 'create' | 'edit';
  assetId?: number; // provided when mode === 'edit'
};
```

#### State Variables

```typescript
const [formData, setFormData] = useState<AssetInput>({
  name: '',
  type: 'stock',
  quantity: 0,
  buy_price: 0,
  current_price: 0,
  currency: 'INR',
  notes: '',
});
const [errors, setErrors] = useState<Partial<Record<keyof AssetInput, string>>>({});
const [isSaving, setIsSaving] = useState<boolean>(false);
const [isProGated, setIsProGated] = useState<boolean>(false); // true if free limit hit
```

#### Child Components

| Component | Path | Role |
|---|---|---|
| `AssetTypeSelector` | `components/forms/AssetTypeSelector` | Horizontal pill scroller for asset type |
| `CurrencyInput` | `components/forms/CurrencyInput` | ₹-prefixed numeric input with formatting |
| `TextInputField` | `components/forms/TextInputField` | Reusable labelled text input |
| `NotesInput` | `components/forms/NotesInput` | Multiline notes textarea |
| `SaveButton` | `components/ui/SaveButton` | Primary CTA, shows loading state |
| `DeleteConfirmSheet` | `components/ui/DeleteConfirmSheet` | Bottom sheet for delete confirmation (edit mode) |
| `PaywallBanner` | `components/paywall/PaywallBanner` | Inline banner if free limit reached |

#### Key Logic

- Validate: `name` required, `buy_price >= 0`, `current_price >= 0`, `quantity > 0`.
- Check free tier limit before saving: if `assetCount >= 5 && !isPro && mode === 'create'`, block save and show `PaywallBanner`.
- On save: INSERT or UPDATE in SQLite, then `navigation.goBack()`.
- In edit mode: pre-populate `formData` by fetching asset by `assetId` on mount.

---

### 2.4 `HoldingsScreen`

**Navigation type:** Bottom Tab (tab index 1)  
**Figma file:** `src/design/04-holdings.fig`

**Purpose:** Full searchable, filterable list of all assets grouped by asset type.

#### Props

```typescript
type HoldingsScreenProps = BottomTabScreenProps<MainTabParamList, 'Holdings'>;
```

#### State Variables

```typescript
const [assets, setAssets] = useState<Asset[]>([]);
const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
const [searchQuery, setSearchQuery] = useState<string>('');
const [activeFilter, setActiveFilter] = useState<AssetType | 'all'>('all');
const [sortOrder, setSortOrder] = useState<'value_desc' | 'value_asc' | 'name_asc'>('value_desc');
const [isLoading, setIsLoading] = useState<boolean>(true);
```

#### Child Components

| Component | Path | Role |
|---|---|---|
| `SearchBar` | `components/ui/SearchBar` | Controlled text input with clear button |
| `FilterChipRow` | `components/holdings/FilterChipRow` | Scrollable asset type filter chips |
| `SortMenu` | `components/holdings/SortMenu` | Dropdown for sort options |
| `AssetListItem` | `components/holdings/AssetListItem` | Row card: name, type icon, value, P&L |
| `SectionHeader` | `components/holdings/SectionHeader` | Group header per asset type |
| `EmptyHoldingsState` | `components/holdings/EmptyHoldingsState` | Illustration + CTA when no assets |
| `AddAssetFAB` | `components/ui/AddAssetFAB` | Shared FAB component |

#### Key Logic

- Use `useFocusEffect` to refresh list on tab focus.
- Search filters on `asset.name` (case-insensitive).
- Filter chips map to `AssetType`; 'all' shows everything.
- Tapping a row navigates to `AddAsset` in edit mode.

---

### 2.5 `TimelineScreen`

**Navigation type:** Bottom Tab (tab index 2)  
**Figma file:** `src/design/05-timeline.fig`

**Purpose:** Pro-only net worth history line chart. Shows how total portfolio value has changed over time using daily snapshots.

#### Props

```typescript
type TimelineScreenProps = BottomTabScreenProps<MainTabParamList, 'Timeline'>;
```

#### State Variables

```typescript
const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
const [selectedRange, setSelectedRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M');
const [isPro, setIsPro] = useState<boolean>(false);
const [isLoading, setIsLoading] = useState<boolean>(true);
const [selectedPoint, setSelectedPoint] = useState<Snapshot | null>(null);
```

#### Child Components

| Component | Path | Role |
|---|---|---|
| `NetWorthLineChart` | `components/charts/NetWorthLineChart` | SVG line chart via `react-native-svg` |
| `RangeSelector` | `components/timeline/RangeSelector` | 1M / 3M / 6M / 1Y / ALL toggle |
| `TooltipCard` | `components/timeline/TooltipCard` | Floating value card on chart tap |
| `PaywallOverlay` | `components/paywall/PaywallOverlay` | Blur overlay with unlock CTA (free tier) |
| `SnapshotMetaRow` | `components/timeline/SnapshotMetaRow` | Shows date + total for selected point |
| `EmptyTimelineState` | `components/timeline/EmptyTimelineState` | Shown when < 2 snapshots exist |

#### Key Logic

- If `!isPro`: render blurred chart behind `PaywallOverlay`; tapping overlay navigates to `Paywall` modal.
- Filter `snapshots` array by `selectedRange` before passing to chart.
- Chart X-axis: `captured_at` dates. Y-axis: `total_value` in ₹.
- Pinch-to-zoom deferred to v1.1.

---

### 2.6 `PaywallScreen`

**Navigation type:** Stack Modal (presented modally from any screen)  
**Figma file:** `src/design/06-paywall.fig`

**Purpose:** One-time purchase screen for the Pro upgrade. Shows feature list and triggers Google Play Billing via RevenueCat.

#### Props

```typescript
type PaywallScreenProps = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

// No route params required
```

#### State Variables

```typescript
const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
const [isRestoring, setIsRestoring] = useState<boolean>(false);
const [purchaseError, setPurchaseError] = useState<string | null>(null);
const [offering, setOffering] = useState<PurchasesOffering | null>(null);
const [isOfferingLoading, setIsOfferingLoading] = useState<boolean>(true);
```

#### Child Components

| Component | Path | Role |
|---|---|---|
| `PaywallHero` | `components/paywall/PaywallHero` | Animated gradient header with app icon |
| `FeatureListItem` | `components/paywall/FeatureListItem` | Check-mark row for each Pro feature |
| `PriceTag` | `components/paywall/PriceTag` | Large ₹49 display with "One-time, no subscription" label |
| `PurchaseButton` | `components/paywall/PurchaseButton` | Primary CTA, shows loading spinner |
| `RestorePurchaseLink` | `components/paywall/RestorePurchaseLink` | Text link to restore prior purchase |
| `LegalFooter` | `components/paywall/LegalFooter` | Play Store policy links |
| `ErrorBanner` | `components/ui/ErrorBanner` | Purchase error display |

#### Key Logic

- On mount: `Purchases.getOfferings()` to fetch `portfoliolite_pro_49` package.
- Purchase flow: `Purchases.purchasePackage(pkg)` → on success, persist `isPro = true` to `settings` table → `navigation.goBack()`.
- Restore flow: `Purchases.restorePurchases()` → check entitlements for `pro_unlock`.
- Handle `PURCHASE_CANCELLED` silently (user dismissed Play dialog).

---

### 2.7 `SettingsScreen`

**Navigation type:** Bottom Tab (tab index 3)  
**Figma file:** `src/design/07-settings.fig`

**Purpose:** App configuration. Biometric lock toggle, CSV export, about info, and danger zone (clear all data).

#### Props

```typescript
type SettingsScreenProps = BottomTabScreenProps<MainTabParamList, 'Settings'>;
```

#### State Variables

```typescript
const [settings, setSettings] = useState<AppSettings>({
  biometricEnabled: false,
  currency: 'INR',
  theme: 'dark',
  isPro: false,
  onboardingComplete: true,
});
const [isExporting, setIsExporting] = useState<boolean>(false);
const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
```

#### Child Components

| Component | Path | Role |
|---|---|---|
| `SettingsSectionHeader` | `components/settings/SettingsSectionHeader` | Section title row |
| `ToggleRow` | `components/settings/ToggleRow` | Label + Switch component row |
| `ActionRow` | `components/settings/ActionRow` | Tappable row with chevron |
| `ProStatusBadge` | `components/settings/ProStatusBadge` | Shows "Pro" or "Free — Upgrade" |
| `DangerZoneCard` | `components/settings/DangerZoneCard` | Red-bordered card for destructive actions |
| `ConfirmationModal` | `components/ui/ConfirmationModal` | "Are you sure?" dialog for data clear |
| `VersionFooter` | `components/settings/VersionFooter` | App version + build number |

#### Key Logic

- Biometric toggle: calls `LocalAuthentication` APIs to verify hardware support before enabling.
- CSV Export (Pro only): query all assets → format as CSV string → use `expo-sharing` to open share sheet.
- Clear All Data: DELETE all rows from `assets`, `snapshots`; reset `settings`; navigate to `BiometricGate`.
- All settings persisted to `settings` SQLite table as key-value rows.

---

## 3. SQLite Schema

Database file: `portfoliolite.db` (created by `expo-sqlite` in the app's document directory).

```sql
-- ─────────────────────────────────────────────
-- TABLE: assets
-- One row per asset entry logged by the user.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  type          TEXT    NOT NULL
                  CHECK(type IN (
                    'mutual_fund',
                    'stock',
                    'gold',
                    'fd',
                    'crypto',
                    'ppf',
                    'real_estate',
                    'cash'
                  )),
  quantity      REAL    NOT NULL DEFAULT 1.0
                  CHECK(quantity > 0),
  buy_price     REAL    NOT NULL DEFAULT 0.0
                  CHECK(buy_price >= 0),
  current_price REAL    NOT NULL DEFAULT 0.0
                  CHECK(current_price >= 0),
  currency      TEXT    NOT NULL DEFAULT 'INR'
                  CHECK(LENGTH(currency) = 3),
  notes         TEXT,
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Trigger to auto-update updated_at on every row update
CREATE TRIGGER IF NOT EXISTS assets_updated_at
  AFTER UPDATE ON assets
  FOR EACH ROW
BEGIN
  UPDATE assets
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = OLD.id;
END;

-- Index for type-based filtering (used by HoldingsScreen filter chips)
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);


-- ─────────────────────────────────────────────
-- TABLE: snapshots
-- Daily net-worth snapshots for the timeline chart.
-- One row per captured day (deduped by date in app logic).
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS snapshots (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  total_value      REAL    NOT NULL
                     CHECK(total_value >= 0),
  asset_breakdown  TEXT    NOT NULL DEFAULT '{}',
                   -- JSON string: { "stock": 120000, "mutual_fund": 80000, ... }
  captured_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Index for date-range queries in TimelineScreen
CREATE INDEX IF NOT EXISTS idx_snapshots_captured_at ON snapshots(captured_at);


-- ─────────────────────────────────────────────
-- TABLE: settings
-- Simple key-value store for app configuration.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL DEFAULT ''
);

-- Seed default settings on first run (INSERT OR IGNORE = no-op if key exists)
INSERT OR IGNORE INTO settings (key, value) VALUES ('biometric_enabled', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('currency',          'INR');
INSERT OR IGNORE INTO settings (key, value) VALUES ('theme',             'dark');
INSERT OR IGNORE INTO settings (key, value) VALUES ('is_pro',            'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('onboarding_complete', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('last_snapshot_date',  '');
```

### Schema Notes

- All timestamps are stored as ISO 8601 strings in UTC (`TEXT`) for cross-platform portability.
- `asset_breakdown` in `snapshots` is a JSON string (e.g., `{"stock":120000,"gold":45000}`) — parse with `JSON.parse()` in application code.
- The `settings` table uses `TEXT` for all values; the application layer is responsible for casting (e.g., `'false'` → `false`, `'49000'` → `49000`).
- Currency uses ISO 4217 3-letter codes (enforced by `CHECK(LENGTH(currency) = 3)`). Defaults to `'INR'`.

---

## 4. TypeScript Types

File: `src/types/index.ts`

```typescript
// ─────────────────────────────────────────────
// AssetType
// Union of all supported asset classes.
// Must stay in sync with the SQLite CHECK constraint.
// ─────────────────────────────────────────────
export type AssetType =
  | 'mutual_fund'
  | 'stock'
  | 'gold'
  | 'fd'
  | 'crypto'
  | 'ppf'
  | 'real_estate'
  | 'cash';

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  mutual_fund:  'Mutual Fund',
  stock:        'Stock',
  gold:         'Gold',
  fd:           'Fixed Deposit',
  crypto:       'Crypto',
  ppf:          'PPF',
  real_estate:  'Real Estate',
  cash:         'Cash',
};

export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  mutual_fund:  '📈',
  stock:        '🏦',
  gold:         '🪙',
  fd:           '🏛️',
  crypto:       '₿',
  ppf:          '🛡️',
  real_estate:  '🏠',
  cash:         '💵',
};


// ─────────────────────────────────────────────
// Asset
// Matches a row in the `assets` SQLite table.
// ─────────────────────────────────────────────
export interface Asset {
  id:            number;
  name:          string;
  type:          AssetType;
  quantity:      number;
  buy_price:     number;    // per unit, in `currency`
  current_price: number;    // per unit, in `currency`
  currency:      string;    // ISO 4217, e.g. 'INR'
  notes:         string | null;
  created_at:    string;    // ISO 8601 UTC
  updated_at:    string;    // ISO 8601 UTC
}

// Derived computed helpers (not stored in DB)
export interface AssetWithMetrics extends Asset {
  total_invested: number;   // quantity * buy_price
  current_value:  number;   // quantity * current_price
  absolute_gain:  number;   // current_value - total_invested
  percent_gain:   number;   // (absolute_gain / total_invested) * 100
}


// ─────────────────────────────────────────────
// AssetInput
// Used in create/edit forms. Omits id and timestamps.
// All fields are user-provided (not DB-generated).
// ─────────────────────────────────────────────
export interface AssetInput {
  name:          string;
  type:          AssetType;
  quantity:      number;
  buy_price:     number;
  current_price: number;
  currency:      string;
  notes:         string;
}

export const DEFAULT_ASSET_INPUT: AssetInput = {
  name:          '',
  type:          'stock',
  quantity:      1,
  buy_price:     0,
  current_price: 0,
  currency:      'INR',
  notes:         '',
};


// ─────────────────────────────────────────────
// Snapshot
// Matches a row in the `snapshots` SQLite table.
// asset_breakdown is parsed from JSON at query time.
// ─────────────────────────────────────────────
export interface Snapshot {
  id:              number;
  total_value:     number;
  asset_breakdown: Record<AssetType, number>; // { stock: 120000, gold: 45000 }
  captured_at:     string; // ISO 8601 UTC
}

// Raw DB row before JSON.parse of asset_breakdown
export interface SnapshotRow {
  id:              number;
  total_value:     number;
  asset_breakdown: string; // raw JSON string from SQLite
  captured_at:     string;
}


// ─────────────────────────────────────────────
// AppSettings
// Mirrors the key-value rows in the `settings` table.
// All booleans stored as 'true'/'false' strings in DB.
// ─────────────────────────────────────────────
export interface AppSettings {
  biometricEnabled:    boolean;
  currency:            string;   // ISO 4217
  theme:               'dark';   // only dark supported in v1.0
  isPro:               boolean;
  onboardingComplete:  boolean;
  lastSnapshotDate:    string;   // YYYY-MM-DD or empty string
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  biometricEnabled:   false,
  currency:           'INR',
  theme:              'dark',
  isPro:              false,
  onboardingComplete: false,
  lastSnapshotDate:   '',
};


// ─────────────────────────────────────────────
// Navigation param lists
// ─────────────────────────────────────────────
export type RootStackParamList = {
  BiometricGate: undefined;
  MainTabs:      undefined;
  AddAsset:      { mode: 'create' } | { mode: 'edit'; assetId: number };
  Paywall:       undefined;
};

export type MainTabParamList = {
  Home:      undefined;
  Holdings:  undefined;
  Timeline:  undefined;
  Settings:  undefined;
};


// ─────────────────────────────────────────────
// Allocation slice (used by HomeScreen pie chart)
// ─────────────────────────────────────────────
export interface AllocationSlice {
  type:       AssetType;
  value:      number;   // current total value of this type
  percentage: number;   // 0–100
  color:      string;   // hex color for chart segment
}
```

---

## 5. Navigation Structure

### 5.1 Architecture Diagram

```
RootStack (NativeStackNavigator)
│
├── BiometricGateScreen          ← initial route (shown on cold launch if lock enabled)
│
├── MainTabs (BottomTabNavigator)
│   ├── Tab 0: HomeScreen
│   ├── Tab 1: HoldingsScreen
│   ├── Tab 2: TimelineScreen
│   └── Tab 3: SettingsScreen
│
├── AddAssetScreen               ← modal, presented over MainTabs
│   params: { mode: 'create' }  ← triggered by FAB on Home or Holdings
│   params: { mode: 'edit', assetId: number } ← triggered by tapping asset row
│
└── PaywallScreen                ← modal, triggered by:
                                     - PaywallOverlay on TimelineScreen
                                     - PaywallBanner on AddAssetScreen
                                     - "Upgrade" row in SettingsScreen
```

### 5.2 Implementation

File: `src/navigation/RootNavigator.tsx`

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle:           { backgroundColor: '#111827', borderTopColor: '#1A2236' },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home"      component={HomeScreen}     options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Holdings"  component={HoldingsScreen} options={{ tabBarLabel: 'Holdings'  }} />
      <Tab.Screen name="Timeline"  component={TimelineScreen} options={{ tabBarLabel: 'Timeline'  }} />
      <Tab.Screen name="Settings"  component={SettingsScreen} options={{ tabBarLabel: 'Settings'  }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        initialRouteName="BiometricGate"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="BiometricGate" component={BiometricGateScreen} />
        <Stack.Screen name="MainTabs"      component={MainTabs} />
        <Stack.Screen
          name="AddAsset"
          component={AddAssetScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 5.3 Navigation Rules

| Trigger | Action |
|---|---|
| App cold launch, biometric enabled | Push `BiometricGate` → on success `replace('MainTabs')` |
| App cold launch, biometric disabled | Replace immediately to `MainTabs` |
| FAB on Home or Holdings | `navigation.navigate('AddAsset', { mode: 'create' })` |
| Tap asset row in Holdings | `navigation.navigate('AddAsset', { mode: 'edit', assetId: asset.id })` |
| Tap upgrade CTA anywhere | `navigation.navigate('Paywall')` |
| Free limit reached on Add Asset | Show `PaywallBanner` inline; "Unlock" → `navigate('Paywall')` |
| Timeline tab (free user) | `PaywallOverlay` visible; "Unlock" → `navigate('Paywall')` |
| Successful purchase on Paywall | `navigation.goBack()` |

---

|---|---|
| Product ID | `portfoliolite_pro_49` |
| Product type | **Non-consumable** (one-time purchase) |
| Name | `PortfolioLite Pro` |
| Description | `Unlock unlimited assets, timeline chart, and CSV export.` |
| Default price | ₹49.00 (India) |
| Status | **Active** |

5. Click **Save** then **Activate**.

> **Note:** The app must have been uploaded at least once as a closed/open testing release before in-app products can be activated.

### 6.2 RevenueCat Dashboard — Project Setup

1. Go to [app.revenuecat.com](https://app.revenuecat.com) → **+ New Project** → name: `PortfolioLite`.
2. Under **Project Settings → Apps**, click **+ New App**:
   - Platform: **Android**
   - App name: `PortfolioLite`
   - Package name: `com.yourcompany.portfoliolite`
3. Paste your **Google Play Service Account JSON** (created via Google Play Console → Setup → API access → Service accounts → Grant access with Finance + Orders permissions).

### 6.3 RevenueCat — Create Entitlement

1. Go to **Entitlements → + New Entitlement**.
2. Identifier: `pro_unlock`
3. Description: `Grants access to Pro tier features`
4. Click **Add**.

### 6.4 RevenueCat — Create Product

1. Go to **Products → + New Product**.
2. Store product identifier: `portfoliolite_pro_49`
3. App: select your Android app.
4. Click **Add**.

### 6.5 RevenueCat — Create Offering

1. Go to **Offerings → + New Offering**.
2. Identifier: `default`
3. Description: `PortfolioLite Pro upgrade`
4. Click **Add Package → + New Package**:
   - Identifier: `$rc_lifetime` (RevenueCat's built-in lifetime alias, or use `pro_lifetime`)
   - Duration: **Lifetime / Non-consumable**
   - Product: attach `portfoliolite_pro_49`
5. Click **Save**.
6. Set this offering as **Current Offering**.

### 6.6 Link RevenueCat API Key in App

File: `src/services/purchases.ts`

```typescript
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const RC_API_KEY_ANDROID = 'goog_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // from RC Dashboard

export function initRevenueCat(): void {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG); // remove in production
  Purchases.configure({ apiKey: RC_API_KEY_ANDROID });
}
```

Call `initRevenueCat()` at the top of `App.tsx`, before the navigator renders.

### 6.7 Sandbox Testing

1. In Google Play Console → **Setup → License testing**, add your Google account as a test account.
2. On the physical test device, sign into the Play Store with that licensed Google account.
3. Install the app via `eas build --platform android --profile development` + `adb install`.
4. Tap the upgrade button → Play Store sandbox dialog appears → complete purchase at ₹0.
5. Verify in RevenueCat dashboard: **Customers → [your test device]** should show `pro_unlock` entitlement as active.
6. To reset: revoke the purchase via Google Play Console → Order Management, or uninstall + reinstall.

> **Production:** Remove `LOG_LEVEL.DEBUG` line and set `RC_API_KEY_ANDROID` from an `.env` file (never hard-code in source).

---

## 7. Dependencies

File: `package.json` (dependencies section)

```json
{
  "dependencies": {
    "expo":                              "~52.0.0",
    "expo-status-bar":                   "~2.0.0",
    "expo-local-authentication":         "~15.0.1",
    "expo-sqlite":                       "~15.0.3",
    "expo-sharing":                      "~12.0.1",
    "expo-file-system":                  "~18.0.5",
    "expo-constants":                    "~17.0.3",
    "expo-font":                         "~13.0.1",
    "expo-splash-screen":                "~0.29.13",
    "react":                             "18.3.1",
    "react-native":                      "0.76.5",
    "react-native-svg":                  "15.8.0",
    "react-native-purchases":            "8.2.2",
    "@react-navigation/native":          "7.0.14",
    "@react-navigation/native-stack":    "7.2.0",
    "@react-navigation/bottom-tabs":     "7.2.0",
    "react-native-safe-area-context":    "4.12.0",
    "react-native-screens":              "4.3.0",
    "@expo-google-fonts/inter":          "0.2.3",
    "@expo-google-fonts/dm-sans":        "0.2.3",
    "react-native-reanimated":           "3.16.2",
    "react-native-gesture-handler":      "2.21.2",
    "zustand":                           "5.0.2",
    "date-fns":                          "4.1.0",
    "zod":                               "3.23.8"
  },
  "devDependencies": {
    "@babel/core":                       "7.25.2",
    "@types/react":                      "18.3.12",
    "@types/react-native":               "0.76.3",
    "typescript":                        "5.3.3",
    "eas-cli":                           "12.4.1",
    "jest":                              "29.7.0",
    "jest-expo":                         "52.0.2",
    "@testing-library/react-native":     "12.9.0"
  }
}
```

### Key Package Notes

| Package | Purpose |
|---|---|
| `expo-sqlite` | Local SQLite DB — all asset and settings storage |
| `expo-local-authentication` | Biometric (fingerprint / face) lock |
| `expo-sharing` | CSV export via native share sheet |
| `react-native-purchases` | RevenueCat SDK for IAP |
| `react-native-svg` | Pie chart and line chart rendering |
| `react-native-reanimated` | Smooth animations (chart transitions, FAB) |
| `zustand` | Lightweight global state (settings, isPro) |
| `zod` | Runtime form validation |
| `date-fns` | Date formatting and range filtering |

---

## 8. Folder Structure

```
portfoliolite/
│
├── SPEC.md                          ← This document
├── app.json                         ← Expo app config (name, slug, icon, splash)
├── eas.json                         ← EAS Build profiles (development, preview, production)
├── tsconfig.json                    ← TypeScript config (strict mode, path aliases)
├── babel.config.js                  ← Babel config (reanimated plugin must be last)
├── package.json                     ← Dependencies (see Section 7)
├── .env                             ← RevenueCat API key (gitignored)
├── .gitignore
│
├── assets/
│   ├── icon.png                     ← App icon (1024×1024)
│   ├── splash.png                   ← Splash screen image
│   └── adaptive-icon.png            ← Android adaptive icon foreground
│
├── src/
│   │
│   ├── design/                      ← Figma source files (reference only, not bundled)
│   │   ├── 01-biometric-gate.fig
│   │   ├── 02-home.fig
│   │   ├── 03-add-asset.fig
│   │   ├── 04-holdings.fig
│   │   ├── 05-timeline.fig
│   │   ├── 06-paywall.fig
│   │   └── 07-settings.fig
│   │
│   ├── types/
│   │   └── index.ts                 ← All TypeScript interfaces and type aliases (Section 4)
│   │
│   ├── constants/
│   │   ├── colors.ts                ← Design token hex values as typed constants
│   │   ├── typography.ts            ← Font family/size/weight constants
│   │   └── assetTypes.ts           ← ASSET_TYPE_LABELS, ASSET_TYPE_ICONS, color map
│   │
│   ├── db/
│   │   ├── client.ts               ← Opens/initialises the SQLite DB singleton
│   │   ├── migrations.ts           ← Runs CREATE TABLE and seed INSERTs on first launch
│   │   ├── assets.ts               ← CRUD queries for the assets table
│   │   ├── snapshots.ts            ← Insert/query helpers for the snapshots table
│   │   └── settings.ts             ← get/set helpers for the settings table
│   │
│   ├── services/
│   │   ├── purchases.ts            ← RevenueCat init, purchase, restore, entitlement check
│   │   ├── export.ts               ← CSV generation and expo-sharing trigger
│   │   └── snapshot.ts             ← Daily snapshot capture logic (called from HomeScreen)
│   │
│   ├── store/
│   │   ├── settingsStore.ts        ← Zustand store for AppSettings (persisted from DB)
│   │   └── proStore.ts             ← Zustand store for isPro flag (synced with RevenueCat)
│   │
│   ├── hooks/
│   │   ├── useAssets.ts            ← Fetches asset list from DB, exposes refresh()
│   │   ├── useNetWorth.ts          ← Computes total value and allocation from assets
│   │   ├── useSnapshots.ts         ← Fetches and filters snapshots for timeline
│   │   ├── useBiometric.ts         ← Wraps LocalAuthentication with status state
│   │   └── useSettings.ts          ← Reads/writes AppSettings via settingsStore
│   │
│   ├── navigation/
│   │   └── RootNavigator.tsx       ← Full navigator tree (see Section 5.2)
│   │
│   ├── screens/
│   │   ├── BiometricGateScreen.tsx ← Auth gate before MainTabs
│   │   ├── HomeScreen.tsx          ← Dashboard: net worth + pie chart
│   │   ├── AddAssetScreen.tsx      ← Create/edit asset form (modal)
│   │   ├── HoldingsScreen.tsx      ← Searchable, filtered asset list
│   │   ├── TimelineScreen.tsx      ← Pro net worth line chart
│   │   ├── PaywallScreen.tsx       ← ₹49 one-time purchase screen (modal)
│   │   └── SettingsScreen.tsx      ← Config, export, danger zone
│   │
│   ├── components/
│   │   │
│   │   ├── ui/                     ← Generic, reusable UI primitives
│   │   │   ├── AppLogo.tsx         ← Animated app logo mark
│   │   │   ├── AddAssetFAB.tsx     ← Floating action button (shared by Home + Holdings)
│   │   │   ├── ErrorBanner.tsx     ← Inline error message strip
│   │   │   ├── ProBadge.tsx        ← Small "PRO" badge chip
│   │   │   ├── SaveButton.tsx      ← Primary CTA button with loading state
│   │   │   ├── SkeletonLoader.tsx  ← Shimmer placeholder during DB reads
│   │   │   └── ConfirmationModal.tsx ← Generic yes/no dialog
│   │   │
│   │   ├── auth/
│   │   │   └── BiometricPromptButton.tsx ← Fingerprint/face icon + retry trigger
│   │   │
│   │   ├── home/
│   │   │   ├── NetWorthHero.tsx    ← Large ₹ total with teal accent and label
│   │   │   ├── AllocationLegend.tsx ← Color-coded rows per asset type
│   │   │   └── AssetSummaryCard.tsx ← Compact card: name, type, value, P&L
│   │   │
│   │   ├── charts/
│   │   │   ├── AllocationPieChart.tsx ← SVG donut chart (react-native-svg)
│   │   │   └── NetWorthLineChart.tsx  ← SVG line chart for timeline
│   │   │
│   │   ├── forms/
│   │   │   ├── AssetTypeSelector.tsx ← Horizontal pill scroller for asset type pick
│   │   │   ├── CurrencyInput.tsx     ← ₹-prefixed numeric field with formatting
│   │   │   ├── TextInputField.tsx    ← Reusable labelled text input with error state
│   │   │   └── NotesInput.tsx        ← Multiline textarea for asset notes
│   │   │
│   │   ├── holdings/
│   │   │   ├── FilterChipRow.tsx    ← Scrollable asset type filter chips
│   │   │   ├── SortMenu.tsx         ← Dropdown: sort by value / name
│   │   │   ├── AssetListItem.tsx    ← Row card: icon, name, value, P&L delta
│   │   │   ├── SectionHeader.tsx    ← Group header per asset type
│   │   │   └── EmptyHoldingsState.tsx ← Illustration + "Add your first asset" CTA
│   │   │
│   │   ├── timeline/
│   │   │   ├── RangeSelector.tsx    ← 1M / 3M / 6M / 1Y / ALL toggle buttons
│   │   │   ├── TooltipCard.tsx      ← Floating value tooltip on chart tap
│   │   │   ├── SnapshotMetaRow.tsx  ← Date + value row for selected data point
│   │   │   └── EmptyTimelineState.tsx ← Shown when < 2 snapshots captured
│   │   │
│   │   ├── paywall/
│   │   │   ├── PaywallHero.tsx      ← Gradient header with icon and tagline
│   │   │   ├── FeatureListItem.tsx  ← Check-mark row per Pro feature
│   │   │   ├── PriceTag.tsx         ← ₹49 display with "one-time" label
│   │   │   ├── PurchaseButton.tsx   ← Primary buy CTA with loading spinner
│   │   │   ├── RestorePurchaseLink.tsx ← Text link for restore flow
│   │   │   ├── LegalFooter.tsx      ← Play Store policy links
│   │   │   ├── PaywallBanner.tsx    ← Inline banner inside AddAsset (limit reached)
│   │   │   └── PaywallOverlay.tsx   ← Blur overlay on TimelineScreen (free tier)
│   │   │
│   │   └── settings/
│   │       ├── SettingsSectionHeader.tsx ← Section title row
│   │       ├── ToggleRow.tsx             ← Label + Switch row
│   │       ├── ActionRow.tsx             ← Tappable row with right chevron
│   │       ├── ProStatusBadge.tsx        ← "Pro" or "Free — Upgrade" display
│   │       ├── DangerZoneCard.tsx        ← Red-bordered destructive actions card
│   │       └── VersionFooter.tsx         ← App version + build number footer
│   │
│   └── utils/
│       ├── currency.ts              ← formatINR(), parseNumericInput()
│       ├── date.ts                  ← formatDate(), getDateKey() (YYYY-MM-DD)
│       ├── csv.ts                   ← assetsToCSV() — converts Asset[] to CSV string
│       └── metrics.ts               ← computeAssetMetrics(), computeNetWorth()
│
└── __tests__/
    ├── db/
    │   ├── assets.test.ts           ← Unit tests for asset CRUD queries
    │   └── snapshots.test.ts        ← Unit tests for snapshot capture logic
    ├── utils/
    │   ├── currency.test.ts         ← Tests for INR formatting
    │   └── metrics.test.ts          ← Tests for P&L and net worth calculations
    └── screens/
        └── HomeScreen.test.tsx      ← Render tests for dashboard
```

---

## 9. README Commands

Run these commands in sequence from your development machine to bootstrap, develop, and ship the app.

### 9.1 Initial Project Setup

```bash
# 1. Scaffold a new Expo project with TypeScript template
npx create-expo-app@latest portfoliolite --template expo-template-blank-typescript

# 2. Move into the project directory
cd portfoliolite

# 3. Install all production and dev dependencies
npm install \
  expo-local-authentication \
  expo-sqlite \
  expo-sharing \
  expo-file-system \
  expo-constants \
  expo-font \
  expo-splash-screen \
  react-native-svg \
  react-native-purchases \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  react-native-safe-area-context \
  react-native-screens \
  @expo-google-fonts/inter \
  @expo-google-fonts/dm-sans \
  react-native-reanimated \
  react-native-gesture-handler \
  zustand \
  date-fns \
  zod

# 4. Install dev dependencies
npm install --save-dev \
  jest \
  jest-expo \
  @testing-library/react-native \
  eas-cli

# 5. Create the src directory structure
mkdir -p src/{types,constants,db,services,store,hooks,navigation,screens,utils}
mkdir -p src/components/{ui,auth,home,charts,forms,holdings,timeline,paywall,settings}
mkdir -p src/design
mkdir -p __tests__/{db,utils,screens}
```

### 9.2 Configure EAS Build

```bash
# 6. Log in to your Expo / EAS account
npx eas-cli login

# 7. Initialise EAS for this project (creates eas.json)
npx eas-cli init

# 8. Configure eas.json build profiles (edit manually or use below)
cat > eas.json << 'EOF'
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "distribution": "internal",
      "android": { "buildType": "apk", "gradleCommand": ":app:assembleDebug" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "aab" }
    }
  },
  "submit": {
    "production": {}
  }
}
EOF
```

### 9.3 Local Development

```bash
# 9. Start the Expo development server
npx expo start

# 10. Run on a connected Android device (USB debugging enabled)
npx expo run:android

# 11. Run the test suite
npx jest --watchAll

# 12. Type-check the project without emitting files
npx tsc --noEmit
```

### 9.4 EAS Builds

```bash
# 13. Build a debug APK for internal testing (sideload on device)
eas build --platform android --profile development

# 14. Build a preview APK for internal Play Track / QA
eas build --platform android --profile preview

# 15. Build a production AAB for Play Store submission
eas build --platform android --profile production

# 16. Submit the production AAB directly to Google Play
eas submit --platform android --latest
```

### 9.5 RevenueCat Verification (post-setup)

```bash
# 17. Verify RevenueCat SDK is linked (should print SDK version, no errors)
npx react-native info

# 18. Install the APK from the most recent EAS development build
#     Replace <build-id> with the ID shown after `eas build` completes
eas build:download --build-id <build-id> --output ./build/portfoliolite-dev.apk
adb install ./build/portfoliolite-dev.apk
```

---

*End of SPEC.md — PortfolioLite v1.0.0*