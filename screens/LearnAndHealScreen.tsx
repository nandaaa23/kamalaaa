import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';

export const LearnAndHealScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { user } = useAuth();

  if (user?.isGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.lockedScreen}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Join Kamala to Learn & Heal</Text>
          <Text style={styles.lockDescription}>
            Access expert articles, videos, and resources on emotional recovery, nutrition, relationships, and stress management.
          </Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Kamala</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const categories = [
    { key: 'all', label: 'All Topics', icon: '📚' },
    { key: 'emotional', label: 'Emotional Recovery', icon: '💙' },
    { key: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { key: 'relationships', label: 'Relationships', icon: '💕' },
    { key: 'stress', label: 'Stress Management', icon: '🧘‍♀️' },
    { key: 'physical', label: 'Physical Recovery', icon: '🌱' },
  ];

  const articles = [
    {
      id: '1',
      title: 'Understanding Postpartum Depression: You\'re Not Alone',
      category: 'emotional',
      type: 'article',
      duration: '8 min read',
      author: 'Dr. Priya Sharma',
      description: 'Learn about the signs, symptoms, and treatment options for postpartum depression.',
      color: Colors.mistyRose,
    },
    {
      id: '2',
      title: 'Nutrition for New Mothers: Healing from Within',
      category: 'nutrition',
      type: 'video',
      duration: '12 min watch',
      author: 'Nutritionist Meera Patel',
      description: 'Essential nutrients and meal planning for postpartum recovery.',
      color: Colors.honeydew,
    },
    {
      id: '3',
      title: 'Communicating with Your Partner During Postpartum',
      category: 'relationships',
      type: 'article',
      duration: '6 min read',
      author: 'Counselor Anjali Gupta',
      description: 'How to maintain healthy communication when everything feels overwhelming.',
      color: Colors.lightCyan,
    },
    {
      id: '4',
      title: 'Breathing Techniques for Anxiety Relief',
      category: 'stress',
      type: 'video',
      duration: '5 min practice',
      author: 'Yoga Instructor Kavya Nair',
      description: 'Simple breathing exercises you can do anywhere, anytime.',
      color: Colors.mintGreen,
    },
    {
      id: '5',
      title: 'Physical Recovery: What to Expect Week by Week',
      category: 'physical',
      type: 'article',
      duration: '10 min read',
      author: 'Dr. Sunita Reddy',
      description: 'A comprehensive guide to physical healing after childbirth.',
      color: Colors.pinkLavender1,
    },
    {
      id: '6',
      title: 'Building Your Support Network',
      category: 'emotional',
      type: 'article',
      duration: '7 min read',
      author: 'Therapist Ritu Jain',
      description: 'How to identify and nurture relationships that support your healing.',
      color: Colors.linen,
    },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Learn & Heal</Text>
        <Text style={styles.subtitle}>
          Expert guidance for your recovery journey
        </Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles, videos..."
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
        {filteredArticles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No articles found. Try adjusting your search or category.
            </Text>
          </View>
        ) : (
          filteredArticles.map((article) => (
            <TouchableOpacity key={article.id} style={[styles.articleCard, { backgroundColor: article.color }]}>
              <View style={styles.articleHeader}>
                <View style={styles.articleMeta}>
                  <Text style={styles.articleType}>
                    {article.type === 'video' ? '🎥' : '📄'} {article.type.toUpperCase()}
                  </Text>
                  <Text style={styles.articleDuration}>{article.duration}</Text>
                </View>
              </View>
              
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleDescription}>{article.description}</Text>
              
              <View style={styles.articleFooter}>
                <Text style={styles.articleAuthor}>By {article.author}</Text>
                <TouchableOpacity style={styles.readButton}>
                  <Text style={styles.readButtonText}>
                    {article.type === 'video' ? 'Watch' : 'Read'} →
                  </Text>
                </TouchableOpacity>
              </View>
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
  articleCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  articleHeader: {
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleType: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.jet,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  articleDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 8,
    lineHeight: 24,
  },
  articleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  readButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.jet,
  },
});