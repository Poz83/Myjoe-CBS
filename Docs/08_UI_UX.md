# UI/UX Design System

> Based on industry research from Figma, Canva, Adobe Firefly, and Midjourney.
> See Premium_Creative_Web_App_UI_Design research document for sources.

## Design Principles

| Principle | Rule |
|-----------|------|
| **Minimalist but powerful** | Clean interface that still conveys power of the tool |
| **Canvas-first** | Artwork takes center stage, UI chrome is subdued |
| **Figma-like structure** | 3-column layout: nav/assets left, canvas center, inspector right |
| **Dark theme (v1)** | Single dark theme; light mode planned for v2 |
| **4px grid system** | All spacing in multiples of 4 for dense creative UIs |
| **Progressive disclosure** | Show basics first, advanced on demand via accordions |
| **Optimistic UI** | Instant feedback, assume success, handle errors gracefully |
| **Fluid layout** | Expand to fill window, min 1024px width |

---

## Layout Architecture

### 3-Column Studio Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Header: Logo │ Navigation │ Auto-save Status │ Blot Balance │ User Menu       │
│  (sticky, 56px height, bg-zinc-900/80 backdrop-blur)                          │
├───────────────┬────────────────────────────────────────────────┬──────────────┤
│               │                                                │              │
│  Left Panel   │              Center Canvas                     │ Right Panel  │
│  (300px)      │              (fluid, fills remaining)          │ (360px)      │
│  (collapsible)│                                                │ (collapsible)│
│               │  ┌──────────────────────────────────────────┐ │              │
│  ┌─────────┐  │  │                                          │ │ ┌──────────┐│
│  │ Tabs    │  │  │                                          │ │ │ Context  ││
│  │─────────│  │  │         Active Page / Canvas             │ │ │ Inspector││
│  │ Pages   │  │  │                                          │ │ │          ││
│  │ Assets  │  │  │      (zoom/pan enabled, neutral bg)      │ │ │ Sections ││
│  │ History │  │  │                                          │ │ │ in       ││
│  └─────────┘  │  │                                          │ │ │ Accordions│
│               │  └──────────────────────────────────────────┘ │ └──────────┘│
│  Page         │                                                │              │
│  Thumbnails   │  Bottom: Action bar (contextual)              │  Actions     │
│  (scrollable) │                                                │  (sticky)    │
│               │                                                │              │
└───────────────┴────────────────────────────────────────────────┴──────────────┘
```

### Panel Specifications

| Panel | Width | Behavior | Contains |
|-------|-------|----------|----------|
| **Left** | 300px | Collapsible via toggle, sticky | Tabs for Pages/Assets/History, page thumbnails |
| **Center** | Fluid | Expands to fill, min 400px | Canvas with zoom/pan, action bar |
| **Right** | 360px | Collapsible, context-sensitive | Inspector with accordion sections |
| **Header** | 100% × 56px | Sticky top | Logo, nav, status, balance, user |

### Fluid Layout Rules

```css
/* Container behavior */
.studio-layout {
  display: grid;
  grid-template-columns: auto 1fr auto;
  min-width: 1024px;        /* Minimum supported */
  max-width: none;          /* Expand to fill */
  height: 100vh;
}

/* Panel constraints */
.left-panel {
  width: 300px;
  min-width: 240px;
  max-width: 400px;
  /* Resizable via drag handle */
}

.right-panel {
  width: 360px;
  min-width: 280px;
  max-width: 480px;
}
```

### Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| ≥1440px | All panels visible, comfortable spacing |
| 1280-1439px | All panels visible, tighter spacing |
| 1024-1279px | Right panel auto-collapses to overlay |
| <1024px | Show "Desktop required" message |

---

## Color System

### Base Colors (Dark Theme)

```css
/* Background layers (darkest to lightest) */
--bg-base: #0D0D0D;       /* Page background */
--bg-surface: #1A1A1A;    /* Cards, panels */
--bg-elevated: #262626;   /* Modals, dropdowns, hover */
--bg-canvas: #171717;     /* Canvas surround (neutral) */

