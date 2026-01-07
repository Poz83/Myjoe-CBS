# UI/UX Design System

## Core Principles

| Principle | Rule |
|-----------|------|
| Theme | Dark only (v1) |
| Max content width | 1280px |
| Font | Inter |
| Icons | Lucide React |
| Loading | Skeleton UI (not spinners) |
| Empty states | Always show CTA |

---

## Color System

### Background Colors

```css
--bg-base: #0D0D0D;      /* Page background */
--bg-surface: #1A1A1A;   /* Cards, panels */
--bg-elevated: #262626;  /* Modals, dropdowns */
--bg-canvas: #171717;    /* Neutral canvas area */
```

### Border Colors

```css
--border-default: #27272A;  /* zinc-800 */
--border-hover: #3F3F46;    /* zinc-700 */
--border-focus: #3B82F6;    /* blue-500 */
```

### Text Colors

```css
--text-primary: #FAFAFA;    /* zinc-50 */
--text-secondary: #A1A1AA;  /* zinc-400 */
--text-muted: #71717A;      /* zinc-500 */
```

### Status Colors

```css
--status-success: #22C55E;  /* green-500 */
--status-warning: #F59E0B;  /* amber-500 */
--status-error: #EF4444;    /* red-500 */
--status-info: #3B82F6;     /* blue-500 */
```

---

## Spacing System (4px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight inline spacing |
| space-2 | 8px | Button padding Y |
| space-3 | 12px | Button padding X |
| space-4 | 16px | Card padding |
| space-6 | 24px | Section gaps |
| space-8 | 32px | Large sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Small badges |
| radius-md | 6px | Inputs |
| radius-lg | 8px | Buttons |
| radius-xl | 12px | Cards |
| radius-full | 9999px | Pills, avatars |

---

## Typography Scale

```css
/* Headings */
.text-2xl { font-size: 1.5rem; font-weight: 600; }   /* Page titles */
.text-xl  { font-size: 1.25rem; font-weight: 600; }  /* Section titles */
.text-lg  { font-size: 1.125rem; font-weight: 500; } /* Card titles */

/* Body */
.text-base { font-size: 1rem; }      /* Default body */
.text-sm   { font-size: 0.875rem; }  /* Secondary text */
.text-xs   { font-size: 0.75rem; }   /* Captions, badges */
```

---

## Component Patterns

### Buttons

```tsx
// Primary (main actions)
<Button variant="primary">Generate</Button>
// bg-blue-600 hover:bg-blue-700

// Secondary
<Button variant="secondary">Cancel</Button>
// bg-zinc-800 hover:bg-zinc-700

// Outline
<Button variant="outline">Learn More</Button>
// border-zinc-700 hover:bg-zinc-800

// Ghost
<Button variant="ghost">Settings</Button>
// hover:bg-zinc-800

// Danger
<Button variant="danger">Delete</Button>
// bg-red-600 hover:bg-red-700
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Project Name</CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
// bg-zinc-900 border-zinc-800 rounded-xl
```

### Inputs

```tsx
<Input 
  label="Project Name"
  placeholder="Enter name..."
  error="Name is required"
/>
// bg-zinc-900 border-zinc-800 focus:border-blue-500
```

---

## Layout: Fluid 3-Column

The project editor uses a fluid 3-column layout:

```css
.editor-layout {
  display: grid;
  grid-template-columns: auto 1fr auto;
  height: 100vh;
}

.left-panel {
  width: 300px;
  /* Collapsible to 0 */
}

.center-panel {
  min-width: 400px;
  /* Grows to fill */
}

.right-panel {
  width: 360px;
  /* Collapsible to 0 */
}
```

---

## Loading States

### Skeleton Components

```tsx
// Use shimmer animation, not spinners
<Skeleton className="h-4 w-32" />
<Skeleton className="h-10 w-full" />
<Skeleton className="aspect-[3/4] w-full" />
```

### Shimmer Animation

```css
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #1a1a1a 25%,
    #262626 50%,
    #1a1a1a 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Empty States

All empty states include:
1. Icon (Lucide, in circle with bg-zinc-800)
2. Title (font-medium)
3. Description (text-zinc-400)
4. CTA button (primary)

```tsx
<EmptyState
  icon={Book}
  title="No projects yet"
  description="Create your first coloring book to get started"
  action={{ label: "Create Project", href: "/studio/projects/new" }}
/>
```

---

## Safety Feedback UI (NEW)

When content is blocked by safety:

```tsx
// In generation-start.tsx
{safetyError && (
  <div className="space-y-3">
    {/* Error message */}
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
      <p className="text-red-400">{safetyError.message}</p>
    </div>
    
    {/* Suggestions */}
    <div className="space-y-2">
      <p className="text-sm text-zinc-400">Try instead:</p>
      {safetyError.suggestions.map((s, i) => (
        <button 
          key={i}
          onClick={() => setIdea(s.replace('Try: ', ''))}
          className="block text-sm text-blue-400 hover:underline"
        >
          {s}
        </button>
      ))}
    </div>
  </div>
)}
```

Textarea styling when blocked:
```css
.input-error {
  border-color: rgb(239 68 68 / 0.5);  /* red-500/50 */
}
```

---

## Blot Packs UI (NEW)

### Pack Selector

```tsx
<div className="grid grid-cols-3 gap-4">
  {PACKS.map((pack) => (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
      {pack.popular && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 
                         bg-blue-500 text-xs px-2 py-0.5 rounded-full">
          Popular
        </span>
      )}
      
      <div className="text-3xl mb-2">{pack.emoji}</div>
      <div className="font-medium">{pack.name}</div>
      <div className="text-2xl font-bold text-blue-400">{pack.blots}</div>
      <div className="text-sm text-zinc-400 mb-4">Blots</div>
      
      <Button className="w-full">${pack.price}</Button>
    </div>
  ))}
</div>
```

### Low Blots Banner

```tsx
// Show when blots < 50
<div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 
                flex items-center justify-between">
  <div className="flex items-center gap-3">
    <AlertTriangle className="h-5 w-5 text-amber-500" />
    <div>
      <p className="font-medium">Running low on Blots</p>
      <p className="text-sm text-zinc-400">You have {blots} Blots remaining</p>
    </div>
  </div>
  
  <div className="flex gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link href="/billing#packs">Buy Pack</Link>
    </Button>
    <Button size="sm" asChild>
      <Link href="/billing#upgrade">Upgrade Plan</Link>
    </Button>
  </div>
</div>
```

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Wide desktop |

The app is **PC-first**, but should be usable on tablet.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Focus visible | ring-2 ring-blue-500 |
| Touch targets | Min 44×44px |
| Color contrast | WCAG AA |
| Aria labels | On all icon buttons |
| Alt text | On all images |
