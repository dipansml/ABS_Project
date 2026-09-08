
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Footer, { FooterTab } from '../Components/Footer';
import Header from '../Components/Header';
import { colors, spacing } from '../Utils/dimensions';
import { RootStackParamList } from '../Types/Navigation';

type SettingsNavProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

function Settings() {
  const navigation = useNavigation<SettingsNavProp>();
  const [activeTab, setActiveTab] = useState<FooterTab>('settings');

  // Jab bhi ye screen focus mein aaye, tab active karo
  useFocusEffect(
    useCallback(() => {
      setActiveTab('settings');
    }, []),
  );

  const handleDashboardPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  }, [navigation]);

  const handleKpiPress = useCallback(() => {
    navigation.navigate('KPI');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header />

      <View style={styles.content}>
        <Text style={styles.text}>Settings screen coming soon.</Text>
      </View>

      <Footer
        activeTab={activeTab}
        onDashboardPress={handleDashboardPress}
        onKpiPress={handleKpiPress}
        onSettingsPress={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  text: {
    color: colors.navy,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Settings;


// import React, { useState } from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Footer, { FooterTab } from '../Components/Footer';
// import Header from '../Components/Header';
// import { colors, spacing } from '../Utils/dimensions';
// import { RootStackParamList } from '../Types/Navigation';

// type SettingsNavProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

// function Settings() {
//   const navigation = useNavigation<SettingsNavProp>();
//   const [activeTab, setActiveTab] = useState<FooterTab>('settings');

//   const handleDashboardPress = () => {
//     setActiveTab('dashboard');
    
//     navigation.goBack();
    
//   };

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
//       <Header />

//       <View style={styles.content}>
//         <Text style={styles.text}>Settings screen coming soon.</Text>
//       </View>

//       <Footer
//         activeTab={activeTab}
//         onDashboardPress={handleDashboardPress}
//         onSettingsPress={() => setActiveTab('settings')}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: spacing.xxl,
//   },
//   text: {
//     color: colors.navy,
//     fontSize: 16,
//     textAlign: 'center',
//   },
// });

// export default Settings;


// import React, { useState } from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Header from '../Components/Header';
// import Footer, { FooterTab } from '../Components/Footer';
// import { RootStackParamList } from '../Types/navigation';
// import { colors, spacing } from '../Utils/dimensions';

// type SettingsNavProp = NativeStackNavigationProp<
//   RootStackParamList,
//   'Settings'
// >;

// type SettingRow = {
//   key: string;
//   label: string;
//   description?: string;
// };

// const TOGGLE_ROWS: SettingRow[] = [
//   {
//     key: 'notifications',
//     label: 'Push notifications',
//     description: 'Get alerted when a machine changes status',
//   },
//   {
//     key: 'autoRefresh',
//     label: 'Auto-refresh dashboard',
//     description: 'Poll for machine updates every 30 seconds',
//   },
//   {
//     key: 'darkMode',
//     label: 'Dark mode',
//   },
// ];

// function SettingsScreen() {
//   const navigation = useNavigation<SettingsNavProp>();
//   const [activeTab, setActiveTab] = useState<FooterTab>('settings');
//   const [toggles, setToggles] = useState<Record<string, boolean>>({
//     notifications: true,
//     autoRefresh: true,
//     darkMode: false,
//   });

//   const toggleSetting = (key: string) => {
//     setToggles(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
//       <Header />

//       <ScrollView
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={styles.sectionTitle}>Preferences</Text>

//         {TOGGLE_ROWS.map(row => (
//           <View key={row.key} style={styles.row}>
//             <View style={styles.rowText}>
//               <Text style={styles.rowLabel}>{row.label}</Text>
//               {row.description ? (
//                 <Text style={styles.rowDescription}>{row.description}</Text>
//               ) : null}
//             </View>
//             <Switch
//               value={toggles[row.key]}
//               onValueChange={() => toggleSetting(row.key)}
//               trackColor={{ true: colors.primaryBlue }}
//             />
//           </View>
//         ))}

//         <Text style={styles.sectionTitle}>Account</Text>

//         <TouchableOpacity style={styles.linkRow}>
//           <Text style={styles.linkText}>Change password</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.linkRow}>
//           <Text style={styles.linkText}>Log out</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       <Footer
//         activeTab={activeTab}
//         onDashboardPress={() => {
//           setActiveTab('dashboard');
//           navigation.navigate('Dashboard');
//         }}
//         onSettingsPress={() => setActiveTab('settings')}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   content: {
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.md,
//     paddingBottom: spacing.xxl,
//   },
//   sectionTitle: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#8A8A8E',
//     textTransform: 'uppercase',
//     marginTop: spacing.md,
//     marginBottom: spacing.sm,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: spacing.sm,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: '#E0E0E0',
//   },
//   rowText: {
//     flex: 1,
//     paddingRight: spacing.md,
//   },
//   rowLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1C1C1E',
//   },
//   rowDescription: {
//     fontSize: 12,
//     color: '#8A8A8E',
//     marginTop: 2,
//   },
//   linkRow: {
//     paddingVertical: spacing.sm,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: '#E0E0E0',
//   },
//   linkText: {
//     fontSize: 15,
//     color: colors.primaryBlue,
//     fontWeight: '600',
//   },
// });

// export default SettingsScreen;