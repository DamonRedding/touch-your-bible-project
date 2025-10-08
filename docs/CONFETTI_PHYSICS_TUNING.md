# Confetti Animation Physics Tuning Guide

**Owner**: Taylor (Visual Designer), Alex (Lead Engineer)
**Created**: October 7, 2025
**Purpose**: Document spring physics parameters for easy Day 3 testing adjustments

---

## Current Configuration

Located in [src/components/Confetti.tsx](../src/components/Confetti.tsx):

```typescript
const SPRING_PHYSICS = {
  damping: 10,     // Default: 10
  mass: 1,         // Default: 1
  stiffness: 50,   // Default: 100 (we use 50)
};
```

---

## Physics Parameters Explained

### 1. **Damping** (How quickly particles settle)
- **Default**: 10
- **Range**: 1-50
- **Effect**: Higher values = faster settling, less oscillation

| Value | Behavior | Use Case |
|-------|----------|----------|
| 5-10 | Natural drift, some wobble | Realistic confetti (current) |
| 15-20 | Smooth drift, minimal wobble | Polished feel |
| 25-30 | Quick settle, no wobble | UI element animations |

**Day 3 Testing**: If particles wobble too much, try `damping: 15`

---

### 2. **Mass** (Weight of particles)
- **Default**: 1
- **Range**: 0.1-10
- **Effect**: Lower mass = faster, lighter movement

| Value | Behavior | Use Case |
|-------|----------|----------|
| 0.3-0.5 | Very light, floaty | Paper confetti |
| 1.0 | Standard weight | Current (balanced) |
| 2-5 | Heavy, slow | Large/metallic confetti |

**Day 3 Testing**: For lighter feel, try `mass: 0.5`

---

### 3. **Stiffness** (Bounciness)
- **Default**: 100
- **Range**: 10-200
- **Effect**: Higher stiffness = more spring/bounce

| Value | Behavior | Use Case |
|-------|----------|----------|
| 10-30 | Minimal spring | Smooth, natural drift |
| 50 | Moderate spring | Current (balanced) |
| 100-150 | Bouncy | Playful animations |

**Day 3 Testing**: Current value (50) should be optimal for confetti

---

## Context7 Validation (react-native-reanimated)

**Reference**: `/software-mansion/react-native-reanimated` documentation

### Common Presets

**UI Element Animations** (entering/exiting screens):
```typescript
{
  damping: 30,    // High - quick settling
  mass: 5,        // Heavy - weighted movement
  stiffness: 10,  // Low - minimal bounce
}
```

**Confetti/Particles** (our use case):
```typescript
{
  damping: 10,     // Natural drift
  mass: 1,         // Light weight
  stiffness: 50,   // Subtle spring
}
```

---

## Day 3 Testing Scenarios

### Scenario 1: Particles Wobble Too Much
**Symptom**: Horizontal drift has visible oscillation
**Fix**: Increase damping
```typescript
damping: 15  // Try this first
damping: 20  // If still wobbly
```

---

### Scenario 2: Particles Feel Too Heavy
**Symptom**: Slow, sluggish movement
**Fix**: Decrease mass
```typescript
mass: 0.5   // Lighter, floatier
mass: 0.3   // Very light (paper-like)
```

---

### Scenario 3: Particles Too Bouncy
**Symptom**: Spring effect too pronounced
**Fix**: Decrease stiffness
```typescript
stiffness: 30  // Less bouncy
stiffness: 20  // Minimal spring
```

---

### Scenario 4: Animation Feels Slow
**Symptom**: Particles take too long to settle
**Fix**: Increase stiffness OR decrease mass
```typescript
stiffness: 70  // Faster response
// OR
mass: 0.5      // Lighter = faster
```

---

## Recommended Testing Order (Day 3)

1. **Test Default** (current settings)
   - Run verification → observe confetti
   - Note: oscillation, speed, feel

2. **If Needed: Adjust Damping First**
   ```typescript
   damping: 15  // Reduces wobble
   ```

3. **Then: Fine-Tune Mass**
   ```typescript
   mass: 0.7  // Slightly lighter
   ```

4. **Finally: Stiffness (rarely needed)**
   ```typescript
   stiffness: 40  // Minor adjustment
   ```

---

## Quick Reference Table

| Desired Effect | Parameter to Adjust | Direction |
|----------------|---------------------|-----------|
| Less wobble | ↑ damping | 10 → 15 → 20 |
| Lighter feel | ↓ mass | 1 → 0.7 → 0.5 |
| Less bouncy | ↓ stiffness | 50 → 40 → 30 |
| Faster settling | ↑ damping | 10 → 15 → 20 |
| Slower animation | ↑ mass | 1 → 1.5 → 2 |

---

## Implementation Notes

### Where to Change Values

**File**: `src/components/Confetti.tsx`
**Lines**: 30-34

```typescript
const SPRING_PHYSICS = {
  damping: 10,     // ← Change here
  mass: 1,         // ← Change here
  stiffness: 50,   // ← Change here
};
```

### Testing Workflow

1. Edit `SPRING_PHYSICS` constants
2. Save file (hot reload will update)
3. Trigger verification modal
4. Tap "Yes, I Read Today"
5. Observe confetti behavior
6. Iterate until satisfied

---

## Team Sign-Off (Day 2)

**Taylor (Visual Designer)**:
> "Current physics (damping: 10, mass: 1, stiffness: 50) are theoretically sound for confetti. Will validate during Day 3 demo."

**Marcus (Architect)**:
> "Context7 validation confirms our approach. Physics constants are appropriately documented for rapid tuning."

**Alex (Lead Engineer)**:
> "Constants extracted for easy Day 3 testing. Change one line, hot reload, instant feedback."

**Jordan (UX Designer)**:
> "Plan: Test default first. Only adjust if users report 'wobbly' or 'too slow' during demo."

---

## Decision Log

**October 7, 2025 - Initial Configuration**:
- ✅ Set damping: 10 (default, natural drift)
- ✅ Set mass: 1 (default, balanced weight)
- ✅ Set stiffness: 50 (reduced from default 100 for less bounce)
- ✅ Documented tuning guide for Day 3
- 🧪 Deferred final tuning to Day 3 device testing

**Confidence**: 85% current settings will be optimal, 15% might need damping → 15

---

**Status**: ✅ Documented and Ready for Day 3 Testing
**Next**: Day 3 demo → observe → adjust if needed (1-2 minute iteration cycle)

**Last Updated**: October 7, 2025 @ 21:30 PST
