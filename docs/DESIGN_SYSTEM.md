# Touch Your Bible - Design System

> **Version:** 1.0.0
> **Platform:** iOS (MVP)
> **Stack:** React Native + Expo SDK 52 + NativeWind v4 + NativeWind UI
> **Updated:** October 2025

## Overview

This design system provides a comprehensive set of design tokens, components, and patterns for the Touch Your Bible app. Built on NativeWind UI with iOS-first design principles.

---

## Design Principles

### 1. **iOS-Native First**
- Follow Apple Human Interface Guidelines
- Use iOS native patterns and gestures
- Platform-specific interactions and animations

### 2. **Spiritual & Calm**
- Peaceful color palette with purpose
- Clean, distraction-free interfaces
- Typography that encourages reading

### 3. **Gamification with Purpose**
- Subtle, meaningful rewards
- Non-intrusive progress indicators
- Community-driven motivation

### 4. **Accessibility by Default**
- WCAG 2.1 AA compliance minimum
- VoiceOver optimization
- Dynamic Type support
- High contrast modes

---

## Color System

### Primary Colors
```javascript
{
  // Primary - Spiritual Blue
  primary: {
    50: '#E3F2FD',   // Lightest
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',  // Base (iOS Blue)
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',  // Darkest
  },

  // Secondary - Sacred Purple
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0',  // Base
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },

  // Accent - Achievement Gold
  accent: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',  // Base
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  }
}
```

### Semantic Colors
```javascript
{
  // Success - Growth Green
  success: {
    light: '#81C784',
    DEFAULT: '#4CAF50',
    dark: '#388E3C',
  },

  // Warning - Attention Orange
  warning: {
    light: '#FFB74D',
    DEFAULT: '#FF9800',
    dark: '#F57C00',
  },

  // Error - Alert Red
  error: {
    light: '#E57373',
    DEFAULT: '#F44336',
    dark: '#D32F2F',
  },

  // Info - Calm Cyan
  info: {
    light: '#4FC3F7',
    DEFAULT: '#03A9F4',
    dark: '#0288D1',
  }
}
```

### Neutral Colors
```javascript
{
  // Grayscale
  gray: {
    50: '#FAFAFA',   // Background light
    100: '#F5F5F5',  // Card background
    200: '#EEEEEE',  // Divider light
    300: '#E0E0E0',  // Border
    400: '#BDBDBD',  // Disabled
    500: '#9E9E9E',  // Secondary text
    600: '#757575',  // Hint text
    700: '#616161',  // Body text
    800: '#424242',  // Primary text
    900: '#212121',  // Heading
  },

  // Dark Mode
  dark: {
    bg: '#000000',      // Pure black (iOS dark)
    surface: '#1C1C1E', // Card background
    elevated: '#2C2C2E', // Elevated surface
    border: '#38383A',   // Border
    text: {
      primary: '#FFFFFF',
      secondary: '#EBEBF5',
      tertiary: '#EBEBF599',
    }
  }
}
```

---

## Typography

### Font System
```javascript
{
  fontFamily: {
    // iOS System Fonts
    sans: ['-apple-system', 'SF Pro Display', 'system-ui'],
    mono: ['SF Mono', 'Monaco', 'Menlo'],

    // Custom (for Bible text)
    serif: ['New York', 'Georgia', 'serif'],
  },

  // Font Sizes (iOS Standard)
  fontSize: {
    '2xs': '10px',   // Caption 2
    'xs': '11px',    // Caption 1
    'sm': '12px',    // Footnote
    'base': '14px',  // Callout
    'lg': '15px',    // Subheadline
    'xl': '17px',    // Body (iOS default)
    '2xl': '20px',   // Title 3
    '3xl': '22px',   // Title 2
    '4xl': '28px',   // Title 1
    '5xl': '34px',   // Large Title
  },

  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.15',
    snug: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  }
}
```

### Text Styles
```javascript
{
  // iOS Typography Scale
  largeTitle: 'text-[34px] font-bold leading-[41px] tracking-[0.37px]',
  title1: 'text-[28px] font-bold leading-[34px] tracking-[0.36px]',
  title2: 'text-[22px] font-bold leading-[28px] tracking-[0.35px]',
  title3: 'text-[20px] font-semibold leading-[25px] tracking-[0.38px]',

  headline: 'text-[17px] font-semibold leading-[22px] tracking-[-0.41px]',
  body: 'text-[17px] font-regular leading-[22px] tracking-[-0.41px]',
  callout: 'text-[16px] font-regular leading-[21px] tracking-[-0.32px]',
  subheadline: 'text-[15px] font-regular leading-[20px] tracking-[-0.24px]',
  footnote: 'text-[13px] font-regular leading-[18px] tracking-[-0.08px]',
  caption1: 'text-[12px] font-regular leading-[16px] tracking-[0px]',
  caption2: 'text-[11px] font-regular leading-[13px] tracking-[0.07px]',
}
```

---

## Spacing System

### Scale (Based on 4px grid)
```javascript
{
  spacing: {
    0: '0px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
  }
}
```

### Layout Spacing
```javascript
{
  // Screen Padding
  screenPadding: {
    x: 'px-4',  // 16px horizontal
    y: 'py-4',  // 16px vertical
  },

  // Section Spacing
  sectionGap: 'gap-6',     // 24px between sections
  componentGap: 'gap-4',   // 16px between components
  itemGap: 'gap-2',        // 8px between list items

  // Card Padding
  cardPadding: 'p-4',      // 16px all sides
  cardPaddingLg: 'p-6',    // 24px for large cards
}
```

