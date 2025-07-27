# Frontend Cursor Rules for SuperApp Project

## Build Testing Rule - MANDATORY

**Whenever you are asked to update the project, push the project, try build, or perform any deployment-related tasks, you MUST:**

1. **Run comprehensive build checks** using the provided scripts
2. **Fix ALL warnings and errors** without ignoring them
3. **Ensure 100% test coverage** for new code
4. **Validate TypeScript types** are correct
5. **Check ESLint compliance** with zero warnings
6. **Verify build success** with no errors

### Deployment Command Triggers
**When you hear any of these phrases or similar deployment-related commands, immediately apply the build testing rule:**
- "I want to push"
- "I want to build"
- "I want to release my app"
- "Deploy the app"
- "Build and deploy"
- "Push to production"
- "Release the app"
- "Build the project"
- "Deploy to production"
- "Push the code"
- "Build and push"
- "Release to production"
- "Deploy the project"
- "Build for production"
- "Push and deploy"

**These commands automatically trigger comprehensive build testing and error fixing before any deployment action.**

### Available Build Commands
- `pnpm build:check` - Quick build validation
- `pnpm build:strict` - Comprehensive build with auto-fix
- `pnpm type-check` - TypeScript validation
- `pnpm lint:fix` - ESLint with auto-fix
- `pnpm test:ci` - Tests with coverage

### Quality Standards Enforced
- **TypeScript**: Strict mode with all flags enabled
- **ESLint**: No console.log, unused variables, or any types
- **Test Coverage**: Minimum 80% for all metrics
- **Build**: Zero errors, zero warnings

### Error Resolution Process
1. Read error messages carefully
2. Fix root cause (don't suppress warnings)
3. Run specific check again to verify fix
4. Run full build check to ensure no regressions
5. Commit only when all checks pass

**Remember: Quality over speed. Never deploy broken code.**

## UI/UX Design Guidelines

### Design System
- Use **shadcn/ui** components only
- **Typography**: Inter (English), Vazir (Persian)
- **Spacing**: Base unit 8px, scale: 4, 8, 16, 24, 32, 40, 48, 64px
- **Icons**: Lucide Icons only, standalone clickable elements
- **Layout**: Mobile-first, 12-column grid

### Typography
- English Font: Inter, sans-serif
- Persian Font: Vazir, sans-serif
- Sizes:
  - H1: 2rem (32px)
  - H2: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)
- Line Height: 1.5

### Component Standards
- **Cards/Containers**: Padding: 24px, Elevation: subtle shadow
- **Clickable Card Animations**: All clickable cards MUST include the standard click animation:
  ```tsx
  className="hover:bg-muted/50 active:bg-muted/30 active:scale-[0.98] transition-all duration-150 ease-out"
  ```
  - **Hover effect**: `hover:bg-muted/50` - subtle background on hover
  - **Active state**: `active:bg-muted/30` - darker background when clicked
  - **Scale effect**: `active:scale-[0.98]` - slight shrink to 98% when pressed
  - **Smooth transition**: `transition-all duration-150 ease-out` - 150ms smooth animation
  - **Apply to**: All clickable cards, list items, and interactive containers
- **Skeleton Loaders**: Animated shimmer using Tailwind or framer-motion
- **Icons**: 
  - Icons should be standalone clickable elements (e.g., plain `<svg>` inside a `<div>` or `<span>` with `cursor-pointer`)
  - Do **not** use `<button>` if it adds unwanted default styles
  - Do **not** wrap icons with Button components
  - Do **not** apply background, border-radius, or padding that makes them appear like black rounded buttons
  - Icons should have minimal styling and appear inline with surrounding elements unless otherwise specified

### Mobile Keyboard-Attached Forms - MANDATORY
- **Keyboard-Attached Forms**: Forms that appear when adding new items (tasks, lists, diary entries, etc.) MUST stick to the top of the mobile keyboard and move up/down with the keyboard
- **Native Mobile Feel**: This creates a native mobile app experience where the form appears to be part of the keyboard interface
- **Implementation Pattern**:
  ```tsx
  // Use the keyboard-attached form pattern
  const { ref: inputRef, keyboardHeight } = useMobileKeyboardFocusWithBackGesture(
    showForm,
    () => handleClose(), // Close when keyboard dismissed
    () => handleClose()  // Close when back gesture used
  );

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={handleClose} />
      
      {/* Keyboard-attached form */}
      <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleClose}>
        <div 
          className="w-full bg-white rounded-t-xl p-6 animate-in slide-in-from-bottom-2 duration-300 shadow-lg" 
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'none',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Form content */}
          <input
            ref={inputRef}
            className="w-full text-base border-none outline-none bg-transparent"
            placeholder="Enter name..."
            autoFocus
          />
          
          {/* Action buttons */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            <button onClick={handleClose} className="p-3 rounded-full bg-gray-500 text-white">
              <X className="w-5 h-5" />
            </button>
            <button onClick={handleSubmit} className="p-3 rounded-full bg-primary text-white">
              <Check className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
  ```
- **Required Features**:
  - **Keyboard Detection**: Use `useMobileKeyboardFocusWithBackGesture` hook
  - **Smooth Animation**: Form slides up from bottom with `slide-in-from-bottom-2`
  - **Keyboard Attachment**: Form transforms to stick to keyboard top using `translateY(-${keyboardHeight}px)`
  - **Auto-Close**: Form closes when keyboard is dismissed or back gesture is used
  - **Auto-Focus**: Input automatically focuses to trigger keyboard
  - **Dark Overlay**: Semi-transparent background overlay
  - **Action Buttons**: Positioned at bottom-right of form
