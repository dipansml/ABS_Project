import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../Utils/dimensions';

interface Props {
  size?: number; // overall diameter of the circle
  dotCount?: number; // how many dots
  dotSize?: number; // diameter of each dot
  color?: string;
}

function CircularDotLoader({
  size = 50,
  dotCount = 8,
  dotSize = 8,
  color = colors.primaryBlue,
}: Props) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const radius = size / 2 - dotSize / 2;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.rotator,
          { width: size, height: size, transform: [{ rotate: spin }] },
        ]}
      >
        {Array.from({ length: dotCount }).map((_, i) => {
          const angle = (2 * Math.PI * i) / dotCount;
          const x = radius * Math.cos(angle) + (size / 2 - dotSize / 2);
          const y = radius * Math.sin(angle) + (size / 2 - dotSize / 2);
          const opacity = 0.25 + (0.75 * i) / (dotCount - 1);

          return (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: color,
                  left: x,
                  top: y,
                  opacity,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotator: {
    position: 'absolute',
  },
  dot: {
    position: 'absolute',
  },
});

export default CircularDotLoader;