/* Text hierarchy */
--text-primary: #FFFFFF;
--text-secondary: #A1A1A1;
--text-tertiary: #6B6B6B;
--text-disabled: #4A4A4A;

/* Borders (subtle, not heavy) */
--border-default: #2A2A2A;
--border-hover: #3A3A3A;
--border-active: #4A4A4A;

/* Status colors (slightly muted for calm tone) */
--success: #22C55E;
--warning: #F59E0B;
--error: #E45757;          /* Softer red */
--info: #3B82F6;
```

### Accent Color

```css
/* Primary accent - trustworthy blue */
--accent: #3B82F6;
--accent-hover: #2563EB;
--accent-muted: rgba(59, 130, 246, 0.15);
--accent-ring: rgba(59, 130, 246, 0.4);
```

### Light Theme (v2 - Planned)

```css
/* Invert scheme for future light mode */
--bg-base: #FAFBFC;
--bg-surface: #FFFFFF;
--bg-elevated: #F5F5F5;
--bg-canvas: #E5E5E5;

--text-primary: #212121;   /* Dark gray, not pure black */
--text-secondary: #666666;

--border-default: #E0E0E0;
```

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
```

### Type Scale

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `text-xs` | 12px | 400 | Tiny labels, badges |
| `text-sm` | 14px | 400 | Secondary text, captions |
| `text-base` | 16px | 400 | Body text, inputs |
| `text-lg` | 18px | 500 | Emphasis, panel headers |
| `text-xl` | 20px | 600 | Section headers |
| `text-2xl` | 24px | 600 | Page titles |

### Typography Rules

- **Max 2 weights per view** (Regular + Semi-Bold)
- **14px minimum** for any functional text
- **Consistent scale** — same size/weight for same purpose everywhere
- **High contrast** — text meets 4.5:1 minimum on backgrounds

---

## Spacing System (4px Grid)

All spacing uses a **4px base unit** for precise alignment in dense creative UIs.

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Tight: icon gaps, inline spacing |
| `space-2` | 8px | Related: form field gaps |
| `space-3` | 12px | Default: list item padding |
| `space-4` | 16px | Comfortable: card padding, section gaps |
| `space-5` | 20px | Panel inner padding |
| `space-6` | 24px | Large: between major sections |
| `space-8` | 32px | XL: page section breaks |

### Component Sizing (4px aligned)

```css
/* All sizes divisible by 4 */
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;

--button-height-sm: 32px;
--button-height-md: 40px;
--button-height-lg: 48px;

--input-height: 40px;
--thumbnail-size: 80px;
```

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `rounded-sm` | 4px | Small inputs, tags |
| `rounded` | 6px | Buttons, inputs |
| `rounded-md` | 8px | Cards, panels |
| `rounded-lg` | 12px | Modals, large cards |
| `rounded-full` | 9999px | Pills, avatars, circular buttons |

---

## Shadows

```css
/* Soft shadows for premium feel */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.25);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.3);

/* For elevated elements like modals */
--shadow-modal: 0 20px 40px rgba(0, 0, 0, 0.4);
```

---

## Component Patterns

### Buttons

```tsx
// Primary (accent fill)
<button className="h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-500 
                   transition-colors font-medium">
  Generate
</button>

// Secondary (subtle fill)
<button className="h-10 px-4 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 
                   transition-colors">
  Cancel
</button>

// Ghost (transparent)
<button className="h-10 px-4 text-zinc-300 rounded-md hover:bg-zinc-800 
                   transition-colors">
  Skip
</button>

// Icon button
<button className="w-10 h-10 flex items-center justify-center rounded-md 
                   hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
  <Settings className="w-5 h-5" />
</button>

// Button with loading state (spinner inside)
<button className="h-10 px-4 bg-blue-600 text-white rounded-md inline-flex items-center gap-2"
        disabled={isLoading}>
  {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
  {isLoading ? 'Generating...' : 'Generate'}
</button>
```

### Inputs

