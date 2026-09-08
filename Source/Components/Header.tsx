

import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../Utils/dimensions';

const HEADER_ASPECT_RATIO = 772 / 206; // was 772 / 223 — larger number = shorter header

function Header() {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('../Images/header-bg.jpg')}
      style={styles.header}
      resizeMode="cover"
    >
      <View style={[styles.content, { paddingTop: insets.top + spacing.sm }]}>
        <Image
          source={require('../Images/inmmlogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.divider} />
        {/* <Text style={styles.title}>Anil Balaji Steel Pvt.Ltd.</Text> */}
         <Text style={styles.title}>Industrial Monitoring</Text>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    aspectRatio: HEADER_ASPECT_RATIO,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  logo: {
    width: 70,
    height: 70,
  },
  divider: {
    width: 2,
    height: 28,
    backgroundColor: colors.white,
    opacity: 0.9,
    marginHorizontal: spacing.md,
    

  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    flexShrink: 1,
  },
});

export default Header;