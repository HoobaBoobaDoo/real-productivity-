import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../constants/theme';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icon}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon icon="⚡" focused={focused} /> }} />
      <Tabs.Screen name="categories" options={{ title: 'Skills', tabBarIcon: ({ focused }) => <TabIcon icon="🎯" focused={focused} /> }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals', tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} /> }} />
      <Tabs.Screen name="achievements" options={{ title: 'Awards', tabBarIcon: ({ focused }) => <TabIcon icon="🏆" focused={focused} /> }} />
      <Tabs.Screen name="log" options={{ title: 'History', tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} /> }} />
    </Tabs>
  );
}
