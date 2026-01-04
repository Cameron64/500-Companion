# Mobile Responsiveness Audit - Findings

**Date:** January 4, 2026
**Viewport tested:** 375x812 (iPhone X/11/12 size)
**Method:** Visual audit with Playwright + code analysis

---

## Executive Summary

The app is **mostly mobile-friendly** with good foundational responsive patterns. The main issues are:
1. **Calendar is hard to use on mobile** (small touch targets, cramped toolbar)
2. **Text sizing could be more mobile-optimized** (headings too large)
3. **Some fixed widths risk overflow** on very small screens

---

## Visual Audit Findings

### Home Page
**Status:** Good overall

| Issue | Severity | Description |
|-------|----------|-------------|
| Section header alignment | Low | "Upcoming Events" heading and "View calendar" link wrap awkwardly side-by-side |

**What works well:**
- Hamburger menu functional and properly sized
- Hero section scales nicely
- CTA buttons have good touch targets
- Footer stacks properly

---

### Events/Calendar Page
**Status:** Needs work

| Issue | Severity | Description |
|-------|----------|-------------|
| Toolbar cramped | High | Previous/Next/Today buttons and Month/Week toggle compete with month title for space |
| Calendar cells too small | High | Day cells ~40px wide - below 44px touch target minimum |
| Horizontal overflow | High | Week view causes horizontal scroll (visible in testing) |

**Screenshot evidence:** Calendar toolbar wraps awkwardly, controls fight for space.

---

### Updates, Gallery, Visitor Guide, About Pages
**Status:** Good

These pages are simple and render well on mobile. Empty state messages display correctly.

---

### Admin Panel (Payload)
**Status:** Good

Payload CMS handles its own responsive design well. Login form centers and sizes appropriately.

---

## Code Audit Findings

### HIGH Priority

#### 1. FullCalendar Not Mobile-Optimized
**File:** `src/components/EventCalendar.tsx:16-20`

```tsx
// Current - shows month grid on all devices
initialView="dayGridMonth"
```

**Problem:** Month view shows 35-42 tiny cells. Touch targets ~30-40px.

**Fix:** Use list view on mobile:
```tsx
const [isMobile, setIsMobile] = useState(false)
useEffect(() => {
  setIsMobile(window.innerWidth < 768)
}, [])

<FullCalendar
  initialView={isMobile ? "listWeek" : "dayGridMonth"}
  // ...
/>
```

#### 2. Fixed Min-Width on Date Boxes
**Files:**
- `src/app/(app)/page.tsx:127` - `min-w-[60px]`
- `src/app/(app)/events/[slug]/page.tsx:49` - `min-w-[80px]`

**Problem:** On phones <360px, these force horizontal overflow.

**Fix:**
```tsx
// From:
min-w-[80px]
// To:
min-w-fit sm:min-w-[80px]
```

---

### MEDIUM Priority

#### 3. Large Headings Without Mobile Scaling
**Files:** Nearly all page routes use `text-4xl` without breakpoint reduction.

| File | Line |
|------|------|
| `src/app/(app)/updates/page.tsx` | 17 |
| `src/app/(app)/gallery/page.tsx` | 17 |
| `src/app/(app)/events/page.tsx` | 14 |
| `src/app/(app)/visitor-guide/page.tsx` | 17 |
| `src/app/(app)/about/page.tsx` | 18 |

**Fix:**
```tsx
// From:
<h1 className="font-serif text-4xl font-bold mb-8">
// To:
<h1 className="font-serif text-3xl sm:text-4xl font-bold mb-8">
```

#### 4. Prose Typography Too Large on Mobile
**Files:**
- `src/app/(app)/updates/[slug]/page.tsx:70`
- `src/app/(app)/events/[slug]/page.tsx:137`
- `src/app/(app)/visitor-guide/page.tsx:43`
- `src/app/(app)/about/page.tsx:54`

All use `prose prose-lg` which is desktop-sized.

**Fix:**
```tsx
// From:
<div className="prose prose-lg max-w-none">
// To:
<div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
```

#### 5. Gallery Grid - Small Touch Targets
**Files:**
- `src/app/(app)/gallery/page.tsx:20`
- `src/app/(app)/gallery/[slug]/page.tsx:66`

2-column grid creates ~75-90px images on mobile. Consider single column for very small screens.

**Fix:**
```tsx
// From:
grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4
// To:
grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

---

### LOW Priority

#### 6. Hamburger Button Touch Target
**File:** `src/components/ui/Navigation.tsx:52`

Uses `p-2` (8px padding) = ~38px total. Slightly below 44px recommendation.

**Fix:** Change to `p-3` on mobile.

#### 7. Pagination Buttons Small
**File:** `src/app/(app)/updates/page.tsx:81`

`py-2` creates ~32px height buttons.

**Fix:** Add `py-3` on mobile.

#### 8. Missing Overflow Protection
**File:** `src/app/(app)/layout.tsx`

Add `overflow-x-hidden` to body to prevent accidental horizontal scroll.

---

## Recommended Fix Order

### Phase 1 - Critical (Do Now)
1. [ ] Calendar: Switch to list view on mobile
2. [ ] Calendar: Rework toolbar layout for mobile
3. [ ] Remove fixed `min-w` values or make responsive

### Phase 2 - Important (Before Launch)
4. [ ] Add responsive heading sizes (`text-3xl sm:text-4xl`)
5. [ ] Make prose responsive (`prose-sm sm:prose-base md:prose-lg`)
6. [ ] Consider single-column gallery on xs screens

### Phase 3 - Polish (Nice to Have)
7. [ ] Increase hamburger button padding
8. [ ] Increase pagination touch targets
9. [ ] Add overflow-x-hidden to body

---

## Screenshots

Screenshots saved to `.playwright-mcp/`:
- `mobile-audit-home.png` - Home page full
- `mobile-audit-menu.png` - Mobile navigation open
- `mobile-audit-events.png` - Calendar month view
- `mobile-audit-events-week.png` - Calendar week view (shows overflow)
- `mobile-audit-updates.png` - Updates listing
- `mobile-audit-gallery.png` - Photo gallery
- `mobile-audit-visitor-guide.png` - Visitor guide
- `mobile-audit-admin.png` - Payload admin login

---

## Testing Notes

- Tested at 375px width (iPhone standard)
- Also consider testing at 320px for older/smaller devices
- Android devices may vary slightly due to different pixel densities
- PWA install banner may affect available viewport height
