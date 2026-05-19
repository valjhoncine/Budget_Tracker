import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

import AddTransactionScreen from '../screens/AddTransactionScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LoginScreen from '../screens/LoginScreen';
import MonthlySummaryScreen from '../screens/MonthlySummaryScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#6C63FF',
      tabBarInactiveTintColor: '#aaa',
      tabBarStyle: { paddingBottom: 6, height: 60 },
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Dashboard: 'home-outline',
          Add: 'add-circle-outline',
          History: 'list-outline',
          Summary: 'bar-chart-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Add" component={AddTransactionScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Summary" component={MonthlySummaryScreen} />
  </Tab.Navigator>
);

export default function RootNavigator() {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
