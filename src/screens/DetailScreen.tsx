import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, ActivityIndicator, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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

type RootStackParamList = {
  Detail: { isbn: string };
};

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Detail'>;

type Props = {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
};

interface BookDetails {
  title: string;
  author: string;
  summary: string;
  publisherName: string;
  salesDate: string;
  isbn: string;
  largeImageUrl: string;
  itemPrice: number;
  itemUrl: string;
  reviewCount: number;
  reviewAverage: string;
}

const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { isbn } = route.params;
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${BACKEND_URL}/book/${isbn}`, {
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          setBookDetails(data);
        } else if (response.status === 404) {
          setError('本の詳細情報が見つかりませんでした');
        } else {
          setError('本の詳細情報の取得に失敗しました');
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
        setError('ネットワークエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [isbn]);

  const handleOpenUrl = async () => {
    if (bookDetails?.itemUrl) {
      try {
        await Linking.openURL(bookDetails.itemUrl);
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>詳細情報を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!bookDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>本の詳細情報が見つかりませんでした</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: bookDetails.largeImageUrl }} style={styles.coverImage} />
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{bookDetails.title}</Text>
            <Text style={styles.author}>著者: {bookDetails.author}</Text>
            
            {bookDetails.publisherName && (
              <Text style={styles.publisher}>出版社: {bookDetails.publisherName}</Text>
            )}
            
            {bookDetails.salesDate && (
              <Text style={styles.salesDate}>発売日: {bookDetails.salesDate}</Text>
            )}
            
            {bookDetails.itemPrice > 0 && (
              <Text style={styles.price}>価格: ¥{bookDetails.itemPrice.toLocaleString()}</Text>
            )}
            
            {bookDetails.reviewCount > 0 && (
              <Text style={styles.review}>
                レビュー: {bookDetails.reviewAverage} ({bookDetails.reviewCount}件)
              </Text>
            )}
            
            <Text style={styles.isbn}>ISBN: {bookDetails.isbn}</Text>
            
            {bookDetails.summary && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>あらすじ</Text>
                <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={true}>
                  <Text style={styles.summary}>{bookDetails.summary}</Text>
                </ScrollView>
              </View>
            )}
            
            {bookDetails.itemUrl && (
              <TouchableOpacity style={styles.urlButton} onPress={handleOpenUrl}>
                <Text style={styles.urlButtonText}>楽天ブックスで詳細を見る</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coverImage: {
    width: 200,
    height: 280,
    resizeMode: 'contain',
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  author: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  publisher: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 6,
  },
  salesDate: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  review: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 6,
  },
  isbn: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 20,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  urlButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  urlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetailScreen;
