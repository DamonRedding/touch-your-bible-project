import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ReactNode } from 'react';

interface ButtonProps extends TouchableOpacityProps {
  children: ReactNode;
  className?: string;
  textClass?: string;
}

export function Button({ children, className = '', textClass = '', ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      className={`rounded-lg py-3 px-4 items-center justify-center ${className}`}
      {...props}
    >
      <Text className={`text-base font-medium ${textClass}`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
} 