import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';
import i18n from '../src/i18n/i18n';
import GuestGuard from '../components/GuestGuard';

export const LearnAndHealScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { user } = useAuth();

  const categories = [
    { key: 'all', label: i18n.t('category_allTopics'), icon: '📚' },
    { key: 'emotional', label: i18n.t('category_emotionalRecovery'), icon: '💙' },
    { key: 'nutrition', label: i18n.t('category_nutrition'), icon: '🥗' },
    { key: 'relationships', label: i18n.t('category_relationships'), icon: '💕' },
    { key: 'stress', label: i18n.t('category_stressManagement'), icon: '🧘‍♀️' },
    { key: 'physical', label: i18n.t('category_physicalRecovery'), icon: '🌱' },
  ];  
  const articles = [
    {
      id: '1',
      title: i18n.t('article_title_1'),
      category: 'emotional',
      type: 'article',
      duration: '8 min read',
      author: 'Dr. Priya Sharma',
      description: '',
      color: Colors.mistyRose,
    },
    {
      id: '2',
      title: i18n.t('article_title_2'),
      category: 'nutrition',
      type: 'video',
      duration: '12 min watch',
      author: 'Nutritionist Meera Patel',
      description: i18n.t('article_desc_2'),
      color: Colors.honeydew,
    },
    {
      id: '3',
      title: i18n.t('article_title_3'),
      category: 'relationships',
      type: 'article',
      duration: '6 min read',
      author: 'Counselor Anjali Gupta',
      description: i18n.t('article_desc_3'),
      color: Colors.lightCyan,
    },
    {
      id: '4',
      title: i18n.t('article_title_4'),
      category: 'stress',
      type: 'video',
      duration: '5 min practice',
      author: 'Yoga Instructor Kavya Nair',
      description: i18n.t('article_desc_4'),
      color: Colors.mintGreen,
    },
    {
      id: '5',
      title: i18n.t('article_title_5'),
      category: 'physical',
      type: 'article',
      duration: '10 min read',
      author: 'Dr. Sunita Reddy',
      description: i18n.t('article_desc_5'),
      color: Colors.pinkLavender1,
    },
    {
      id: '6',
      title: i18n.t('article_title_6'),
      category: 'emotional',
      type: 'article',
      duration: '7 min read',
      author: 'Therapist Ritu Jain',
      description: i18n.t('article_desc_6'),
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
    <GuestGuard>
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
      <Text style={styles.title}>{i18n.t('lnh')}</Text>
        <Text style={styles.subtitle}>
            {i18n.t('recoverySubtitle')}
        </Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder={i18n.t('searchPlaceholder')}
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
           {i18n.t('noArticlesFound')}
           </Text>

          </View>
        ) : (
          filteredArticles.map((article) => (
            <TouchableOpacity key={article.id} style={[styles.articleCard, { backgroundColor: article.color }]}>
              <View style={styles.articleHeader}>
                <View style={styles.articleMeta}>
                <Text style={styles.articleType}>
                 {article.type === 'video' ? '🎥' : '📄'} {i18n.t(article.type)}
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
                  {article.type === 'video' ? i18n.t('watch') : i18n.t('read')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
    </GuestGuard>
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
    marginTop:38,
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