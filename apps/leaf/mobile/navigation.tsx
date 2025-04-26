import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import AddBookScreen from './screens/AddBookScreen';
import BooksListScreen from './screens/BooksListScreen';
import ProfileScreen from './screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="AddBook"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'AddBook') {
              iconName = 'book-outline';
            } else if (route.name === 'BooksList') {
              iconName = 'library-outline';
            } else if (route.name === 'Profile') {
              iconName = 'person-outline';
            }
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="AddBook" component={AddBookScreen} options={{ title: '' }} />
        <Tab.Screen name="BooksList" component={BooksListScreen} options={{ title: '' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
