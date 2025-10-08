/**
 * NativeWindUI Card Component
 * Based on: https://nativewindui.com/component/card
 * Beautiful card layouts with gradient support
 */

import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { Text } from './Text';
import { cn } from '../../lib/cn';

interface CardProps extends ViewProps {
  rootClassName?: string;
}

export const Card = React.forwardRef<View, CardProps>(
  ({ rootClassName, className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          'rounded-2xl bg-card border border-border shadow-sm shadow-black/10',
          rootClassName
        )}
        {...props}
      >
        <View className={cn('overflow-hidden rounded-2xl', className)}>
          {children}
        </View>
      </View>
    );
  }
);

Card.displayName = 'Card';

export const CardContent = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => {
    return <View ref={ref} className={cn('p-5', className)} {...props} />;
  }
);

CardContent.displayName = 'CardContent';

export const CardTitle = React.forwardRef<any, React.ComponentProps<typeof Text>>(
  ({ className, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        variant="headline"
        className={cn('font-bold', className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

export const CardSubtitle = React.forwardRef<any, React.ComponentProps<typeof Text>>(
  ({ className, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        variant="subhead"
        color="secondary"
        className={cn(className)}
        {...props}
      />
    );
  }
);

CardSubtitle.displayName = 'CardSubtitle';

export const CardDescription = React.forwardRef<any, React.ComponentProps<typeof Text>>(
  ({ className, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        variant="footnote"
        color="secondary"
        className={cn(className)}
        {...props}
      />
    );
  }
);

CardDescription.displayName = 'CardDescription';

export const CardFooter = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('px-5 pb-5 pt-0', className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';