---

## Border & Radius

### Border Radius
```javascript
{
  borderRadius: {
    none: '0px',
    sm: '4px',     // Small elements
    DEFAULT: '8px', // Standard (iOS style)
    md: '12px',    // Cards
    lg: '16px',    // Large cards
    xl: '20px',    // Modals
    '2xl': '24px', // Full screen sheets
    '3xl': '28px', // Hero elements
    full: '9999px', // Pills/avatars
  }
}
```

### Border Width
```javascript
{
  borderWidth: {
    0: '0px',
    DEFAULT: '1px',    // iOS standard
    2: '2px',
    4: '4px',
  }
}
```

---

## Shadows & Elevation

### iOS-Style Shadows
```javascript
{
  boxShadow: {
    // iOS elevation levels
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
    lg: '0 8px 24px 0 rgba(0, 0, 0, 0.15)',
    xl: '0 12px 32px 0 rgba(0, 0, 0, 0.18)',

    // Card shadows
    card: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
    cardHover: '0 4px 16px 0 rgba(0, 0, 0, 0.12)',

    // Modal shadows
    modal: '0 10px 40px 0 rgba(0, 0, 0, 0.25)',
  }
}
```

---

## Animation & Transitions

### Timing Functions
```javascript
{
  // iOS standard easing
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },

  // Duration
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  }
}
```

### Common Animations
```javascript
{
  // Fade
  fadeIn: 'animate-in fade-in duration-250',
  fadeOut: 'animate-out fade-out duration-250',

  // Slide
  slideInBottom: 'animate-in slide-in-from-bottom duration-350',
  slideInTop: 'animate-in slide-in-from-top duration-350',

  // Scale
  scaleIn: 'animate-in zoom-in-95 duration-250',
  scaleOut: 'animate-out zoom-out-95 duration-250',

  // Press effect
  activeScale: 'active:scale-95 transition-transform duration-150',
}
```

---

## Accessibility

### Touch Targets
```javascript
{
  // Minimum iOS touch target: 44x44pt
  minTouchTarget: {
    width: 'min-w-[44px]',
    height: 'min-h-[44px]',
  }
}
```

### Focus States
```javascript
{
  focusRing: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-primary-500',
}
```

### Color Contrast
- **Text on Light Background:** Minimum 4.5:1 ratio
- **Text on Dark Background:** Minimum 4.5:1 ratio
- **Large Text:** Minimum 3:1 ratio
- **Interactive Elements:** Minimum 3:1 ratio

---

## Dark Mode Strategy

### Implementation
```javascript
{
  // Use iOS semantic colors
  background: 'bg-white dark:bg-black',
  surface: 'bg-gray-50 dark:bg-dark-surface',
  elevated: 'bg-white dark:bg-dark-elevated',

  // Text
  textPrimary: 'text-gray-900 dark:text-dark-text-primary',
  textSecondary: 'text-gray-600 dark:text-dark-text-secondary',
  textTertiary: 'text-gray-500 dark:text-dark-text-tertiary',

  // Borders
  border: 'border-gray-200 dark:border-dark-border',
}
```

---

## Usage Guidelines

### Do's ✅
- Use iOS system fonts for native feel
- Follow 4px spacing grid consistently
- Implement proper touch targets (44x44pt minimum)
- Support Dynamic Type for accessibility
- Test with VoiceOver enabled
- Use semantic color names

### Don'ts ❌
- Don't use Android Material Design patterns
- Don't create custom shadows (use system shadows)
- Don't ignore dark mode
- Don't use colors without semantic meaning
- Don't hardcode spacing values
- Don't skip accessibility testing

---

## Component Patterns

### Card Pattern
```jsx
<View className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-card">
  {/* Content */}
</View>
```

### Button Pattern
```jsx
<TouchableOpacity
  className="bg-primary-500 active:bg-primary-600 px-4 py-3 rounded-lg min-h-[44px]"
  activeOpacity={0.8}
>
  <Text className="text-white text-center font-semibold">
    Button Text
  </Text>
</TouchableOpacity>
```

### List Item Pattern
```jsx
<TouchableOpacity className="flex-row items-center py-3 px-4 min-h-[44px] active:bg-gray-50">
  <View className="flex-1">
    <Text className="text-gray-900 dark:text-dark-text-primary">Title</Text>
    <Text className="text-gray-500 dark:text-dark-text-tertiary text-sm">Subtitle</Text>
  </View>
  <ChevronRightIcon className="text-gray-400" />
</TouchableOpacity>
```

---

## Performance Considerations

### Optimization Tips
1. **Use `className` over inline styles** - Better performance with NativeWind
2. **Memoize expensive computations** - Use `useMemo` and `useCallback`
3. **Optimize images** - Use WebP format, lazy loading
4. **Virtual lists** - Use `FlashList` for long lists
5. **Reanimated** - Use for complex animations

---

## Resources

### Documentation
- [NativeWind Documentation](https://nativewindui.com)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [iOS Color Picker](https://developer.apple.com/design/resources/)

---

**Last Updated:** October 2025
**Maintained by:** Touch Your Bible Design Team
