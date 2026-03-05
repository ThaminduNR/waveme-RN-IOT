import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const PILL_HEIGHT = 54;

export type CommonButtonVariant = 'gradient' | 'outline';

type CommonButtonProps = {
  title: string;
  onPress: () => void;
  variant: CommonButtonVariant;
};

const CommonButton = ({ title, onPress, variant }: CommonButtonProps) => {
  const { width } = useWindowDimensions();
  const buttonWidth = width - 48; // 24 padding each side
  const strokeWidth = 2;
  const rx = PILL_HEIGHT / 2;

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.touchable, { width: buttonWidth }]}
      >
        <View style={[styles.wrapper, { width: buttonWidth, height: PILL_HEIGHT }]}>
          <Svg
            style={StyleSheet.absoluteFill}
            width={buttonWidth}
            height={PILL_HEIGHT}
          >
            <Defs>
              <LinearGradient id="borderGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#F6339A" />
                <Stop offset="1" stopColor="#E91E63" />
              </LinearGradient>
            </Defs>
            <Rect
              x={strokeWidth / 2}
              y={strokeWidth / 2}
              width={buttonWidth - strokeWidth}
              height={PILL_HEIGHT - strokeWidth}
              rx={rx}
              ry={rx}
              fill="none"
              stroke="url(#borderGrad)"
              strokeWidth={strokeWidth}
            />
          </Svg>
          <View style={[styles.inner, { borderRadius: rx - strokeWidth }]}>
            <Text style={styles.label}>{title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.touchable, { width: buttonWidth }]}
    >
      <View style={[styles.outlineButton, { width: buttonWidth, height: PILL_HEIGHT, borderRadius: rx }]}>
        <Text style={styles.label}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CommonButton;

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 2,
    bottom: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
