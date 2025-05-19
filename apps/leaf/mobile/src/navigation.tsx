import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddBookScreen from "./screens/AddBookScreen";
import BooksListScreen from "./screens/BooksListScreen";
import BookDetailsScreen from "./screens/BookDetailsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import type { RootStackParamList } from "./types/navigation"; // Adjusted path

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function BooksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BooksList"
        component={BooksListScreen}
        options={{ title: "", headerShown: false }}
      />
      <Stack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={{ title: "Book Details" }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="AddBook"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "AddBook") {
              iconName = "book-outline";
            } else if (route.name === "Books") {
              iconName = "library-outline";
            } else if (route.name === "Profile") {
              iconName = "person-outline";
            }
            return (
              <Ionicons name={iconName as any} size={size} color={color} />
            );
          },
          tabBarActiveTintColor: "#4CAF50",
          tabBarInactiveTintColor: "gray",
          tabBarLabel: ({ focused, color }) => {
            let label = "";
            if (route.name === "AddBook") {
              label = "Add Book";
            } else if (route.name === "Books") {
              label = "Books List";
            } else if (route.name === "Profile") {
              label = "Profile";
            }
            return (
              <Text
                style={{
                  color,
                  fontSize: 11,
                  fontWeight: focused ? "bold" : "normal",
                  marginBottom: 2,
                }}
              >
                {label}
              </Text>
            );
          },
        })}
      >
        <Tab.Screen
          name="AddBook"
          component={AddBookScreen}
          options={{ title: "", headerShown: false }}
        />
        <Tab.Screen
          name="Books"
          component={BooksStack}
          options={{ title: "", headerShown: false }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "", headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