- **Target Components**: All "add new" forms including:
  - New task lists
  - New tasks
  - New shopping items
  - New diary entries
  - New ideas
  - Any other form that creates new items

### Mobile Keyboard Focus - MANDATORY
- **Automatic Keyboard Activation**: All "add new item" functionality MUST automatically trigger the mobile keyboard on mobile devices
- **Implementation**: Use the `useMobileKeyboardFocus` or `useConditionalMobileKeyboardFocus` hooks from `@/hooks/use-mobile-keyboard-focus`
- **Target Elements**: Focus the primary input field (usually title/name) when:
  - Creating new diary entries
  - Adding new tasks
  - Adding new shopping items
  - Creating new lists
  - Editing existing items
- **Mobile Detection**: Only activate on devices with screen width ≤ 768px
- **Focus Delay**: Use 100ms delay to ensure component is fully rendered
- **Hook Usage**:
  ```tsx
  // For immediate focus on mount
  const titleInputRef = useMobileKeyboardFocus()
  
  // For conditional focus (e.g., when dialog opens)
  const titleInputRef = useConditionalMobileKeyboardFocus(showInput)
  
  // Attach ref to input
  <input ref={titleInputRef} />
  ```
- **Testing**: All mobile keyboard focus functionality must be tested with unit tests 

### Animation Standards - MANDATORY
- **Use Framer Motion**: All animations MUST be implemented using Framer Motion library
- **No Tailwind Animations**: Do NOT use Tailwind CSS animation classes (`animate-in`, `animate-out`, etc.)
- **Import Pattern**: Always import motion components from framer-motion:
  ```tsx
  import { motion, AnimatePresence } from 'framer-motion';
  ```
- **Animation Implementation**:
  ```tsx
  // For slide animations
  <motion.div
    initial={{ x: -300 }}
    animate={{ x: 0 }}
    exit={{ x: -300 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {/* Content */}
  </motion.div>
  
  // For fade animations
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {/* Content */}
  </motion.div>
  
  // For scale animations
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.1 }}
  >
    {/* Content */}
  </motion.div>
  ```
- **AnimatePresence**: Use AnimatePresence for conditional rendering animations:
  ```tsx
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Content */}
      </motion.div>
    )}
  </AnimatePresence>
  ```
- **Common Animation Variants**:
  ```tsx
  const slideVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  };
  
  const fadeVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };
  ```
- **Performance**: Use `layout` prop for automatic layout animations and `layoutId` for shared element transitions
- **Accessibility**: Ensure animations respect `prefers-reduced-motion` user preference:
  ```tsx
  const shouldReduceMotion = useReducedMotion();
  
  <motion.div
    animate={shouldReduceMotion ? {} : { x: 0 }}
    transition={shouldReduceMotion ? {} : { duration: 0.3 }}
  >
    {/* Content */}
  </motion.div>
  ```
- **Target Components**: All animated components including:
  - Sidebar open/close animations
  - Modal/dialog animations
  - Form slide-in animations
  - Page transitions
  - Loading states
  - Interactive feedback animations 

💡 Animation Guidelines

Keep animation durations < 300ms
Avoid blocking animations (modals, drawers)
Use animations for user feedback only
Use consistent animation duration and easing across app
Consistent animations on click/hover/focus
Native-like animations for mobile (e.g., spring-based for FAB)

🗑️ Delete Animation (MANDATORY)
Use consistent delete animation across all apps for list items, cards, and entries:

```tsx
// Standard delete animation pattern
<AnimatePresence>
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ 
        opacity: 0, 
        x: -100,
        scale: 0.95,
        transition: { duration: 0.2, ease: "easeInOut" }
      }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
    >
      <ItemCard
        item={item}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </motion.div>
  ))}
</AnimatePresence>
```

**Delete Animation Standards:**
- **Exit animation**: `opacity: 0, x: -100, scale: 0.95`
- **Duration**: 200ms for exit, 300ms for enter
- **Easing**: `easeInOut` for exit, `easeOut` for enter
- **Stagger delay**: 50ms between items (`index * 0.05`)
- **Direction**: Slide left (`x: -100`) for consistent direction
- **Scale**: Slight shrink (`scale: 0.95`) for visual feedback
- **Opacity**: Fade out for smooth transition

**Implementation Requirements:**
- Always wrap list items with `AnimatePresence`
- Use unique `key` prop for each item (usually `item.id`)
- Apply to all deletable items: diary entries, todo items, food entries, ideas, etc.
- Ensure parent container has `overflow: hidden` if needed
- Test on both mobile and desktop

**Example Usage:**
```tsx
// For mobile lists
<div className="space-y-3 overflow-hidden">
  <AnimatePresence>
    {entries.map((entry, index) => (
      <motion.div
        key={entry.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ 
          opacity: 0, 
          x: -100,
          scale: 0.95,
          transition: { duration: 0.2, ease: "easeInOut" }
        }}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.05,
          ease: "easeOut"
        }}
      >
        <EntryCard entry={entry} onDelete={handleDelete} />
      </motion.div>
    ))}
  </AnimatePresence>
</div>
```

## Unified Empty State Design

- All empty pages (no data) in the app must use the shared `EmptyState` component from `components/ui/EmptyState.tsx`.
- The design must include a large icon, bold title, optional description, and (if needed) a primary action button.
- Do not use custom empty state markup in feature pages; always use the shared component.
- If you add a new page, its empty state must follow this rule.
- Example usage:

```tsx
<EmptyState
  title="No items yet"
  description="Start by adding your first item."
  action={<Button onClick={...} variant="default">Add item</Button>}
/>
```

🛠 Developer Experience 