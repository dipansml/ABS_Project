

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';

import { SignalStatus } from '../Types/machine';
import { colors } from '../Utils/dimensions';

type Props = {
  status: SignalStatus;
  size?: number;
};

const SIGNAL_COLORS: Record<SignalStatus, string> = {
  green: '#00FF33',
  yellow: '#FFD500',
  red: '#FF2020',
};

function SignalIndicator({ status, size = 46 }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const activeColor = SIGNAL_COLORS[status];

  useEffect(() => {
    // Stop previous animation
    pulse.stopAnimation();
    scale.stopAnimation();

    // GREEN = fixed bright light
    if (status === 'green') {
      pulse.setValue(1);
      scale.setValue(1);
      return;
    }

    // RED + YELLOW = glowing/pulsing light
    pulse.setValue(0.75);
    scale.setValue(1);

    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0.75,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.05,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [status]);

  const lightSize = size * 0.90;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size * 1.75,
          borderRadius: size * 0.18,
        },
      ]}
    >
      {/* Top cap */}
      {/* <View
        style={[
          styles.topCap,
          {
            width: size * 0.95,
            height: size * 0.18,
            borderRadius: size * 0.15,
          },
        ]}
      /> */}

      {/* Light */}
      <Animated.View
        style={[
          styles.lightWrapper,
          {
            width: lightSize,
            height: lightSize,
            borderRadius: lightSize / 2,
            transform: [{ scale }],
            opacity: pulse,
          },
        ]}
      >
        {/* Outer Glow */}
        <View
          style={[
            styles.glowOuter,
            {
              width: lightSize * 1.35,
              height: lightSize * 1.35,
              borderRadius: lightSize,
              backgroundColor: activeColor,
              shadowColor: activeColor,
            },
          ]}
        />

        {/* Middle Glow */}
        <View
          style={[
            styles.glowMiddle,
            {
              width: lightSize * 1.12,
              height: lightSize * 1.12,
              borderRadius: lightSize,
              backgroundColor: activeColor,
              shadowColor: activeColor,
            },
          ]}
        />

        {/* Main Light */}
        <View
          style={[
            styles.light,
            {
              width: lightSize,
              height: lightSize,
              borderRadius: lightSize / 2,
              backgroundColor: activeColor,
              shadowColor: activeColor,
            },
          ]}
        >
          {/* Highlight */}
          {/* <View
            style={[
              styles.highlight,
              {
                width: lightSize * 0.45,
                height: lightSize * 0.25,
                borderRadius: lightSize,
              },
            ]}
          /> */}
        </View>
      </Animated.View>

      {/* Bottom cap */}
      {/* <View
        style={[
          styles.bottomCap,
          {
            width: size * 0.95,
            height: size * 0.18,
            borderRadius: size * 0.15,
          },
        ]}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,

    shadowColor: colors.white,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },

  topCap: {
    position: 'absolute',
    top: -2,
    backgroundColor: colors.white,
    alignSelf: 'center',
    elevation: 5,
  },

  bottomCap: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: colors.white,
    alignSelf: 'center',
    elevation: 5,
  },

  lightWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  glowOuter: {
    position: 'absolute',
    opacity: 0.18,

    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 18,

    elevation: 12,
  },

  glowMiddle: {
    position: 'absolute',
    opacity: 0.35,

    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 12,

    elevation: 10,
  },

  light: {
    alignItems: 'center',
    justifyContent: 'center',

    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 10,

    elevation: 15,
  },

  highlight: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    backgroundColor: 'rgba(255,255,255,0.35)',

    transform: [
      {
        rotate: '-25deg',
      },
    ],
  },
});

export default SignalIndicator;