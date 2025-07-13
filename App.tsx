import React, { useState } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

const Stack = createStackNavigator();

const App = () => {
  const [favorites, setFavorites] = useState([]);

  const handleAddToFavorites = (book) => {
    if (!favorites.some(fav => fav.title === book.title)) {
      setFavorites(currentFavorites => [...currentFavorites, book]);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={({ navigation }) => ({
            title: '本を探す',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Favorites')}
                style={{ marginRight: 15 }}
              >
                <Text style={{ color: '#007AFF', fontSize: 16 }}>お気に入り</Text>
              </TouchableOpacity>
            ),
          })}
        >
          {props => <HomeScreen {...props} onAddToFavorites={handleAddToFavorites} />}
        </Stack.Screen>
        <Stack.Screen
          name="Favorites"
          options={{ title: 'お気に入り一覧' }}
        >
          {props => <FavoritesScreen {...props} favorites={favorites} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;