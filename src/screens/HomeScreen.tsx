import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { getUserId } from '../utils/userUtils';

const RAKUTEN_APP_ID = process.env.EXPO_PUBLIC_RAKUTEN_APP_ID;
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const BookCard = ({ card }) => (
  <View style={styles.card}>
    <Image source={{ uri: card.coverImageUrl }} style={styles.coverImage} />
    <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
    <Text style={styles.author}>{card.author}</Text>
  </View>
);

const HomeScreen = ({ onAddToFavorites }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&applicationId=${RAKUTEN_APP_ID}&booksGenreId=001005`);
        const data = await response.json();
        if (data.Items) {
          const formattedBooks = data.Items.map(item => ({
            title: item.Item.title,
            author: item.Item.author,
            coverImageUrl: item.Item.largeImageUrl.replace('?_ex=120x120', ''),
            isbn: item.Item.isbn,
          }));
          setBooks(formattedBooks);
        } else {
          console.log("APIから本のデータが取得できませんでした:", data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const recordSwipe = async (book, liked) => {
    try {
      const userId = await getUserId();
      const response = await fetch(`${BACKEND_URL}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          book_isbn: book.isbn,
          liked: liked,
          author: book.author,
        }),
      });
      if (!response.ok) {
        console.error('Failed to record swipe:', response.status);
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>本を探しています...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.swiperContainer}>
        <Swiper
          cards={books}
          renderCard={(card) => (card ? <BookCard card={card} /> : null)}
          onSwipedRight={(cardIndex) => {
            onAddToFavorites(books[cardIndex]);
            recordSwipe(books[cardIndex], true);
          }}
          onSwipedLeft={(cardIndex) => {
            recordSwipe(books[cardIndex], false);
          }}
          cardIndex={0}
          backgroundColor={'transparent'}
          stackSize={3}
          infinite
          animateCardOpacity
        />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  swiperContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 0.9,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coverImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  author: {
    fontSize: 16,
    color: '#666666',
  },
});

export default HomeScreen;
