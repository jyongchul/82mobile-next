# Scroll Performance Verification Guide

**Created**: 2026-01-26
**Phase**: 6 - Performance & Analytics
**Plan**: 06-05 - Scroll Performance Optimization

---

## Prerequisites

- Chrome browser (latest version)
- Production build of the application
- Chrome DevTools proficiency

---

## Step 1: Build Production Version

```bash
cd /mnt/c/82Mobile/82mobile-next

# Build production bundle
npm run build

# Start production server
npm run start
```

Server will start at: `http://localhost:3000`

---

## Step 2: Open Chrome DevTools

1. Open Chrome and navigate to `http://localhost:3000/en`
2. Press `F12` or `Ctrl+Shift+I` to open DevTools
3. Click the **Performance** tab

---

## Step 3: Record Scroll Performance

1. Click the **Record** button (●) in Performance tab
2. Scroll from top to bottom of the page (smooth, steady scroll)
3. Click **Stop** button to finish recording

---

## Step 4: Analyze Results

### FPS Counter

Look at the **FPS** graph at the top of the recording:
- **Target**: Solid green line at 60 FPS throughout scroll
- **Issue**: Dips below 60 FPS (red or yellow sections)

### Long Tasks

Check the **Main** timeline:
- **Target**: No tasks longer than 50ms during scroll
- **Issue**: Red corner markers indicate long tasks (>50ms)

### Layout Thrashing

Look for warnings in the timeline:
- **Target**: No "Forced reflow" warnings
- **Issue**: Multiple back-to-back layout/style recalculations

### Frame Drops

Check the **Frames** section:
- **Target**: Consistent frame timing (~16.67ms per frame)
- **Issue**: Missing frames or irregular timing

---

## Step 5: Check Web Vitals During Scroll

Open Console and watch for Web Vitals logs:

```javascript
// Expected logs (in development):
[WebVitals] CLS: 0.002 (good)
[WebVitals] INP: 48ms (good)
```

**Target Values:**
- CLS <0.1 (no layout shifts during scroll)
- INP <200ms (responsive interactions during scroll)

---

## Step 6: Verify Optimizations Applied

### Passive Event Listeners

1. In DevTools, go to **Sources** tab
2. Search for `addEventListener`
3. Verify `{ passive: true }` is used for scroll listeners

### GPU Acceleration

1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Show Rendering"
3. Enable **Paint flashing**
4. Scroll page - green flashes indicate GPU-accelerated elements

### RequestAnimationFrame Usage

1. In DevTools Console, run:
```javascript
// Check if RAF is being used
console.log(window.requestAnimationFrame.length);
```

---

## Step 7: Document Results

Create a results document with the following template:

```markdown
## Scroll Performance Results

**Test Date**: [DATE]
**Browser**: Chrome [VERSION]
**Device**: [Desktop/Mobile]
**Commit**: [HASH]

### FPS During Scroll
- Average FPS: [XX]/60
- Frame drops: [X] frames
- Long tasks: [X] tasks >50ms

### Web Vitals (During Scroll)
- CLS: [X.XXX] (<0.1 ✓/✗)
- INP: [XXX]ms (<200ms ✓/✗)

### Chrome DevTools Issues
- Layout thrashing: [Yes/No]
- Non-passive listeners: [Count]
- Forced reflows: [Count]

### Optimizations Verified
- [ ] Lenis configured with RAF loop
- [ ] Passive event listeners on scroll
- [ ] GPU acceleration (translateZ, will-change)
- [ ] Intersection Observer debounced with RAF
- [ ] Scroll progress uses RAF

### Verdict
- [ ] Consistent 60fps achieved
- [ ] No frame drops during scroll
- [ ] No layout shifts
- [ ] All optimizations applied
```

---

## Expected Results

### Passing Criteria

✅ **FPS**: Solid 60 FPS throughout scroll
✅ **Frame Drops**: 0 dropped frames
✅ **Long Tasks**: 0 tasks >50ms during scroll
✅ **CLS**: <0.1 (no layout shifts)
✅ **INP**: <200ms (responsive interactions)
✅ **GPU Acceleration**: Paint flashing shows green (not red)
✅ **Passive Listeners**: All scroll listeners marked passive

### Common Issues

❌ **Frame Drops**: May indicate:
- Non-optimized images loading during scroll
- Heavy JavaScript execution
- Layout thrashing (forced reflows)

❌ **High CLS**: May indicate:
- Images without dimensions
- Dynamic content insertion
- Font loading issues

❌ **Long Tasks**: May indicate:
- Non-debounced scroll handlers
- Synchronous API calls
- Heavy DOM manipulations

---

## Troubleshooting

### Issue: FPS Below 60

**Possible Causes:**
- Images not using `priority` or `loading="lazy"`
- Scroll handlers not using RAF
- GPU acceleration not applied

**Fix:**
1. Check Hero images have `priority={true}`
2. Verify all scroll listeners use `{ passive: true }`
3. Add `transform: translateZ(0)` to animated elements

### Issue: Layout Shifts During Scroll

**Possible Causes:**
- Images without explicit width/height
- Fonts loading late (FOIT/FOUT)
- Dynamic content insertion

**Fix:**
1. Add dimensions to all images
2. Use `next/font` for font preloading
3. Reserve space for dynamic content

### Issue: High INP During Scroll

**Possible Causes:**
- Non-passive scroll listeners
- Heavy event handlers
- Synchronous operations

**Fix:**
1. Add `{ passive: true }` to all scroll listeners
2. Debounce handlers with RAF
3. Move heavy operations off main thread

---

## Performance Targets (Phase 6)

| Metric | Target | Status |
|--------|--------|--------|
| FPS | 60 fps | ⏳ Verify |
| Frame Drops | 0 | ⏳ Verify |
| CLS (scroll) | <0.1 | ⏳ Verify |
| INP (scroll) | <200ms | ⏳ Verify |
| Long Tasks | 0 >50ms | ⏳ Verify |
| GPU Accelerated | Yes | ✅ Applied |
| Passive Listeners | Yes | ✅ Applied |
| RAF Debouncing | Yes | ✅ Applied |

---

## Next Steps After Verification

1. **If all tests pass**: Mark Phase 6 complete
2. **If issues found**: Create follow-up plans to address specific bottlenecks
3. **Document findings**: Update lighthouse-results.md with scroll performance data

---

## References

- [Chrome DevTools Performance Guide](https://developer.chrome.com/docs/devtools/performance/)
- [Web Vitals](https://web.dev/vitals/)
- [Lenis Smooth Scroll](https://lenis.studiofreight.com/)
- [RequestAnimationFrame Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
