# Component ClassNames Reference
**Owner**: Taylor (Visual Designer)
**Created**: October 7, 2025
**Purpose**: Exact NativeWind className strings for Day 2 implementation

---

## Verification Modal Components

### Modal Container (React Native Modal)
```tsx
<Modal
  animationType="slide"
  transparent={true}
  visible={isOpen}
  onRequestClose={onClose}
>
  <View className="flex-1 justify-center items-center bg-black/50">
    {/* Modal content wrapper */}
    <View className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-2xl">
      {/* Content goes here */}
    </View>
  </View>
</Modal>
```

**Breakdown**:
- `bg-black/50` - 50% opacity black backdrop
- `bg-white` - White modal background
- `rounded-2xl` - 24px border radius
- `p-6` - 24px padding all sides
- `mx-4` - 16px horizontal margin
- `w-full max-w-sm` - Full width with 384px max (small breakpoint)
- `shadow-2xl` - Large drop shadow

---

### Book Icon (Top Center)
```tsx
import { Icon } from '@roninoss/icons';

<View className="items-center mb-4">
  <Icon name="book-open" size={64} color="#2196F3" />
</View>
```

**Breakdown**:
- `items-center` - Center horizontally
- `mb-4` - 16px margin bottom
- Icon color: `#2196F3` (primary-500 blue)

---

### Headline Text
```tsx
<Text className="text-[22px] font-semibold text-gray-900 text-center mb-6 leading-7">
  Did you read your Bible today?
</Text>
```

