# Design System Quick Reference

## 🎨 Color Palette

### Primary Colors
```css
--background-primary: #000000      /* Pure black */
--background-secondary: #1c1c1e    /* Zinc-950 */
--background-tertiary: #2c2c2e     /* Zinc-900 */
```

### Accent Colors
```css
--accent-primary: #fbbf24          /* Yellow-500 */
--accent-hover: #fcd34d            /* Yellow-400 */
```

### Text Colors
```css
--text-primary: #ffffff            /* White */
--text-secondary: #a1a1aa          /* Zinc-500 */
```

### Utility Colors
```css
--border-color: #3f3f46            /* Zinc-800 */
Success: #10b981                   /* Emerald-500 */
Error: #ef4444                     /* Red-500 */
```

---

## 📏 Spacing Scale (Tailwind)

```
1  = 0.25rem  (4px)
2  = 0.5rem   (8px)
3  = 0.75rem  (12px)
4  = 1rem     (16px)    ← Most common
5  = 1.25rem  (20px)
6  = 1.5rem   (24px)    ← Card padding
8  = 2rem     (32px)
12 = 3rem     (48px)
16 = 4rem     (64px)
```

---

## 🔲 Border Radius

```css
rounded-lg:   8px      /* Small elements */
rounded-xl:   12px     /* Inputs, buttons */
rounded-2xl:  16px     /* Cards */
rounded-3xl:  24px     /* Large containers */
rounded-full: 9999px   /* Circles (FAB, checkboxes) */
```

---

## 🌑 Shadows

### Standard Shadows
```css
--shadow-sm:  0 2px 8px rgba(0, 0, 0, 0.3)
--shadow-md:  0 4px 16px rgba(0, 0, 0, 0.4)
--shadow-lg:  0 8px 32px rgba(0, 0, 0, 0.5)
```

### Neumorphic Shadow
```css
--shadow-neumorphic: 
  8px 8px 16px rgba(0, 0, 0, 0.6),
  -8px -8px 16px rgba(255, 255, 255, 0.02)
```

### Glow Effects
```css
Yellow Glow:  0 0 0 3px rgba(251, 191, 36, 0.3)
Button Glow:  0 8px 30px rgba(251, 191, 36, 0.3)
FAB Shadow:   0 8px 32px rgba(251, 191, 36, 0.4)
```

---

## ✍️ Typography

### Font Families
```css
System UI: system-ui, -apple-system, sans-serif  /* For large numbers */
Default:   Inter, sans-serif
```

### Font Weights
```css
font-thin:      100   /* Large time displays */
font-light:     300   /* Subtitles */
font-normal:    400   /* Body text */
font-medium:    500   /* Labels */
font-semibold:  600   /* Buttons */
font-bold:      700   /* Headers */
```

### Font Sizes
```css
text-xs:   0.75rem  (12px)   /* Dates, labels */
text-sm:   0.875rem (14px)   /* Search, inputs */
text-base: 1rem     (16px)   /* Body */
text-lg:   1.125rem (18px)   /* Subtitles */
text-xl:   1.25rem  (20px)   /* Section headers */
text-2xl:  1.5rem   (24px)   /* Time AM/PM */
text-3xl:  1.875rem (30px)   /* Page headers */
text-4xl:  2.25rem  (36px)   /* Large headers */
text-5xl:  3rem     (48px)   /* Alarm/Timer display */
text-8xl:  6rem     (96px)   /* Clock display */
text-9xl:  8rem     (128px)  /* Max clock size */
```

---

## 🎭 CSS Utility Classes

