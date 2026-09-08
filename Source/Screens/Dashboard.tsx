import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchMachines, resolveMediaUrl } from '../API/machines';
import Footer, { FooterTab } from '../Components/Footer';
import Header from '../Components/Header';
import MachineCard from '../Components/MachineCard';
import { machineData } from '../Constants/machineData';
import { Machine } from '../Types/machine';
import { RootStackParamList } from '../Types/Navigation';
import { colors, spacing } from '../Utils/dimensions';
import CustomLoader from '../Components/CustomLoader';


type DashboardNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

function Dashboard() {
  const navigation = useNavigation<DashboardNavProp>();
  const [activeTab, setActiveTab] = useState<FooterTab>('dashboard');
  const [machines, setMachines] = useState<Machine[]>(machineData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMachines = useCallback(async () => {
    try {
      console.log('Dashboard: loadMachines start');
      setError(null);
      const data = await fetchMachines();
      console.log('Dashboard: fetchMachines returned', data?.length);
      setMachines(data);
    } catch (err) {
      setError('Could not load machines. Pull down to retry.');
      console.warn('fetchMachines failed:', err);
    }
  }, []);
useEffect(() => {
  fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(r => r.json())
    .then(d => console.log('TEST OK', d))
    .catch(e => console.warn('TEST FAILED', e));
}, []);
  useEffect(() => {
    (async () => {
      console.log('Dashboard: useEffect mount');
      setLoading(true);
      await loadMachines();
      setLoading(false);
    })();
  }, [loadMachines]);

  // Jab bhi ye screen focus mein aaye (navigate se ya goBack se), tab active karo
  useFocusEffect(
    useCallback(() => {
      setActiveTab('dashboard');
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMachines();
    setRefreshing(false);
  }, [loadMachines]);

  const handleMachinePress = useCallback(
    (machine: Machine) => {
      const videoUri = resolveMediaUrl(machine.video_url);
      if (!videoUri) return;
      navigation.navigate('VideoPlayer', {
        videoUri,
        title: machine.name,
      });
    },
    [navigation],
  );

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleKpiPress = useCallback(() => {
    navigation.navigate('KPI');
  }, [navigation]);

  const renderItem = ({ item }: { item: Machine }) => (
    <MachineCard machine={item} onPress={() => handleMachinePress(item)} />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomLoader visible={loading} />
      <Header />

      {loading && machines.length === 0 ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      ) : (
        <FlatList
          data={machines}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primaryBlue]}
              tintColor={colors.primaryBlue}
            />
          }
          ListHeaderComponent={
            error ? <Text style={styles.errorText}>{error}</Text> : null
          }
        />
      )}

      <Footer
        activeTab={activeTab}
        onDashboardPress={() => {}}
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

});
export default Dashboard;