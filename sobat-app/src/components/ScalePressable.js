import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

export default function ScalePressable({
  children,
  style,
  onPress,
  disabled = false,
  accessibilityLabel,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) => {
    Animated.timing(scale, {
      toValue: value,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
