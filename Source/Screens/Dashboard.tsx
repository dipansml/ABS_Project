import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  AppState,
  AppStateStatus,
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
import WebSocketService from '../services/WebSocketService';
import GlobalApi from '../API/GlobalApi';

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
  const [socketConnected, setSocketConnected] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('Dashboard focused - connecting WebSocket');

      const connectSocket = () => {
        console.log('Connecting WebSocket...');

        WebSocketService.connect(
          GlobalApi.socket_url,

          data => {
            console.log('REAL TIME DATA:', data);
            console.log('WEBSOCKET TYPE:', data.type);

            if (data.type === 'live_update') {
              console.log('Live update received');
              console.log('Machines:', data.machines);
              console.log('Cameras:', data.cameras);
            }
          },

          isConnected => {
            setSocketConnected(isConnected);
            console.log('WebSocket connected:', isConnected);
          },
        );
      };

      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        console.log('AppState changed:', nextAppState);

        if (nextAppState === 'active') {
          console.log('App became active - connecting WebSocket');

          //connectSocket();
        } else if (
          nextAppState === 'background' ||
          nextAppState === 'inactive'
        ) {
          console.log('App went to background - disconnecting WebSocket');

          WebSocketService.disconnect();
          setSocketConnected(false);
        }
      };

      // Connect initially
      //connectSocket();

      // Listen for minimize/background/foreground
      const subscription = AppState.addEventListener(
        'change',
        handleAppStateChange,
      );

      return () => {
        console.log('Dashboard unfocused - disconnecting WebSocket');

        subscription.remove();

        WebSocketService.disconnect();
        setSocketConnected(false);
      };
    }, []),
  );

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
  // useEffect(() => {
  //   (async () => {
  //     console.log('Dashboard: useEffect mount');
  //     setLoading(true);
  //     await loadMachines();
  //     setLoading(false);
  //   })();
  // }, [loadMachines]);

  useFocusEffect(
    useCallback(() => {
      let interval: ReturnType<typeof setInterval> | null = null;
      let isActive = true;

      const startPolling = async () => {
        console.log('Dashboard: page focused');

        setLoading(true);

        // First call immediately
        await loadMachines();

        if (!isActive) {
          return;
        }

        setLoading(false);

        // Then call every 5 seconds
        interval = setInterval(() => {
          if (isActive) {
            console.log('Dashboard: polling loadMachines');
            loadMachines();
          }
        }, 5000);
      };

      startPolling();

      // Called when leaving the screen
      return () => {
        console.log('Dashboard: page unfocused - stopping polling');

        isActive = false;

        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      };
    }, [loadMachines]),
  );

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
