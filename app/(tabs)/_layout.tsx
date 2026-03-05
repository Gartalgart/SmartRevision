import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../../utils/styles';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />
  );
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: theme.gray400,
      headerShown: false,
      tabBarShowLabel: true,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
      },
      tabBarStyle: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 16,
        left: 20,
        right: 20,
        height: 68,
        backgroundColor: theme.card,
        borderRadius: 24,
        borderTopWidth: 0,
        paddingTop: 8,

        ...Platform.select({
          ios: {
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
          },
          android: {
            elevation: 10,
          },
          web: {
            boxShadow: `0 8px 15px 0 ${theme.primary}1A`,
          }
        }),
      },
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: 'Explorateur',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="folder-open" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add-shortcut"
        options={{
          title: 'Ajouter',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="plus-circle" color={color} focused={focused} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('add-word');
          },
        })}
      />
      <Tabs.Screen
        name="review-shortcut"
        options={{
          title: 'Réviser',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="play-circle" color={color} focused={focused} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('review');
          },
        })}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="user" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

