import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../Screens/SplashScreen';
import Dashboard from '../Screens/Dashboard';
import VideoPlayerScreen from '../Screens/VideoPlayerScreen';
import SettingsScreen from '../Screens/Settings';
import { RootStackParamList } from '../Types/Navigation'; // ✅ fixed casing (was 'Navigation')
import KpiScreen from '../Screens/KpiScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'fade', animationDuration: 500 }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ animation: 'fade', animationDuration: 500 }}
        />

        {/* <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        /> */}

        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />

        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="KPI" component={KpiScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
