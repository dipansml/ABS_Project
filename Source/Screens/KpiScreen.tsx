import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Footer, { FooterTab } from '../Components/Footer';
import Header from '../Components/Header';
import MachineUtilizationDashboard from '../Components/MachineUtilizationDashboard';
import { colors } from '../Utils/dimensions';
import { RootStackParamList } from '../Types/Navigation';

type KpiNavProp = NativeStackNavigationProp<RootStackParamList, 'KPI'>;

function KPIScreen() {
  const navigation = useNavigation<KpiNavProp>();
  const [activeTab, setActiveTab] = useState<FooterTab>('kpi');


const handleDashboardPress = useCallback(() => {
  navigation.navigate('Dashboard');
}, [navigation]);

const handleKpiPress = useCallback(() => {
  navigation.navigate('KPI'); // apna actual route name daalo
}, [navigation]);

const handleSettingsPress = useCallback(() => {
  navigation.navigate('Settings');
}, [navigation]);


  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header />

      <MachineUtilizationDashboard />

      <Footer
        activeTab={activeTab}
        onDashboardPress={handleDashboardPress}
        onKpiPress={handleKpiPress}
        onSettingsPress={handleSettingsPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default KPIScreen;