/**
 * NativeWindUI List Component
 * Based on: https://nativewindui.com/component/list
 * High-performance list with FlashList
 */

import * as React from 'react';
import { FlashList, type FlashListProps, type ListRenderItemInfo } from '@shopify/flash-list';
import { View, Pressable, type PressableProps, Platform } from 'react-native';
import { Text } from './Text';
import { cn } from '../../lib/cn';
import { cssInterop } from 'nativewind';

// Apply NativeWind styling to FlashList
cssInterop(FlashList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export interface ListDataItem {
  id: string;
  title: string;
  subTitle?: string;
}

type ListVariant = 'insets' | 'full-width';

interface ListProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
  variant?: ListVariant;
  sectionHeaderAsGap?: boolean;
  rootClassName?: string;
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement | null;
}

export const ESTIMATED_ITEM_HEIGHT = {
  titleOnly: 44,
  withSubTitle: 60,
};

export function List<T>({
  variant = 'insets',
  sectionHeaderAsGap = false,
  rootClassName,
  contentContainerClassName,
  className,
  ...props
}: ListProps<T>) {
  return (
    <View className={cn('flex-1', rootClassName)}>
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        className={cn(className)}
        contentContainerClassName={cn(
          variant === 'insets' && 'px-4',
          contentContainerClassName
        )}
        {...props}
      />
    </View>
  );
}

interface ListItemProps extends PressableProps {
  item: ListDataItem;
  isFirstInSection?: boolean;
  isLastInSection?: boolean;
  index: number;
  variant?: ListVariant;
  titleClassName?: string;
  subTitleClassName?: string;
  textNumberOfLines?: number;
  subTitleNumberOfLines?: number;
  removeSeparator?: boolean;
  leftView?: React.ReactNode;
  rightView?: React.ReactNode;
}

export const ListItem = React.forwardRef<View, ListItemProps>(
  (
    {
      item,
      isFirstInSection = false,
      isLastInSection = false,
      variant = 'insets',
      className,
      titleClassName,
      subTitleClassName,
      textNumberOfLines = 1,
      subTitleNumberOfLines = 1,
      removeSeparator = false,
      leftView,
      rightView,
      ...props
    },
    ref
  ) => {
    return (
      <Pressable
        ref={ref as any}
        className={cn(
          'flex-row items-center bg-card',
          variant === 'insets' && 'rounded-xl px-4 py-3',
          variant === 'full-width' && 'px-4 py-3',
          isFirstInSection && variant === 'insets' && 'rounded-t-xl',
          isLastInSection && variant === 'insets' && 'rounded-b-xl',
          className
        )}
        {...props}
      >
        {leftView}

        <View className="flex-1">
          <Text
            variant="callout"
            className={cn('text-foreground', titleClassName)}
            numberOfLines={textNumberOfLines}
          >
            {item.title}
          </Text>

          {item.subTitle && (
            <Text
              variant="footnote"
              color="secondary"
              className={cn(subTitleClassName)}
              numberOfLines={subTitleNumberOfLines}
            >
              {item.subTitle}
            </Text>
          )}
        </View>

        {rightView}
      </Pressable>
    );
  }
);

ListItem.displayName = 'ListItem';

interface ListSectionHeaderProps extends ListRenderItemInfo<string> {}

export function ListSectionHeader({ item }: ListSectionHeaderProps) {
  return (
    <View className="px-4 py-2">
      <Text variant="caption1" color="secondary" className="uppercase tracking-wide">
        {item}
      </Text>
    </View>
  );
}

export { List };
export type { ListProps, ListDataItem };
