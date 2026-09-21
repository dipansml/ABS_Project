import React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { colors, spacing } from '../Utils/dimensions';

function Header() {
  const { height } = useWindowDimensions();

  // Responsive header height
  const headerHeight = Math.min(
    Math.max(height * 0.10, 70),
    100,
  );

  return (
    <ImageBackground
      source={require('../Images/header-bg.jpg')}
      style={[styles.header, { height: headerHeight }]}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Image
          source={require('../Images/inmmlogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.divider} />

        <Text style={styles.title}>
          Industrial Monitoring
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
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