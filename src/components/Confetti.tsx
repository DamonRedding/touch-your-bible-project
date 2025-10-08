// Confetti Animation Component
// Uses react-native-reanimated (already installed)
// Owner: Taylor (Visual Designer)
// Created: October 7, 2025

import React, { useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Confetti colors from DESIGN_SYSTEM.md
const CONFETTI_COLORS = [
  '#2196F3', // primary-500 (blue)
  '#FFC107', // accent-500 (gold)
  '#4CAF50', // success (green)
  '#9C27B0', // secondary-500 (purple)
];

interface ConfettiParticleProps {
  delay: number;
  color: string;
  startX: number;
  onComplete?: () => void;
}

// Single confetti particle component
const ConfettiParticle: React.FC<ConfettiParticleProps> = ({
  delay,
  color,
  startX,
  onComplete,
}) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Randomize horizontal drift
    const drift = (Math.random() - 0.5) * 200;
    const rotation = Math.random() * 720 - 360; // Random spin
    const fallDistance = SCREEN_HEIGHT + 100;

    // Animate particle falling with physics
    translateY.value = withDelay(
      delay,
      withTiming(
        fallDistance,
        {
          duration: 2000 + Math.random() * 500, // Randomize duration
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        }
      )
    );

    translateX.value = withDelay(
      delay,
      withSpring(drift, {
        damping: 10,
        mass: 1,
        stiffness: 50,
      })
    );

    rotate.value = withDelay(
      delay,
      withTiming(rotation, {
        duration: 2000,
        easing: Easing.linear,
      })
    );

    // Fade out near the bottom
    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, {
        duration: 500,
      })
    );

    // Slight scale variation for depth
    scale.value = withDelay(
      delay,
      withSpring(0.8 + Math.random() * 0.4, {
        damping: 5,
      })
    );
  }, [delay, translateY, translateX, rotate, opacity, scale, onComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: startX + translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

// Main confetti component
interface ConfettiProps {
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({
  particleCount = 200,
  duration = 2000,
  onComplete,
}) => {
  const [particles, setParticles] = React.useState<
    Array<{ id: number; color: string; delay: number; startX: number }>
  >([]);
  const [completedCount, setCompletedCount] = React.useState(0);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 100, // Stagger within first 100ms
      startX: SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100, // Start near center
    }));

    setParticles(newParticles);
  }, [particleCount]);

  useEffect(() => {
    // Call onComplete when all particles finish
    if (completedCount === particleCount && onComplete) {
      onComplete();
    }
  }, [completedCount, particleCount, onComplete]);

  const handleParticleComplete = () => {
    setCompletedCount((prev) => prev + 1);
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          delay={particle.delay}
          color={particle.color}
          startX={particle.startX}
          onComplete={handleParticleComplete}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2, // Slight rounding (confetti pieces are usually rectangular)
  },
});
