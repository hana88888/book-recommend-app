import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { getUserId } from '../utils/userUtils';

const RAKUTEN_APP_ID = process.env.EXPO_PUBLIC_RAKUTEN_APP_ID;
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
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

const BookCard = ({ card, onLike, onDislike, isWeb }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: card.coverImageUrl }} style={styles.coverImage} />
      <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
      <Text style={styles.author}>{card.author}</Text>
    </View>
  );
};

const HomeScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const isWeb = Platform.OS === 'web';

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
      console.log('🔄 Recording swipe:', { book: book.title, liked });
      const userId = await getUserId();
      console.log('👤 User ID:', userId);
      
      const response = await fetch(`${BACKEND_URL}/swipe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: userId,
          book_isbn: book.isbn,
          liked: liked,
          author: book.author,
          title: book.title,
          cover_image_url: book.coverImageUrl,
        }),
      });
      
      if (!response.ok) {
        console.error('❌ Failed to record swipe:', response.status);
      } else {
        console.log('✅ Swipe recorded successfully');
      }
    } catch (error) {
      console.error('🚨 Error recording swipe:', error);
    }
  };

  const handleWebLike = () => {
    if (currentCardIndex < books.length) {
      const currentBook = books[currentCardIndex];
      recordSwipe(currentBook, true);
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleWebDislike = () => {
    if (currentCardIndex < books.length) {
      const currentBook = books[currentCardIndex];
      recordSwipe(currentBook, false);
      setCurrentCardIndex(currentCardIndex + 1);
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

  if (isWeb) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.swiperContainer}>
          {currentCardIndex < books.length ? (
            <View style={styles.webContainer}>
              <Swiper
                cards={books.slice(currentCardIndex)}
                renderCard={(card) => (card ? <BookCard card={card} isWeb={false} onLike={() => {}} onDislike={() => {}} /> : null)}
                onSwipedRight={(cardIndex) => {
                  const actualIndex = currentCardIndex + cardIndex;
                  recordSwipe(books[actualIndex], true);
                  setCurrentCardIndex(actualIndex + 1);
                }}
                onSwipedLeft={(cardIndex) => {
                  const actualIndex = currentCardIndex + cardIndex;
                  recordSwipe(books[actualIndex], false);
                  setCurrentCardIndex(actualIndex + 1);
                }}
                cardIndex={0}
                backgroundColor={'transparent'}
                stackSize={3}
                infinite={false}
                animateCardOpacity
              />
              <View style={styles.webButtonOverlay}>
                <TouchableOpacity style={[styles.webButton, styles.dislikeButton]} onPress={handleWebDislike}>
                  <Text style={styles.buttonText}>👎 パス</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.webButton, styles.likeButton]} onPress={handleWebLike}>
                  <Text style={styles.buttonText}>👍 いいね</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noMoreCards}>
              <Text style={styles.noMoreCardsText}>すべての本を確認しました！</Text>
              <Text style={styles.noMoreCardsSubtext}>お気に入りページで選んだ本を確認できます</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.swiperContainer}>
        <Swiper
          cards={books}
          renderCard={(card) => (card ? <BookCard card={card} isWeb={false} onLike={() => {}} onDislike={() => {}} /> : null)}
          onSwipedRight={(cardIndex) => {
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
  webContainer: {
    flex: 1,
    position: 'relative',
  },
  webButtonOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  webButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  dislikeButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMoreCardsText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  noMoreCardsSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default HomeScreen;
