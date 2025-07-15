import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, Reflection, Secret, HeartbeatMoment, ForumPost } from '../types';

interface DataContextType {
  moodEntries: MoodEntry[];
  reflections: Reflection[];
  secrets: Secret[];
  heartbeatMoments: HeartbeatMoment[];
  forumPosts: ForumPost[];
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => Promise<void>;
  addReflection: (reflection: Omit<Reflection, 'id'>) => Promise<void>;
  addSecret: (secret: Omit<Secret, 'id'>) => Promise<void>;
  addHeartbeatMoment: (moment: Omit<HeartbeatMoment, 'id'>) => Promise<void>;
  addForumPost: (post: Omit<ForumPost, 'id'>) => Promise<void>;
  getMoodStreak: () => number;
  reframeThought: (thought: string) => Promise<string[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [heartbeatMoments, setHeartbeatMoments] = useState<HeartbeatMoment[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [moods, refs, secs, moments, posts] = await Promise.all([
        AsyncStorage.getItem('moodEntries'),
        AsyncStorage.getItem('reflections'),
        AsyncStorage.getItem('secrets'),
        AsyncStorage.getItem('heartbeatMoments'),
        AsyncStorage.getItem('forumPosts'),
      ]);

      if (moods) setMoodEntries(JSON.parse(moods));
      if (refs) setReflections(JSON.parse(refs));
      if (secs) setSecrets(JSON.parse(secs));
      if (moments) setHeartbeatMoments(JSON.parse(moments));
      if (posts) setForumPosts(JSON.parse(posts));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addMoodEntry = async (entry: Omit<MoodEntry, 'id'>) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    const updatedEntries = [...moodEntries, newEntry];
    setMoodEntries(updatedEntries);
    await AsyncStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
  };

  const addReflection = async (reflection: Omit<Reflection, 'id'>) => {
    const newReflection = { ...reflection, id: Date.now().toString() };
    const updatedReflections = [...reflections, newReflection];
    setReflections(updatedReflections);
    await AsyncStorage.setItem('reflections', JSON.stringify(updatedReflections));
  };

  const addSecret = async (secret: Omit<Secret, 'id'>) => {
    const newSecret = { 
      ...secret, 
      id: Date.now().toString(),
      replies: [],
      timestamp: Date.now() 
    };
    const updatedSecrets = [...secrets, newSecret];
    setSecrets(updatedSecrets);
    await AsyncStorage.setItem('secrets', JSON.stringify(updatedSecrets));
  };

  const addHeartbeatMoment = async (moment: Omit<HeartbeatMoment, 'id'>) => {
    const newMoment = { ...moment, id: Date.now().toString() };
    const updatedMoments = [...heartbeatMoments, newMoment];
    setHeartbeatMoments(updatedMoments);
    await AsyncStorage.setItem('heartbeatMoments', JSON.stringify(updatedMoments));
  };

  const addForumPost = async (post: Omit<ForumPost, 'id'>) => {
    const newPost = { 
      ...post, 
      id: Date.now().toString(),
      replies: [],
      timestamp: Date.now()
    };
    const updatedPosts = [...forumPosts, newPost];
    setForumPosts(updatedPosts);
    await AsyncStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
  };

  const getMoodStreak = () => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasEntry = moodEntries.some(entry => entry.date === dateStr);
      if (hasEntry) {
        streak++;
      } else if (i === 0) {
        break;
      }
    }
    
    return streak;
  };

  const reframeThought = async (thought: string): Promise<string[]> => {
    // Mock AI reframing - in production, this would call an AI service
    const reframes = [
      "You're not failing — you're feeling your way through something hard.",
      "This moment is temporary, but your strength is lasting.",
      "You're learning to be gentle with yourself, and that's brave.",
    ];
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(reframes.slice(0, 2));
      }, 1000);
    });
  };

  return (
    <DataContext.Provider
      value={{
        moodEntries,
        reflections,
        secrets,
        heartbeatMoments,
        forumPosts,
        addMoodEntry,
        addReflection,
        addSecret,
        addHeartbeatMoment,
        addForumPost,
        getMoodStreak,
        reframeThought,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};