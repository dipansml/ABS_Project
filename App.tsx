/**
 * @format
 */

// import React from 'react';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import Dashboard from './Source/Screens/Dashboard';

// function App() {
//   return (
//     <SafeAreaProvider>
//       <Dashboard />
//     </SafeAreaProvider>
//   );
// }

// export default App;
import React from 'react';
import AppNavigator from './Source/navigation/AppNavigator';
 
const App: React.FC = () => {
  return <AppNavigator />;
};
 
export default App;