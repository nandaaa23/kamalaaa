import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import i18n from '../src/i18n/i18n';
interface Podcast {
  id: string;
  name: string;
  description: string;
  image: string;
  spotifyUrl: string;
}

const ListenInScreen = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await fetch('http://192.168.1.3:3001/spotify/podcasts');
        const data = await response.json();
        setPodcasts(data);
      } catch (error) {
        console.error('Error fetching podcasts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  const handlePress = (url: string) => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎧 {i18n.t('pod')}</Text>
        <Text style={styles.headerSubtitle}>
          {i18n.t('podcastSubtitle')}
           </Text>

      </View>

      <FlatList
        data={podcasts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePress(item.spotifyUrl)}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
              <Text style={styles.link}>{i18n.t('tapToListen')}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    marginTop:36
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F4DDE3',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
  },
  textContainer: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
  },
  link: {
    marginTop: 6,
    fontSize: 13,
    color: '#1DB954',
    fontWeight: '600',
  },
});

export default ListenInScreen;
