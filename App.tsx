import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import RecommendationsScreen from './src/screens/RecommendationsScreen';

const Stack = createStackNavigator();

const App = () => {

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            options={({ navigation }) => ({
              title: '本を探す',
              headerRight: () => (
                <View style={{ flexDirection: 'row', marginRight: 15 }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Recommendations')}
                    style={{ marginRight: 15 }}
                  >
                    <Text style={{ color: '#007AFF', fontSize: 16 }}>おすすめ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Favorites')}
                  >
                    <Text style={{ color: '#007AFF', fontSize: 16 }}>お気に入り</Text>
                  </TouchableOpacity>
                </View>
              ),
            })}
          >
            {props => <HomeScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen
            name="Favorites"
            options={{ title: 'お気に入り一覧' }}
            component={FavoritesScreen}
          />
          <Stack.Screen
            name="Recommendations"
            options={{ title: 'おすすめ一覧' }}
            component={RecommendationsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
};

export default App;