```tsx
<input
  type="text"
  placeholder="Enter project name..."
  className="h-10 w-full px-4 bg-zinc-900 border border-zinc-700 rounded-md 
             text-white placeholder:text-zinc-500
             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
             transition-colors"
/>
```

### Cards

```tsx
<div className="p-5 bg-zinc-900 rounded-lg border border-zinc-800 
                hover:border-zinc-700 transition-colors">
  <h3 className="text-lg font-medium mb-2">Card Title</h3>
  <p className="text-zinc-400 text-sm">Card content</p>
</div>
```

### Accordion (for Inspector Panel)

```tsx
<div className="border-b border-zinc-800">
  <button 
    className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50"
    onClick={() => setIsOpen(!isOpen)}
  >
    <span className="font-medium">Appearance</span>
    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </button>
  {isOpen && (
    <div className="px-4 pb-4 space-y-3">
      {/* Section content */}
    </div>
  )}
</div>
```

### Tabs (for Left Panel)

```tsx
<div className="flex border-b border-zinc-800">
  {['Pages', 'Assets', 'History'].map(tab => (
    <button
      key={tab}
      className={`px-4 py-2 text-sm font-medium transition-colors
        ${active === tab 
          ? 'text-white border-b-2 border-blue-500' 
          : 'text-zinc-400 hover:text-white'}`}
      onClick={() => setActive(tab)}
    >
      {tab}
    </button>
  ))}
</div>
```

---

## Loading & Feedback Patterns

### When to Use What

| Wait Time | Pattern | Example |
|-----------|---------|---------|
| <300ms | None | Quick actions, local state |
| 300-500ms | Subtle spinner | Button loading state |
| 500ms-2s | Skeleton | Loading page thumbnails |
| 2s+ | Progress bar + stages | AI generation |
| Unknown | Skeleton + spinner | Initial data fetch |

### Skeleton Screens

Use skeletons to show **where content will appear** during loads over 500ms.

```tsx
// Page thumbnail skeleton
<div className="aspect-[3/4] bg-zinc-800 rounded-lg animate-pulse" />

// Text line skeleton
<div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />

// Card skeleton
<div className="p-5 bg-zinc-900 rounded-lg border border-zinc-800">
  <div className="h-5 bg-zinc-800 rounded w-1/2 mb-3 animate-pulse" />
  <div className="h-4 bg-zinc-800 rounded w-full mb-2 animate-pulse" />
  <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
</div>

// Add shimmer effect for premium feel
.skeleton-shimmer {
  background: linear-gradient(90deg, #1a1a1a 25%, #262626 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Progress with Stages (AI Generation)

```tsx
<div className="space-y-3">
  {/* Header */}
  <div className="flex justify-between items-center">
    <span className="font-medium">Generating pages...</span>
    <span className="text-zinc-400">15 / 40</span>
  </div>
  
  {/* Progress bar */}
  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
    <div 
      className="h-full bg-blue-500 transition-all duration-300 ease-out"
      style={{ width: `${(15/40) * 100}%` }}
    />
  </div>
  
  {/* Current stage text */}
  <p className="text-sm text-zinc-500">
    Creating page 16: Bella explores the garden...
  </p>
  
  {/* Thumbnails appearing */}
  <div className="grid grid-cols-5 gap-2">
    {pages.map((page, i) => (
      page.status === 'complete' ? (
        <img src={page.thumbnail} className="rounded" />
      ) : page.status === 'generating' ? (
        <div className="aspect-[3/4] bg-zinc-800 rounded flex items-center justify-center">
          <Loader className="w-4 h-4 animate-spin text-zinc-500" />
        </div>
      ) : (
        <div className="aspect-[3/4] bg-zinc-800/50 rounded" />
      )
    ))}
  </div>
</div>
```

### Optimistic UI & Auto-Save

```tsx
// Auto-save indicator in header
<div className="flex items-center gap-2 text-sm text-zinc-400">
  {saveStatus === 'saving' && (
    <>
      <Loader className="w-3 h-3 animate-spin" />
      <span>Saving...</span>
    </>
  )}
  {saveStatus === 'saved' && (
    <>
      <Cloud className="w-3 h-3 text-green-500" />
      <span>Saved</span>
    </>
  )}
  {saveStatus === 'error' && (
    <>
      <AlertCircle className="w-3 h-3 text-red-500" />
      <span>Save failed</span>
      <button className="text-blue-400 hover:underline">Retry</button>
    </>
  )}
