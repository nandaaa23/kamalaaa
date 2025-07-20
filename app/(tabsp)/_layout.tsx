import { Tabs } from 'expo-router';

export default function PsychologistTabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen 
        name="messages" 
        options={{ 
          title: 'Messages',
          tabBarIcon: () => null 
        }} 
      />
    </Tabs>
  );
}