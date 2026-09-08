import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated,
         Easing,
         Modal,
        StyleSheet,
        Text,
        View, } from 'react-native';
import { colors, spacing } from '../Utils/dimensions';



interface CustomLoaderProps {
  visible: boolean;
  label?: string;
}

// One full spin duration for the dot ring. Bump this up to spin slower.
const SPIN_DURATION = 1100;
const SPIN_SIZE = 46;
const SPIN_COLOR = '#1E3A8A';


// Dot-ring geometry
const LOADER_DOT_COUNT = 8;
const LOADER_DOT_SIZE = 7;
const LOADER_RING_RADIUS = (SPIN_SIZE - LOADER_DOT_SIZE) / 2;

const CustomLoader: React.FC<CustomLoaderProps> = ({
  visible,
  label = 'Fetching machine data',
}) => {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      // API call just fired -> fade/scale the card in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous ring rotation — the whole dot ring spins for exactly
      // as long as the request is pending, since this loop only ever
      // gets stopped (below, in the `else` branch) once `visible`
      // flips to false.
      spinValue.setValue(0);
      spinLoopRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: SPIN_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      spinLoopRef.current.start();
    } else {
      // Response received (success or error) -> stop spinning, fade out
      spinLoopRef.current?.stop();
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      cardScale.setValue(0.88);
    }

    return () => {
      spinLoopRef.current?.stop();
    };
  }, [visible, backdropOpacity, cardScale, cardOpacity, spinValue]);

  if (!visible) return null;

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Pre-compute each dot's fixed position around the ring, plus a
  // fading opacity/scale so the trailing dots read as a "comet tail"
  // as the whole group rotates.
  const dots = Array.from({ length: LOADER_DOT_COUNT }).map((_, i) => {
    const angle = (i / LOADER_DOT_COUNT) * 2 * Math.PI;
    const x = LOADER_RING_RADIUS * Math.cos(angle);
    const y = LOADER_RING_RADIUS * Math.sin(angle);
    const fade = i / LOADER_DOT_COUNT; // 0 (head, brightest) -> ~0.87 (tail, dimmest)
    return {
      key: `loader-dot-${i}`,
      left: SPIN_SIZE / 2 + x - LOADER_DOT_SIZE / 2,
      top: SPIN_SIZE / 2 + y - LOADER_DOT_SIZE / 2,
      opacity: 1 - fade * 0.85,
      scale: 1 - fade * 0.45,
    };
  });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.loaderOverlay, { opacity: backdropOpacity }]}>
        <Animated.View
          style={[
            styles.loaderCard,
            { opacity: cardOpacity, transform: [{ scale: cardScale }] },
          ]}
        >
          <Animated.View
            style={[
              styles.loaderSpinnerWrap,
              { width: SPIN_SIZE, height: SPIN_SIZE, transform: [{ rotate }] },
            ]}
          >
            {dots.map((dot) => (
              <View
                key={dot.key}
                style={[
                  styles.loaderDot,
                  {
                    left: dot.left,
                    top: dot.top,
                    opacity: dot.opacity,
                    transform: [{ scale: dot.scale }],
                  },
                ]}
              />
            ))}
          </Animated.View>
          <Text style={styles.loaderLabel}>{label}</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CustomLoader;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  errorText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
    fontWeight: '600',
  },

  loaderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,18,42,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 30,
    alignItems: 'center',
    minWidth: 172,
    shadowColor: '#0F1E4D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  loaderSpinnerWrap: {
    marginBottom: 12,
    position: 'relative',
  },
  loaderDot: {
    position: 'absolute',
    width: LOADER_DOT_SIZE,
    height: LOADER_DOT_SIZE,
    borderRadius: LOADER_DOT_SIZE / 2,
    backgroundColor: SPIN_COLOR,
  },
  loaderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B4A6B',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});