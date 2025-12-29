import { Tabs } from 'expo-router';
import { Home, Film, Tv, PlayCircle, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#333',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          title: 'Movies',
          tabBarIcon: ({ color, size }) => <Film size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tvshows"
        options={{
          title: 'TV Shows',
          tabBarIcon: ({ color, size }) => <Tv size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="anime"
        options={{
          title: 'Anime',
          tabBarIcon: ({ color, size }) => <PlayCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