### Glassmorphism
```css
.glass {
  background: rgba(28, 28, 30, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Premium Card
```css
.premium-card {
  background: linear-gradient(145deg, #1f1f22, #18181b);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}
```

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Animations
```css
.fade-in          /* Opacity 0→1 (0.5s) */
.slide-in         /* Y: 20px→0 (0.6s) */
.slide-in-right   /* X: 30px→0 (0.5s) */
.scale-in         /* Scale: 0.95→1 (0.4s) */
```

---

## 🎬 Framer Motion Presets

### Page Transition
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
```

### Card Entrance
```jsx
initial={{ opacity: 0, scale: 0.9, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{
  duration: 0.3,
  delay: index * 0.05,
  ease: [0.16, 1, 0.3, 1]
}}
```

### Button Hover/Tap
```jsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### FAB Animation
```jsx
initial={{ scale: 0, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
whileHover={{ scale: 1.1, rotate: 90 }}
whileTap={{ scale: 0.9 }}
transition={{ type: "spring", stiffness: 200 }}
```

### Modal/Form
```jsx
initial={{ opacity: 0, scale: 0.95, y: -20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: -20 }}
transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
```

---

## 🔘 Button Styles

### Primary Button (CTA)
```jsx
className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-400 
rounded-xl text-black font-semibold hover:shadow-lg 
hover:shadow-yellow-500/30 transition-all duration-300"
```

### Secondary Button
```jsx
className="px-4 py-2.5 glass text-white rounded-xl 
hover:bg-zinc-800/70 transition-all border border-zinc-800/50"
```

### Icon Button
```jsx
className="p-2.5 hover:bg-zinc-800/70 rounded-xl 
text-yellow-500 transition-all"
```

### Danger Button
```jsx
className="p-2.5 hover:bg-zinc-800/70 rounded-xl 
text-red-500 transition-all"
```

---

## 📝 Input Styles

### Standard Input
```jsx
className="w-full pl-12 pr-4 py-3.5 rounded-xl 
bg-zinc-900/50 text-white outline-none placeholder-zinc-600 
border border-zinc-800/50 focus:border-yellow-500/50 
transition-all duration-300"
```

### Search Input
```jsx
className="w-full glass rounded-xl pl-11 pr-4 py-3 
text-sm outline-none text-white placeholder-zinc-500 
border border-zinc-800/50 focus:border-yellow-500/50 
transition-all duration-300"
```

---

## 🎯 Common Patterns

### Card Grid
```jsx
<div className="grid grid-cols-2 gap-4">
  {items.map((item, index) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="premium-card p-5"
    >
      {/* Content */}
    </motion.div>
  ))}
</div>
```

### List with Stagger
```jsx
<div className="space-y-3">
  <AnimatePresence mode="popLayout">
    {items.map((item, index) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="premium-card p-4"
      >
        {/* Content */}
      </motion.div>
    ))}
  </AnimatePresence>
</div>
```

### Floating Action Button
```jsx
<motion.button
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  whileHover={{ scale: 1.1, rotate: 90 }}
  whileTap={{ scale: 0.9 }}
  transition={{ type: "spring", stiffness: 200 }}
  className="fixed bottom-24 right-6 w-16 h-16 
  bg-gradient-to-br from-yellow-500 to-yellow-400 
  rounded-full shadow-2xl shadow-yellow-500/40"
>
  <Plus size={28} className="text-black" />
</motion.button>
```

---

## ⏱️ Animation Timings

### Fast (Micro-interactions)
```
Duration: 0.15s - 0.2s
Use: Hover states, checkbox toggles
```

### Medium (UI Elements)
```
Duration: 0.3s - 0.4s
Use: Button clicks, card entrance, modals
```

### Slow (Page Transitions)
```
Duration: 0.5s - 0.6s
Use: Tab switches, page loads
```

### Stagger Delay
```
Per Item: 0.05s
Max: 0.5s total
```

---

## 🎨 Gradient Backgrounds

### Page Background
```css
bg-gradient-to-br from-black via-zinc-950 to-zinc-900
```

### Button Gradient
```css
bg-gradient-to-r from-yellow-500 to-yellow-400
```

### Card Gradient
```css
background: linear-gradient(145deg, #1f1f22, #18181b)
```

---

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Usage Pattern
```jsx
className="text-8xl sm:text-9xl"  /* Larger on bigger screens */
className="grid-cols-2 md:grid-cols-3"  /* More columns on tablets */
```

---

## ✅ Best Practices

1. **Always use custom easing:** `[0.16, 1, 0.3, 1]`
2. **Stagger lists:** Multiply index by 0.05s
3. **Use AnimatePresence:** For smooth exits
4. **GPU acceleration:** Use transforms, not top/left
5. **Consistent spacing:** Use Tailwind scale
6. **Motion hierarchy:** Faster = less important
7. **Hover states:** Scale or color, not both usually
8. **Focus states:** Yellow border with glow
9. **Loading states:** Rotation + opacity
10. **Glass effect:** Always with border

---

## 🚀 Quick Copy-Paste

### Premium Card
```jsx
<motion.div
  whileHover={{ scale: 1.03, y: -4 }}
  whileTap={{ scale: 0.98 }}
  className="premium-card p-5"
>
  {children}
</motion.div>
```

### Glass Input with Icon
```jsx
<div className="relative">
  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
  <input
    className="w-full pl-12 pr-4 py-3.5 rounded-xl glass text-white outline-none 
    placeholder-zinc-600 border border-zinc-800/50 focus:border-yellow-500/50 
    transition-all duration-300"
    placeholder="..."
  />
</div>
```

### Action Button
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-400 
  rounded-xl text-black font-semibold hover:shadow-lg 
  hover:shadow-yellow-500/30 transition-all"
>
  Action
</motion.button>
```

---

**Use this guide to maintain consistency when adding new features!** 🎨
