import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getUserId } from '../utils/userUtils';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const BACKEND_AUTH = process.env.EXPO_PUBLIC_BACKEND_AUTH;

const getAuthHeaders = (): HeadersInit => {
  if (BACKEND_AUTH) {
    return {
      'Authorization': `Basic ${btoa(BACKEND_AUTH)}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
};

interface Book {
  title: string;
  author: string;
  largeImageUrl: string;
  isbn: string;
  summary?: string;
}

type RootStackParamList = {
  Detail: { isbn: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const userId = await getUserId();
        const response = await fetch(`${BACKEND_URL}/favorites/${userId}`, {
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          const books = data.Items || [];
          const formattedBooks = books.map((item: any) => ({
            title: item.title,
            author: item.author,
            largeImageUrl: item.largeImageUrl,
            isbn: item.isbn,
            summary: item.summary || ''
          }));
          setFavorites(formattedBooks);
        } else {
          console.error('Failed to fetch favorites');
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>お気に入りを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.bookItem}
            onPress={() => navigation.navigate('Detail', { isbn: item.isbn })}
          >
            <Image source={{ uri: item.largeImageUrl }} style={styles.coverImage} />
            <View style={styles.bookInfo}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
              {item.summary && (
                <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={true}>
                  <Text style={styles.summary}>{item.summary}</Text>
                </ScrollView>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>お気に入りに登録された本はありません。</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
  },
  bookItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    alignItems: 'center',
  },
  coverImage: {
    width: 60,
    height: 90,
    resizeMode: 'contain',
    marginRight: 15,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  author: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  summaryContainer: {
    maxHeight: 60,
    marginTop: 5,
  },
  summary: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 16,
  },
});

export default FavoritesScreen;
