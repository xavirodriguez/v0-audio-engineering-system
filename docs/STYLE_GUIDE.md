# UI Component Style Guide

This document outlines the styling and structural conventions for the UI components in this project. All components are located in the `components/ui/` directory.

## Guiding Principles

- **Consistency:** All components should adhere to the patterns outlined below to ensure a consistent user experience.
- **Accessibility:** Components should be designed with accessibility in mind, including proper focus states and ARIA attributes.
- **Maintainability:** Using consistent patterns makes the codebase easier to understand and maintain.

## Tailwind Class Patterns by Component

### 1. Card (`card.tsx`)

#### Spacing (padding/gap):
- **Main card:** `gap-6 py-6`
- **Card header:** `gap-2 px-6` with `pb-6` for bordered variants
- **Card content:** `px-6`
- **Card footer:** `px-6` with `pt-6` for bordered variants

#### Shadows:
- `shadow-sm`

#### Data Attributes:
- Uses `data-slot` for all subcomponents (`card`, `card-header`, `card-title`, `card-description`, `card-action`, `card-content`, `card-footer`)

### 2. Dialog (`dialog.tsx`)

#### Spacing (padding/gap):
- **Dialog content:** `gap-4 p-6`
- **Dialog header:** `gap-2`
- **Dialog footer:** `gap-2`

#### Focus States:
- **Close button:** `focus:ring-2 focus:ring-offset-2 focus:outline-hidden`

#### Shadows:
- `shadow-lg`

#### Transitions:
- `duration-200` for content animations

#### Data Attributes:
- Uses `data-slot` throughout
- **Animation states:** `data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`

### 3. Sheet (`sheet.tsx`)

#### Spacing (padding/gap):
- **Sheet content:** `gap-4`
- **Sheet header:** `gap-1.5 p-4`
- **Sheet footer:** `gap-2 p-4`

#### Focus States:
- **Close button:** `focus:ring-2 focus:ring-offset-2 focus:outline-hidden`

#### Shadows:
- `shadow-lg`

#### Transitions:
- `transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500`

#### Data Attributes:
- Uses `data-slot` throughout
- Animation states with directional slides based on `side` prop

### 4. Sidebar (`sidebar.tsx`)

#### Spacing (padding/gap):
- **Sidebar header/footer:** `gap-2 p-2`
- **Sidebar content:** `gap-2`
- **Sidebar group:** `p-2`
- **Sidebar menu:** `gap-1`
- **Sidebar menu button:** `gap-2 p-2`
- **Sidebar menu sub:** `gap-1 px-2.5 py-0.5`

#### Focus States:
- **Menu buttons:** `focus-visible:ring-2` with `outline-hidden`
- **Group labels:** `focus-visible:ring-2`

#### Shadows:
- `shadow-sm` for floating/inset variants

#### Transitions:
- **Width transitions:** `transition-[width] duration-200 ease-linear`
- **Position transitions:** `transition-[left,right,width] duration-200 ease-linear`
- **Button transitions:** `transition-[width,height,padding]`
- **Label transitions:** `transition-[margin,opacity] duration-200 ease-linear`

#### Data Attributes:
- Extensive use of `data-slot`, `data-sidebar`, `data-state`, `data-collapsible`, `data-variant`, `data-side`
- **Button states:** `data-active`, `data-size`
- **Mobile indicator:** `data-mobile="true"`

### 5. Tabs (`tabs.tsx`)

#### Spacing (padding/gap):
- **Tabs root:** `gap-2`
- **Tabs list:** `p-[3px]`
- **Tabs trigger:** `gap-1.5 px-2 py-1`

#### Focus States:
- `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1`

#### Shadows:
- `data-[state=active]:shadow-sm`

#### Transitions:
- `transition-[color,box-shadow]`

#### Data Attributes:
- Uses `data-slot` throughout
- **Active state:** `data-[state=active]`

### 6. Popover (`popover.tsx`)

#### Spacing (padding/gap):
- **Popover content:** `p-4` with `sideOffset = 4`

#### Focus States:
- `outline-hidden`

#### Shadows:
- `shadow-md`

#### Transitions:
- Uses animation classes for state transitions but no explicit duration

#### Data Attributes:
- Uses `data-slot` throughout
- **Animation states:** `data-[state=open]`, `data-[state=closed]`, and directional `data-[side=...]`
