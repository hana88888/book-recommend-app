import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native';

const FavoritesScreen = ({ favorites }) => {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => `${item.title}-${index}`}
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
  },
});

export default FavoritesScreen;