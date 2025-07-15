import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';

export const ListenInScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { user } = useAuth();

  if (user?.isGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.lockedScreen}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Join Kamala to Listen-In</Text>
          <Text style={styles.lockDescription}>
            Access curated podcasts, maternal stories, and grounding audio content designed for your healing journey.
          </Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Kamala</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const categories = [
    { key: 'all', label: 'All Audio', icon: '🎧' },
    { key: 'podcasts', label: 'Podcasts', icon: '🎙️' },
    { key: 'stories', label: 'Stories', icon: '📖' },
    { key: 'meditation', label: 'Meditation', icon: '🧘‍♀️' },
    { key: 'music', label: 'Healing Music', icon: '🎵' },
  ];

  const audioContent = [
    {
      id: '1',
      title: 'The Postpartum Stress Center Podcast',
      category: 'podcasts',
      duration: '45 min',
      host: 'Dr. Karen Kleiman',
      description: 'Expert insights on postpartum mental health and recovery strategies.',
      color: Colors.mistyRose,
      episode: 'Episode 12: Finding Your Voice Again',
    },
    {
      id: '2',
      title: 'A Mother\'s Journey: Priya\'s Story',
      category: 'stories',
      duration: '18 min',
      host: 'Kamala Community',
      description: 'Real stories from mothers who have walked this path before you.',
      color: Colors.lightCyan,
      episode: 'From darkness to light: One mother\'s healing',
    },
    {
      id: '3',
      title: 'Guided Body Scan for New Mothers',
      category: 'meditation',
      duration: '12 min',
      host: 'Meditation Guide Sita',
      description: 'Gentle body awareness practice for physical and emotional healing.',
      color: Colors.mintGreen,
      episode: 'Reconnecting with your body after birth',
    },
    {
      id: '4',
      title: 'Lullabies for Healing Hearts',
      category: 'music',
      duration: '30 min',
      host: 'Composer Ravi Shankar',
      description: 'Soothing instrumental music designed for maternal wellness.',
      color: Colors.honeydew,
      episode: 'Traditional ragas for peace and calm',
    },
    {
      id: '5',
      title: 'Mom & Baby Podcast',
      category: 'podcasts',
      duration: '35 min',
      host: 'Dr. Shilpa Mehta',
      description: 'Practical advice for navigating early motherhood challenges.',
      color: Colors.pinkLavender1,
      episode: 'Episode 8: When bonding feels difficult',
    },
    {
      id: '6',
      title: 'Breathing Space: A Meditation Series',
      category: 'meditation',
      duration: '8 min',
      host: 'Mindfulness Teacher Asha',
      description: 'Quick meditation practices for busy mothers.',
      color: Colors.linen,
      episode: 'Session 3: Finding calm in chaos',
    },
  ];

  const filteredContent = audioContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.episode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || content.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlayPause = (contentId: string) => {
    if (currentlyPlaying === contentId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(contentId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Listen-In</Text>
        <Text style={styles.subtitle}>
          Podcasts, stories, and sounds for your healing journey
        </Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search podcasts, stories..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <View style={styles.categories}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                activeCategory === category.key && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory(category.key)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                activeCategory === category.key && styles.activeCategoryText,
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={styles.content}>
        {filteredContent.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No audio content found. Try adjusting your search or category.
            </Text>
          </View>
        ) : (
          filteredContent.map((content) => (
            <TouchableOpacity key={content.id} style={[styles.contentCard, { backgroundColor: content.color }]}>
              <View style={styles.contentHeader}>
                <View style={styles.playButton}>
                  <TouchableOpacity
                    style={styles.playButtonInner}
                    onPress={() => handlePlayPause(content.id)}
                  >
                    <Text style={styles.playButtonText}>
                      {currentlyPlaying === content.id ? '⏸️' : '▶️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle}>{content.title}</Text>
                  <Text style={styles.contentEpisode}>{content.episode}</Text>
                  <Text style={styles.contentMeta}>
                    {content.host} • {content.duration}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.contentDescription}>{content.description}</Text>
              
              {currentlyPlaying === content.id && (
                <View style={styles.playerControls}>
                  <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                  </View>
                  <View style={styles.playerButtons}>
                    <TouchableOpacity style={styles.controlButton}>
                      <Text style={styles.controlButtonText}>⏮️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton}>
                      <Text style={styles.controlButtonText}>⏯️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton}>
                      <Text style={styles.controlButtonText}>⏭️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  lockedScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.jet,
    marginBottom: 12,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.jet,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCategoryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: Colors.jet,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contentCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playButton: {
    marginRight: 16,
  },
  playButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playButtonText: {
    fontSize: 20,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 4,
    lineHeight: 24,
  },
  contentEpisode: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  contentMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contentDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  playerControls: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    width: '30%',
    backgroundColor: Colors.jet,
    borderRadius: 2,
  },
  playerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  controlButtonText: {
    fontSize: 20,
  },
});