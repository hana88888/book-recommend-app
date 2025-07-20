import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, ActivityIndicator } from 'react-native';
import Config from 'react-native-config';
import { getUserId } from '../utils/userUtils';

const BACKEND_URL = Config.BACKEND_URL;

const RecommendationsScreen = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userId = await getUserId();
        const response = await fetch(`${BACKEND_URL}/recommendations/${userId}`);
        const data = await response.json();
        
        if (data.Items) {
          const formattedBooks = data.Items.map(item => ({
            title: item.Item.title,
            author: item.Item.author,
            coverImageUrl: item.Item.largeImageUrl.replace('?_ex=120x120', ''),
            isbn: item.Item.isbn,
          }));
          setRecommendations(formattedBooks);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>おすすめを取得中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recommendations}
        keyExtractor={(item, index) => `${item.isbn}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.bookItem}>
            <Image source={{ uri: item.coverImageUrl }} style={styles.coverImage} />
            <View style={styles.bookInfo}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>おすすめの本が見つかりませんでした。</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, marginTop: 50, alignItems: 'center' },
  bookItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#dddddd', alignItems: 'center' },
  coverImage: { width: 60, height: 90, resizeMode: 'contain', marginRight: 15 },
  bookInfo: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold' },
  author: { fontSize: 14, color: '#666666' },
});

export default RecommendationsScreen;