</div>

// Optimistic update pattern
const handleEdit = async () => {
  // 1. Update UI immediately (optimistic)
  setPages(prev => prev.map(p => p.id === pageId ? { ...p, ...newData } : p));
  
  // 2. Save to server
  try {
    await api.updatePage(pageId, newData);
  } catch (error) {
    // 3. Revert on failure
    setPages(prev => prev.map(p => p.id === pageId ? originalData : p));
    toast.error('Failed to save changes');
  }
};
```

---

## Icons

Use **Lucide React** (16-20px, consistent stroke weight).

```tsx
import { 
  Plus, Trash2, Download, Settings, ChevronDown, ChevronRight,
  Image, Palette, Sparkles, Wand2, Brush, Undo, Redo,
  Book, User, Loader, Cloud, AlertCircle, Check, X,
  ZoomIn, ZoomOut, Maximize, Minimize,
} from 'lucide-react';

// Standard sizes
<Icon className="w-4 h-4" />  // 16px - inline, buttons
<Icon className="w-5 h-5" />  // 20px - default
<Icon className="w-6 h-6" />  // 24px - emphasis
```

| Feature | Icon |
|---------|------|
| Create | `Plus` |
| Delete | `Trash2` |
| Export | `Download` |
| Settings | `Settings` |
| Generate | `Sparkles` |
| Edit/Magic | `Wand2` |
| Brush | `Brush` |
| Style | `Palette` |
| Project | `Book` |
| Hero | `User` |
| Loading | `Loader` (animate-spin) |
| Saved | `Cloud` |
| Success | `Check` |
| Error | `AlertCircle` |

---

## Toasts & Notifications

```tsx
// Success
toast.success('Project created');

// Error (with action)
toast.error('Generation failed', {
  action: {
    label: 'Retry',
    onClick: () => handleRetry(),
  },
});

// Info
toast.info('Your export is being prepared...');

// Promise-based (optimistic)
toast.promise(generatePages(), {
  loading: 'Generating...',
  success: 'Pages generated!',
  error: 'Generation failed',
});
```

---

## Empty States

Provide guidance and action when there's no content.

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
    <Book className="w-8 h-8 text-zinc-500" />
  </div>
  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
  <p className="text-zinc-400 mb-6 max-w-sm text-sm">
    Create your first coloring book project to get started.
  </p>
  <Button>
    <Plus className="w-4 h-4 mr-2" />
    Create Project
  </Button>
</div>
```

---

## Modal Dialogs

**Use modals sparingly** — only for:
- Destructive confirmations (delete project)
- Focused tasks requiring completion (export settings)
- First-time tutorials

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
  
  {/* Modal */}
  <div className="relative bg-zinc-900 rounded-lg shadow-modal border border-zinc-800 
                  w-full max-w-md mx-4 p-6">
    <button 
      className="absolute top-4 right-4 text-zinc-400 hover:text-white"
      onClick={onClose}
    >
      <X className="w-5 h-5" />
    </button>
    
    <h2 className="text-xl font-semibold mb-4">Delete Project?</h2>
    <p className="text-zinc-400 mb-6">
      This action cannot be undone. All pages will be permanently deleted.
    </p>
    
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm}>Delete</Button>
    </div>
  </div>
