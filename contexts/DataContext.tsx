import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MoodEntry,
  Reflection,
  Secret,
  HeartbeatMoment,
  ForumPost,
} from '../types';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from './AuthContext';

type Podcast = {
  id: string;
  title: string;
  description: string;
  url: string;
};

interface DataContextType {
  moodEntries: MoodEntry[];
  reflections: Reflection[];
  secrets: Secret[];
  heartbeatMoments: HeartbeatMoment[];
  forumPosts: ForumPost[];
  podcasts: Podcast[];
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

const containsRiskWords = (text: string) => {
  const riskWords = ['suicide', 'harm', 'kill', 'end my life', 'hurt myself'];
  return riskWords.some((word) =>
    text.toLowerCase().includes(word.toLowerCase())
  );
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [heartbeatMoments, setHeartbeatMoments] = useState<HeartbeatMoment[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const { user } = useAuth();

  const [podcasts] = useState<Podcast[]>([
    {
      id: '1',
      title: 'Healing After Birth',
      description: 'A mother’s journey through emotional recovery.',
      url: 'https://open.spotify.com/episode/xyz1',
    },
    {
      id: '2',
      title: 'Mental Health & Motherhood',
      description: 'Discussing postpartum wellness and self-care.',
      url: 'https://open.spotify.com/episode/xyz2',
    },
  ]);

  // Firestore listeners for secrets and forum posts
  useEffect(() => {
    const secretsRef = query(collection(db, 'secrets'), orderBy('timestamp', 'desc'));
    const unsubscribeSecrets = onSnapshot(secretsRef, (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Secret[];
      setSecrets(loaded);
    });

    const postsRef = query(collection(db, 'forumPosts'), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(postsRef, (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ForumPost[];
      setForumPosts(loaded);
    });

    return () => {
      unsubscribeSecrets();
      unsubscribePosts();
    };
  }, []);

  const loadData = async () => {
    try {
      const [moods, refs, moments] = await Promise.all([
        AsyncStorage.getItem('moodEntries'),
        AsyncStorage.getItem('reflections'),
        AsyncStorage.getItem('heartbeatMoments'),
      ]);

      if (moods) setMoodEntries(JSON.parse(moods));
      if (refs) setReflections(JSON.parse(refs));
      if (moments) setHeartbeatMoments(JSON.parse(moments));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    if (containsRiskWords(secret.content)) {
      console.warn('Risky secret detected. Not uploading.');
      return;
    }

    try {
      await addDoc(collection(db, 'secrets'), {
        ...secret,
        replies: [],
        userId: user?.id,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to add secret:', err);
    }
  };

  const addForumPost = async (post: Omit<ForumPost, 'id'>) => {
    if (containsRiskWords(post.content)) {
      console.warn('Risky forum post detected. Not uploading.');
      return;
    }

    try {
      await addDoc(collection(db, 'forumPosts'), {
        ...post,
        replies: [],
        userId: user?.id,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to add forum post:', err);
    }
  };

  const addHeartbeatMoment = async (moment: Omit<HeartbeatMoment, 'id'>) => {
    const newMoment = { ...moment, id: Date.now().toString() };
    const updatedMoments = [...heartbeatMoments, newMoment];
    setHeartbeatMoments(updatedMoments);
    await AsyncStorage.setItem('heartbeatMoments', JSON.stringify(updatedMoments));
  };

  const getMoodStreak = () => {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasEntry = moodEntries.some((entry) => entry.date === dateStr);
      if (hasEntry) {
        streak++;
      } else if (i === 0) {
        break;
      }
    }

    return streak;
  };

  const reframeThought = async (thought: string): Promise<string[]> => {
    const reframes = [
      "You're not failing — you're feeling your way through something hard.",
      "This moment is temporary, but your strength is lasting.",
      "You're learning to be gentle with yourself, and that's brave.",
    ];

    return new Promise((resolve) => {
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
        podcasts,
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
