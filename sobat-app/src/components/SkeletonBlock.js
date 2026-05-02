import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default function SkeletonBlock({ style }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.75,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return <Animated.View style={[styles.base, style, { opacity }]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#E4E9EE',
    borderRadius: 12,
  },
});