</div>
```

---

## Key Screens

### 1. Projects Dashboard

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Logo] Myjoe          Projects  Library  Settings       ☁️ Saved  [JD] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  My Projects                                        [+ New Project]      │
│                                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ [thumb]  │ │ [thumb]  │ │ [thumb]  │ │ [thumb]  │ │    +     │      │
│  │          │ │          │ │          │ │          │ │          │      │
│  │ Bella's  │ │ Dragon   │ │ Unicorn  │ │ Ocean    │ │   New    │      │
│  │ Forest   │ │ Kingdom  │ │ Dreams   │ │ Friends  │ │ Project  │      │
│  │ 40 pages │ │ 25 pages │ │ 30 pages │ │ 35 pages │ │          │      │
│  │ ● Ready  │ │ ○ Draft  │ │ ● Ready  │ │ ◐ Gen... │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2. Project Editor (3-Column)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Back   Bella's Forest Adventure          ☁️ Saved   🎨 847 Blots   [JD]  │
├─────────────┬──────────────────────────────────────────────────┬─────────────┤
│ Pages (32)  │                                                  │ Page 7      │
│─────────────│                                                  │─────────────│
│ [1][2][3]   │    ┌────────────────────────────────────────┐   │ Scene       │
│ [4][5][6]   │    │                                        │   │ "Bella      │
│ [7●][8][9]  │    │                                        │   │  finds a    │
│ [10][11]... │    │         Selected Page                  │   │  butterfly" │
│             │    │         (Large Preview)                │   │             │
│ ──────────  │    │                                        │   │ ▼ Actions   │
│ [Scroll]    │    │                                        │   │ [Regenerate]│
│             │    │                                        │   │ [Edit]      │
│             │    └────────────────────────────────────────┘   │ [Simplify]  │
│             │                                                  │             │
│ [+ Add Page]│    [Zoom: - ○──●──○ +]        [🔍 Preview]     │ ▼ Versions  │
│             │                                                  │ v3 v2 v1    │
└─────────────┴──────────────────────────────────────────────────┴─────────────┘
```

### 3. Page Editor (Edit Mode)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Project                                              [✓ Done]     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Tools: [🖌️ Brush] [⭕ Circle] [▢ Rectangle]    Size: ○───●────○   [Clear]  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │                                                                        │ │
│  │                    [Canvas with pink mask overlay]                     │ │
│  │                                                                        │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  What should appear in the selected area?                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ A small butterfly with simple wings                                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│                                                   [Apply Edit]  12 Blots 🎨  │
│                                                                              │
│  Quick: [🔄 Regenerate] [➕ More Detail] [➖ Simplify]                       │
│                                                                              │
│  History: v3 ← v2 ← v1                                     [Restore v1]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4. Generation Progress

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ✨ Generating your coloring book...                                        │
│                                                                              │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  15 / 40   │
│                                                                              │
│  Creating page 16: Bella discovers a hidden treehouse...                     │
│                                                                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                  │
│  │ ✓  │ │ ✓  │ │ ✓  │ │ ✓  │ │ ✓  │ │ ⟳  │ │ ░░ │ │ ░░ │  ...            │
│  │[1] │ │[2] │ │[3] │ │[4] │ │[5] │ │[6] │ │[7] │ │[8] │                  │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                  │
│                                                                              │
│  ⏱️ About 2 minutes remaining                          [Cancel Generation]  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Shift+Z` |
| Delete | `Delete` / `Backspace` |
| Save | `Ctrl+S` (show "Already saved" toast) |
| Zoom In | `Ctrl++` |
| Zoom Out | `Ctrl+-` |
| Fit to Screen | `Ctrl+0` |
| Escape | Close modals, deselect |

---

## Accessibility (a11y)

| Requirement | Implementation |
|-------------|----------------|
| Focus states | `focus:ring-2 focus:ring-blue-500/40` |
| Alt text | All images have descriptive alt |
| Keyboard nav | All interactive elements focusable |
| Color contrast | 4.5:1 minimum (WCAG AA) |
| ARIA labels | Icon buttons have `aria-label` |
| Skip links | Skip to main content |

---

## Don'ts

- ❌ No pure black text on white (use #212121)
- ❌ No heavy borders (prefer background shades)
- ❌ No modals for settings (use panels)
- ❌ No full-page spinners (use skeletons)
- ❌ No more than 2 font weights per view
- ❌ No inline styles (use Tailwind)
- ❌ No purple gradients or neon colors
- ❌ No animations over 300ms (keep snappy)
- ❌ No dead clicks (always provide feedback)