**Breakdown**:
- `text-[22px]` - 22px font size (iOS title2)
- `font-semibold` - 600 weight
- `text-gray-900` - Dark gray (#212121)
- `text-center` - Center aligned
- `mb-6` - 24px margin bottom
- `leading-7` - 28px line height

---

### Primary Button ("Yes, I Read Today")
```tsx
<Pressable
  onPress={handleVerify}
  className="bg-[#2196F3] active:bg-[#1E88E5] py-4 px-6 rounded-xl mb-3 active:opacity-90"
>
  <Text className="text-white text-[17px] font-semibold text-center">
    ✅ Yes, I Read Today
  </Text>
</Pressable>
```

**Breakdown**:
- `bg-[#2196F3]` - Primary blue (iOS blue)
- `active:bg-[#1E88E5]` - Darker blue on press
- `py-4` - 16px vertical padding
- `px-6` - 24px horizontal padding
- `rounded-xl` - 12px border radius
- `mb-3` - 12px margin bottom
- `active:opacity-90` - Subtle press feedback
- Text: `text-white text-[17px] font-semibold text-center`

---

### Secondary Button ("Not Yet")
```tsx
<Pressable
  onPress={onClose}
  className="bg-gray-100 active:bg-gray-200 py-4 px-6 rounded-xl active:opacity-90"
>
  <Text className="text-gray-700 text-[17px] font-medium text-center">
    Not Yet
  </Text>
</Pressable>
```

**Breakdown**:
- `bg-gray-100` - Light gray (#F5F5F5)
- `active:bg-gray-200` - Slightly darker on press
- Same padding/radius as primary
- Text: `text-gray-700` (#616161), `font-medium` (500 weight)

---

### Streak Context Text
```tsx
<Text className="text-[15px] text-gray-500 text-center mt-4">
  Current Streak: {currentStreak} {currentStreak === 1 ? 'day' : 'days'} 🔥
</Text>
```

**Breakdown**:
- `text-[15px]` - 15px font size (iOS subheadline)
- `text-gray-500` - Medium gray (#9E9E9E)
- `text-center` - Center aligned
- `mt-4` - 16px margin top

---

## Dashboard Components

### Greeting Component
```tsx
<Text className="text-[28px] font-bold text-gray-900 mb-2">
  Good {timeOfDay}! 👋
</Text>
<Text className="text-[17px] text-gray-600 mb-6">
  {user?.displayName || 'Friend'}
</Text>
```

**Breakdown**:
- `text-[28px]` - 28px heading (iOS large title)
- `font-bold` - 700 weight
- `text-gray-900` - Dark text
- Subtext: `text-[17px] text-gray-600`

---

### Streak Card (Large Display)
```tsx
<View className="bg-white rounded-2xl p-6 mb-4 shadow-md">
  <Text className="text-[15px] text-gray-600 text-center mb-2 uppercase tracking-wide">
    Current Streak
  </Text>
  <Text className="text-[48px] font-bold text-center mb-2">
    {currentStreak}
  </Text>
  <View className="flex-row justify-center mb-2">
    {/* Flame icons - repeat based on streak */}
    <Text className="text-[32px]">🔥🔥🔥🔥</Text>
  </View>
  <Text className="text-[13px] text-gray-500 text-center">
    {currentStreak === 1 ? 'day' : 'days'} in a row
  </Text>
</View>
```

**Breakdown**:
- Card: `bg-white rounded-2xl p-6 shadow-md`
- Label: `text-[15px] text-gray-600 uppercase tracking-wide`
- Streak number: `text-[48px] font-bold`
- Flames: `text-[32px]` emoji row
- Context: `text-[13px] text-gray-500`

---

### Verify Button (Dashboard CTA)
```tsx
<Pressable
  onPress={openVerificationModal}
  className="bg-[#2196F3] active:bg-[#1E88E5] py-5 px-6 rounded-2xl mb-4 shadow-lg active:opacity-95"
>
  <Text className="text-white text-[19px] font-bold text-center">
    ✅ Verify Bible Reading
  </Text>
  <Text className="text-white/80 text-[13px] text-center mt-1">
    Tap to verify today's reading
  </Text>
</Pressable>
```

**Breakdown**:
- Larger than modal button: `py-5` (20px vertical)
- `rounded-2xl` - More prominent 24px radius
- `shadow-lg` - Larger shadow for emphasis
- Two-line text: heading + subtitle

---

### Quick Stats Row
```tsx
<View className="flex-row justify-between px-2">
  {/* Total Days */}
  <View className="items-center">
    <Text className="text-[24px] font-bold text-gray-900">
      {totalVerifications}
    </Text>
    <Text className="text-[13px] text-gray-600">
      Total Days
    </Text>
  </View>

  {/* Points */}
  <View className="items-center">
    <Text className="text-[24px] font-bold text-gray-900">
      {points}
    </Text>
    <Text className="text-[13px] text-gray-600">
      Points
    </Text>
  </View>

  {/* Rank */}
  <View className="items-center">
    <Text className="text-[24px] font-bold text-gray-900">
      #{rank || '---'}
    </Text>
    <Text className="text-[13px] text-gray-600">
      Global Rank
    </Text>
  </View>
</View>
```

**Breakdown**:
- Container: `flex-row justify-between px-2`
- Each stat: `items-center` (centered column)
- Numbers: `text-[24px] font-bold text-gray-900`
- Labels: `text-[13px] text-gray-600`

---

## Color Reference (From DESIGN_SYSTEM.md)

```tsx
// Primary Colors
primary-500: '#2196F3'  // iOS Blue
primary-600: '#1E88E5'  // Darker blue (active state)

// Accent
accent-500: '#FFC107'   // Achievement Gold

// Success
success: '#4CAF50'      // Growth Green

// Grays
gray-50: '#FAFAFA'      // Lightest
gray-100: '#F5F5F5'     // Light background
gray-200: '#EEEEEE'     // Borders
gray-500: '#9E9E9E'     // Secondary text
gray-600: '#757575'     // Body text
gray-700: '#616161'     // Dark secondary
gray-900: '#212121'     // Primary text

// Utility
white: '#FFFFFF'
black: '#000000'
```

---

## Shadow Reference

```tsx
// NativeWind shadow classes
shadow-sm   // Small shadow (cards)
shadow-md   // Medium shadow (elevated cards)
shadow-lg   // Large shadow (buttons, important elements)
shadow-xl   // Extra large shadow
shadow-2xl  // Modal backdrop shadow
```

---

## Usage Notes

1. **Direct className support**: NativeWind v4.2+ supports className directly on React Native components (no `styled()` wrapper needed)

2. **Active states**: Use `active:` prefix for press feedback (works with Pressable)

3. **Custom values**: Use bracket notation for exact values: `text-[22px]`, `bg-[#2196F3]`

4. **Opacity modifiers**: Use `/` for opacity: `bg-black/50`, `text-white/80`

5. **Typography scale**: Follow iOS typography (17px body, 22px title2, 28px large title)

6. **Touch targets**: All buttons maintain 44px minimum height (iOS guideline)

---

**Status**: ✅ Ready for Day 2 Implementation
**Next**: Alex uses these exact classNames in dashboard + modal components
