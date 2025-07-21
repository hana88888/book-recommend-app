import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getUserId } from '../utils/userUtils';
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface BookDetail {
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

type RootStackParamList = {
  Detail: { isbn: string };
};

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

const DetailScreen = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const { isbn } = route.params;
  
  const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isbn) {
          setError('ISBNが指定されていません');
          return;
        }

        const response = await fetch(`${BACKEND_URL}/book/${isbn}`);
        
        if (response.ok) {
          const data = await response.json();
          setBookDetail(data);
        } else if (response.status === 404) {
          setError('この本の詳細情報が見つかりませんでした');
        } else {
          setError('本の詳細情報の取得に失敗しました');
        }
      } catch (error) {
        console.error('Error fetching book detail:', error);
        setError('ネットワークエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [isbn]);

  const handleOpenUrl = async () => {
    if (bookDetail?.itemUrl) {
      try {
        const supported = await Linking.canOpenURL(bookDetail.itemUrl);
        if (supported) {
          await Linking.openURL(bookDetail.itemUrl);
        } else {
          Alert.alert('エラー', 'URLを開くことができませんでした');
        }
      } catch (error) {
        Alert.alert('エラー', 'URLを開く際にエラーが発生しました');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>本の詳細を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bookDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>本の詳細情報が見つかりませんでした</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          {bookDetail.largeImageUrl && (
            <Image source={{ uri: bookDetail.largeImageUrl }} style={styles.coverImage} />
          )}
          
          <View style={styles.bookInfo}>
            <Text style={styles.title}>{bookDetail.title}</Text>
            <Text style={styles.author}>著者: {bookDetail.author}</Text>
            
            {bookDetail.summary && (
              <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>あらすじ</Text>
                <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={true}>
                  <Text style={styles.summary}>{bookDetail.summary}</Text>
                </ScrollView>
              </View>
            )}
            
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>詳細情報</Text>
              
              {bookDetail.publisherName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>出版社:</Text>
                  <Text style={styles.detailValue}>{bookDetail.publisherName}</Text>
                </View>
              )}
              
              {bookDetail.salesDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>発売日:</Text>
                  <Text style={styles.detailValue}>{bookDetail.salesDate}</Text>
                </View>
              )}
              
              {bookDetail.isbn && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ISBN:</Text>
                  <Text style={styles.detailValue}>{bookDetail.isbn}</Text>
                </View>
              )}
              
              {bookDetail.itemPrice > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>価格:</Text>
                  <Text style={styles.detailValue}>¥{bookDetail.itemPrice.toLocaleString()}</Text>
                </View>
              )}
              
              {bookDetail.reviewCount > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>レビュー:</Text>
                  <Text style={styles.detailValue}>
                    {bookDetail.reviewAverage}点 ({bookDetail.reviewCount}件)
                  </Text>
                </View>
              )}
            </View>
            
            {bookDetail.itemUrl && (
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  coverImage: {
    width: 200,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  bookInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  author: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  summarySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  summaryContainer: {
    maxHeight: 150,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    width: 80,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  urlButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  urlButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetailScreen;
