/**
 * NativeWindUI Text Component
 * Based on: https://nativewindui.com/component/text
 * Provides iOS-native typography variants
 */

import * as React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '../../lib/cn';

type TextVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption1'
  | 'caption2';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
}

const VARIANT_CLASSES: Record<TextVariant, string> = {
  largeTitle: 'text-[34px] font-bold leading-[41px]',
  title1: 'text-[28px] font-bold leading-[34px]',
  title2: 'text-[22px] font-bold leading-[28px]',
  title3: 'text-[20px] font-semibold leading-[25px]',
  headline: 'text-[17px] font-semibold leading-[22px]',
  body: 'text-[17px] leading-[22px]',
  callout: 'text-[16px] leading-[21px]',
  subhead: 'text-[15px] leading-[20px]',
  footnote: 'text-[13px] leading-[18px]',
  caption1: 'text-[12px] leading-[16px]',
  caption2: 'text-[11px] leading-[13px]',
};

const COLOR_CLASSES: Record<TextColor, string> = {
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  tertiary: 'text-muted-foreground/70',
  quaternary: 'text-muted-foreground/50',
};

export const Text = React.forwardRef<RNText, TextProps>(
  ({ variant = 'body', color = 'primary', className, ...props }, ref) => {
    return (
      <RNText
        ref={ref}
        className={cn(
          VARIANT_CLASSES[variant],
          COLOR_CLASSES[color],
          className
        )}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';
