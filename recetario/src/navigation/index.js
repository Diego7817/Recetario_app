import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MyRecipesScreen from '../screens/MyRecipesScreen';
import AllRecipesScreen from '../screens/AllRecipesScreen';
import RecipeFormScreen from '../screens/RecipeFormScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupFormScreen from '../screens/GroupFormScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// [icono activo, icono inactivo] de cada pestaña
const TAB_ICONS = {
  MisRecetas: ['restaurant', 'restaurant-outline'],
  Todas: ['earth', 'earth-outline'],
  Grupos: ['folder', 'folder-outline'],
  Perfil: ['person', 'person-outline'],
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="MisRecetas" component={MyRecipesScreen} options={{ title: 'Mis recetas' }} />
      <Tab.Screen name="Todas" component={AllRecipesScreen} options={{ title: 'Todas' }} />
      <Tab.Screen name="Grupos" component={GroupsScreen} options={{ title: 'Grupos' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="RecipeForm" component={RecipeFormScreen} options={{ title: 'Receta' }} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Detalle' }} />
            <Stack.Screen name="GroupForm" component={GroupFormScreen} options={{ title: 'Grupo' }} />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Grupo' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}