import React, { useState, useEffect } from 'react'; // useEffect をインポート
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage をインポート

import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import RecommendationsScreen from './src/screens/RecommendationsScreen';

const Stack = createStackNavigator();
const FAVORITES_KEY = '@favorites_list'; // 保存用のキーを定義

const App = () => {
  const [favorites, setFavorites] = useState([]);

  // ★★★ 変更点①：アプリ起動時にデータを読み込む処理 ★★★
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
        if (savedFavorites !== null) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (e) {
        console.error('Failed to load favorites.', e);
      }
    };
    loadFavorites();
  }, []);

  // ★★★ 変更点②：お気に入りリストが更新されたらデータを保存する処理 ★★★
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (e) {
        console.error('Failed to save favorites.', e);
      }
    };
    // 最初の読み込み時（favoritesが空の配列の時）には保存しないようにする
    if (favorites.length > 0) {
      saveFavorites();
    }
  }, [favorites]); // favorites の中身が変わるたびに実行

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
          {props => <HomeScreen {...props} onAddToFavorites={handleAddToFavorites} />}
        </Stack.Screen>
        <Stack.Screen
          name="Favorites"
          options={{ title: 'お気に入り一覧' }}
        >
          {props => <FavoritesScreen {...props} favorites={favorites} />}
        </Stack.Screen>
        <Stack.Screen
          name="Recommendations"
          options={{ title: 'おすすめ一覧' }}
          component={RecommendationsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
