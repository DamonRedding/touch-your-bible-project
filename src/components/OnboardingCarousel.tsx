// Onboarding Carousel Component
// Beautiful iOS-native onboarding experience
// Owner: Jordan (UX Designer), Taylor (Visual Designer)
// Created: October 8, 2025

import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Icon } from '@roninoss/icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  backgroundColor: string;
}

interface OnboardingCarouselProps {
  slides: OnboardingSlide[];
  onComplete: () => void;
}

export function OnboardingCarousel({ slides, onComplete }: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);

    if (index !== currentIndex) {
      setCurrentIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View className="flex-1 bg-white">
      {/* Skip Button */}
      {!isLastSlide && (
        <View className="absolute top-12 right-6 z-10">
          <Pressable onPress={handleSkip} className="py-2 px-4">
            <Text className="text-[17px] text-gray-600 font-medium">Skip</Text>
          </Pressable>
        </View>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={{ width: SCREEN_WIDTH, backgroundColor: slide.backgroundColor }}
            className="flex-1"
          >
            <View className="flex-1 justify-center items-center px-8">
              {/* Icon */}
              <View className="mb-8">
                <View className="bg-white/20 rounded-full p-8">
                  <Icon name={slide.icon as any} size={80} color="#fff" />
                </View>
              </View>

              {/* Title */}
              <Text className="text-[32px] font-bold text-white text-center mb-4 leading-tight">
                {slide.title}
              </Text>

              {/* Description */}
              <Text className="text-[17px] text-white/90 text-center leading-relaxed px-4">
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls */}
      <View className="absolute bottom-0 left-0 right-0 pb-8 px-6 bg-transparent">
        {/* Page Indicators */}
        <View className="flex-row justify-center mb-6">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <Pressable
          onPress={handleNext}
          className="bg-white active:opacity-80 py-4 px-6 rounded-xl shadow-lg"
        >
          <Text className="text-[#2196F3] text-[17px] font-bold text-center">
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Default onboarding slides for Touch Your Bible
export const DEFAULT_ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    icon: 'book-open',
    title: 'Welcome to Touch Your Bible',
    description: 'Build a consistent Bible reading habit and grow spiritually, one day at a time.',
    backgroundColor: '#2196F3',
  },
  {
    id: 'verify',
    icon: 'camera',
    title: 'Verify Your Reading',
    description: 'Take a photo of your Bible to verify your daily reading and maintain your streak.',
    backgroundColor: '#4CAF50',
  },
  {
    id: 'streak',
    icon: 'fire',
    title: 'Build Your Streak',
    description: 'Read every day to build your streak. The longer your streak, the stronger your habit!',
    backgroundColor: '#FF9800',
  },
  {
    id: 'compete',
    icon: 'trophy',
    title: 'Compete with Friends',
    description: 'Invite friends and compete on the leaderboard. Encourage each other to stay consistent!',
    backgroundColor: '#9C27B0',
  },
];
