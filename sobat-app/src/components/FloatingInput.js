import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radius } from '../theme/tokens';

export default function FloatingInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const active = useMemo(() => focused || Boolean(value), [focused, value]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [active, anim]);

  const labelStyle = {
    top: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 10],
    }),
    fontSize: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.textMuted, colors.textSecondary],
    }),
  };

  return (
    <View style={[styles.wrap, active ? styles.wrapActive : null]}>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#EEF3F2',
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    minHeight: 64,
    justifyContent: 'flex-end',
  },
  wrapActive: {
    backgroundColor: '#E7EFEE',
  },
  label: {
    position: 'absolute',
    left: 16,
    fontFamily: fonts.medium,
  },
  input: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
});
