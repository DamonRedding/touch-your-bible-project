/**
 * NativeWindUI Button Component
 * Based on: https://nativewindui.com/component/button
 * iOS-native button styles with variants
 */

import * as React from 'react';
import {
  Pressable,
  type PressableProps,
  Platform,
  View,
} from 'react-native';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'tonal' | 'plain';
type ButtonSize = 'none' | 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  androidRootClassName?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:opacity-80',
  secondary: 'bg-secondary active:opacity-80',
  tonal: 'bg-accent active:opacity-80',
  plain: 'bg-transparent active:opacity-60',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  none: '',
  sm: 'px-4 py-2',
  md: 'px-6 py-3',
  lg: 'px-8 py-4',
  icon: 'p-3',
};

export const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      className,
      androidRootClassName,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const content = (
      <Pressable
        ref={ref as any}
        disabled={disabled}
        className={cn(
          'flex-row items-center justify-center gap-2 rounded-xl',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          disabled && 'opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </Pressable>
    );

    // Android: Wrap in container for ripple effect overflow
    if (Platform.OS === 'android') {
      return (
        <View className={cn('overflow-hidden rounded-xl', androidRootClassName)}>
          {content}
        </View>
      );
    }

    return content;
  }
);

Button.displayName = 'Button';
