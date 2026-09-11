import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Types/Navigation';
 
const SPLASH_BACKGROUND = require('../Images/splash-background.png');
const SPLASH_ARTWORK = require('../Images/splash-artwork.png');
const ANIL_BALAJI_LOGO = require('../Images/anil-balaji-logo.png');
 
const EASE = Easing.out(Easing.cubic);
 
type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;
 
const TIMINGS = {
  artworkDelay: 2000,
  artworkDuration: 850,
  gapBeforeLogo: 450,
  logoDuration: 750,
  holdDuration: 1500,
  transitionDuration: 500,
};
 
function SplashScreen() {
  const navigation = useNavigation<SplashNavProp>();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const logoSize = Math.min(screenWidth * 0.615, 245);
  const logoTop = screenHeight * 0.12;
  const logoLeft = screenWidth * 0.5 - logoSize * 0.5;
 
  const artworkOpacity = useRef(new Animated.Value(0)).current;
  const artworkScale = useRef(new Animated.Value(1.015)).current;
  const artworkTranslateY = useRef(new Animated.Value(12)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.96)).current;
  const logoTranslateY = useRef(new Animated.Value(6)).current;
 
  const navigationTriggered = useRef(false);
 
  useEffect(() => {
    const artworkEntrance = Animated.parallel([
      Animated.timing(artworkOpacity, {
        toValue: 1,
        duration: TIMINGS.artworkDuration,
        easing: EASE,
        useNativeDriver: true,
      }),
      Animated.timing(artworkScale, {
        toValue: 1,
        duration: TIMINGS.artworkDuration,
        easing: EASE,
        useNativeDriver: true,
      }),
      Animated.timing(artworkTranslateY, {
        toValue: 0,
        duration: TIMINGS.artworkDuration,
        easing: EASE,
        useNativeDriver: true,
      }),
    ]);
 
    const logoEntrance = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: TIMINGS.logoDuration,
        easing: EASE,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: TIMINGS.logoDuration,
        easing: EASE,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: TIMINGS.logoDuration,
        easing: EASE,
        useNativeDriver: true,
      }),
    ]);
 
    const animation = Animated.sequence([
      Animated.delay(TIMINGS.artworkDelay),
      artworkEntrance,
      Animated.delay(TIMINGS.gapBeforeLogo),
      logoEntrance,
      Animated.delay(TIMINGS.holdDuration),
      Animated.delay(TIMINGS.transitionDuration),
    ]);
 
    animation.start(({ finished }) => {
      if (finished && !navigationTriggered.current) {
        navigationTriggered.current = true;
        navigation.replace('Dashboard');
      }
    });
 
    return () => {
      animation.stop();
    };
  }, [artworkOpacity, artworkScale, artworkTranslateY, logoOpacity, logoScale, logoTranslateY, navigation]);
 
  return (
    <View style={styles.container}>
      <Animated.Image
        source={SPLASH_BACKGROUND}
        style={styles.background}
        resizeMode="cover"
      />
      <Animated.Image
        source={SPLASH_ARTWORK}
        style={[
          styles.artwork,
          {
            opacity: artworkOpacity,
            transform: [
              { scale: artworkScale },
              { translateY: artworkTranslateY },
            ],
          },
        ]}
        resizeMode="cover"
      />
      <View
        style={[
          styles.logoPositioner,
          { top: logoTop, left: logoLeft, width: logoSize, height: logoSize },
        ]}
        pointerEvents="none"
      >
        <Animated.Image
          source={ANIL_BALAJI_LOGO}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoTranslateY },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF3FF',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  artwork: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  logoPositioner: {
    position: 'absolute',
  },
  logo: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
});
 
export default SplashScreen;
 
 