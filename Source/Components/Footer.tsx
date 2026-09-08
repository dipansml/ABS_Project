

import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../Utils/dimensions';

export type FooterTab = 'dashboard' | 'settings' | 'kpi';

type Props = {
  activeTab: FooterTab;
  onDashboardPress?: () => void;
  onSettingsPress?: () => void;
  onKpiPress?: () => void;
};

const FOOTER_ASPECT_RATIO = 769 / 108;

function Footer({ activeTab, onDashboardPress, onSettingsPress , onKpiPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom - 6, 0) }]}
    >
      <ImageBackground
        source={require('../Images/Footer.png')}
        style={styles.background}
        resizeMode="stretch"
      >
        <View style={styles.row}>
          <Pressable style={styles.item} onPress={onDashboardPress}>
            <MaterialIcons
              name="speed"
              size={25}
              color={colors.white}
              style={activeTab !== 'dashboard' && styles.inactiveIcon}
            />
            <Text
              style={[styles.label, activeTab !== 'dashboard' && styles.inactiveLabel]}
            >
              Dashboard
            </Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.item} onPress={onKpiPress}>
            <MaterialIcons
              name="analytics"
              size={25}
              color={colors.white}
              style={activeTab !== 'kpi' && styles.inactiveIcon}
            />
            <Text
              style={[styles.label, activeTab !== 'kpi' && styles.inactiveLabel]}
            >
              KPI
            </Text>
          </Pressable>
          
<View style={styles.divider} />

          <Pressable style={styles.item} onPress={onSettingsPress}>
            <MaterialIcons
              name="settings"
              size={25}
              color={colors.white}
              style={activeTab !== 'settings' && styles.inactiveIcon}
            />
            <Text
              style={[styles.label, activeTab !== 'settings' && styles.inactiveLabel]}
            >
              Settings
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    
  },
  background: {
    width: '100%',
    aspectRatio: FOOTER_ASPECT_RATIO,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  label: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  inactiveIcon: {
    opacity: 0.55,
  },
  inactiveLabel: {
    opacity: 0.55,
  },
});

export default Footer;
