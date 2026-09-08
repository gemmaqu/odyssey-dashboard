import React, { useEffect, useRef } from 'react';
import { Animated, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, radius = 6, style }: SkeletonProps) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.surfaceHover,
          opacity,
        } as Animated.WithAnimatedObject<ViewStyle>,
        style,
      ]}
    />
  );
}

/** A stack of skeleton lines, the last one shortened. */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View style={{ gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height={12} />
      ))}
    </View>
  );
}
