import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome, Entypo } from '@expo/vector-icons';
import io, { Socket } from 'socket.io-client';
import { auth, db } from '../../firebase/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { Colors } from '../../constants/Colors';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  isMe: boolean;
  time: string;
  type: 'text' | 'image' | 'voice';
  timestamp: any;
}

interface UserProfile {
  id: string;
  displayName: string;
  photoURL?: string | null;
  role: 'mother' | 'psychologist';
  specialization?: string;
  city?: string;
}

const ChatScreen = () => {
  const { id: recipientId } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    id: string;
    displayName: string;
    photoURL?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const currentUser = auth.currentUser;

  const getChatRoomId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
  };

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Error', 'No authenticated user found');
      return;
    }

    // Load current user profile
    const loadCurrentUserProfile = async () => {
      try {
        const [motherDoc, psychologistDoc] = await Promise.all([
          getDoc(doc(db, 'mothers', currentUser.uid)),
          getDoc(doc(db, 'psychologists', currentUser.uid))
        ]);

        if (motherDoc.exists()) {
          setCurrentUserProfile({
            id: currentUser.uid,
            displayName: motherDoc.data().profile?.displayName || motherDoc.data().name || 'You',
            photoURL: motherDoc.data().profile?.photoURL || null
          });
        } else if (psychologistDoc.exists()) {
          setCurrentUserProfile({
            id: currentUser.uid,
            displayName: psychologistDoc.data().profile?.displayName || psychologistDoc.data().name || 'You',
            photoURL: psychologistDoc.data().profile?.photoURL || null
          });
        }
      } catch (error) {
        console.error('Error loading current user profile:', error);
      }
    };

    loadCurrentUserProfile();

    const newSocket = io('http://your-server-ip:3000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    const fetchUserData = async () => {
      try {
        const [motherDoc, psychologistDoc] = await Promise.all([
          getDoc(doc(db, 'mothers', recipientId as string)),
          getDoc(doc(db, 'psychologists', recipientId as string))
        ]);

        if (motherDoc.exists()) {
          setOtherUser({
            id: motherDoc.id,
            displayName: motherDoc.data().profile?.displayName || motherDoc.data().name || 'Anonymous',
            photoURL: motherDoc.data().profile?.photoURL || null,
            role: 'mother',
            city: motherDoc.data().profile?.city
          });
        } else if (psychologistDoc.exists()) {
          setOtherUser({
            id: psychologistDoc.id,
            displayName: psychologistDoc.data().profile?.displayName || psychologistDoc.data().name || 'Anonymous',
            photoURL: psychologistDoc.data().profile?.photoURL || null,
            role: 'psychologist',
            specialization: psychologistDoc.data().profile?.specialization,
            city: psychologistDoc.data().profile?.city
          });
        } else {
          Alert.alert('Error', 'User not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [currentUser, recipientId]);

  useEffect(() => {
    if (!currentUser || !otherUser || !currentUserProfile) return;

    const chatRoomId = getChatRoomId(currentUser.uid, otherUser.id);
    const messagesRef = collection(db, 'chats', chatRoomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loadedMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName || (data.senderId === currentUser.uid ? currentUserProfile.displayName : otherUser.displayName),
          senderAvatar: data.senderAvatar || (data.senderId === currentUser.uid ? currentUserProfile.photoURL : otherUser.photoURL),
          isMe: data.senderId === currentUser.uid,
          time: data.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
          type: data.type || 'text',
          timestamp: data.timestamp
        });
      });
      setMessages(loadedMessages);
      scrollToBottom();
    });

    if (socket) {
      socket.emit('register-user', currentUser.uid);
      
      const handleTyping = (data: { senderId: string; userName: string }) => {
        if (data.senderId === otherUser.id) {
          setTypingUser(data.userName);
          setIsTyping(true);
        }
      };

      const handleStopTyping = (data: { senderId: string }) => {
        if (data.senderId === otherUser.id) {
          setIsTyping(false);
        }
      };

      socket.on('typing', handleTyping);
      socket.on('stop-typing', handleStopTyping);

      return () => {
        unsubscribe();
        socket.off('typing', handleTyping);
        socket.off('stop-typing', handleStopTyping);
      };
    }

    return () => unsubscribe();
  }, [socket, currentUser, otherUser, currentUserProfile]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!currentUser || !otherUser || !currentUserProfile || !message.trim()) return;

    const tempId = `${currentUser.uid}_${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      text: message,
      senderId: currentUser.uid,
      senderName: currentUserProfile.displayName,
      senderAvatar: currentUserProfile.photoURL || null,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      timestamp: null
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    try {
      const chatRoomId = getChatRoomId(currentUser.uid, otherUser.id);
      const messagesRef = collection(db, 'chats', chatRoomId, 'messages');
      
      await addDoc(messagesRef, {
        text: message,
        senderId: currentUser.uid,
        senderName: currentUserProfile.displayName,
        senderAvatar: currentUserProfile.photoURL || null,
        timestamp: serverTimestamp(),
        type: 'text'
      });

      if (socket) {
        socket.emit('stop-typing', {
          senderId: currentUser.uid,
          recipientId: otherUser.id
        });
      }

      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleTyping = (text: string) => {
    if (!socket || !currentUser || !otherUser || !currentUserProfile) return;
    
    setMessage(text);
    
    if (text.trim()) {
      socket.emit('typing', {
        senderId: currentUser.uid,
        recipientId: otherUser.id,
        userName: currentUserProfile.displayName
      });
    } else {
      socket.emit('stop-typing', {
        senderId: currentUser.uid,
        recipientId: otherUser.id
      });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isMe ? styles.myMessageContainer : styles.otherMessageContainer
    ]}>
      {!item.isMe && (
        <View style={styles.senderInfo}>
          {item.senderAvatar ? (
            <Image
              source={{ uri: item.senderAvatar }}
              style={styles.messageProfileImage}
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>
                {item.senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.isMe ? styles.myMessageBubble : styles.otherMessageBubble
      ]}>
        {!item.isMe && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <Text style={item.isMe ? styles.myMessageText : styles.otherMessageText}>
          {item.text}
        </Text>
        <Text style={item.isMe ? styles.myMessageTime : styles.otherMessageTime}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  if (loading || !otherUser || !currentUserProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {otherUser.photoURL ? (
          <Image 
            source={{ uri: otherUser.photoURL }} 
            style={styles.profileImage} 
          />
        ) : (
          <View style={styles.defaultHeaderAvatar}>
            <Text style={styles.defaultHeaderAvatarText}>
              {otherUser.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.userName}>{otherUser.displayName}</Text>
          <Text style={styles.status}>
            {isTyping ? `${typingUser} is typing...` : 'Online'}
          </Text>
          {otherUser.specialization && (
            <Text style={styles.specialization}>{otherUser.specialization}</Text>
          )}
          {otherUser.city && <Text style={styles.city}>{otherUser.city}</Text>}
        </View>
        <View style={styles.callButtons}>
          <TouchableOpacity style={styles.callButton}>
            <FontAwesome name="phone" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton}>
            <FontAwesome name="video-camera" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          ListFooterComponent={
            isTyping && !typingUser.includes(currentUserProfile.displayName) ? (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>{typingUser} is typing...</Text>
              </View>
            ) : null
          }
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.emojiButton}>
            <Entypo name="emoji-happy" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            value={message}
            onChangeText={handleTyping}
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textSecondary}
            multiline
          />
          <TouchableOpacity style={styles.voiceButton}>
            <MaterialIcons name="keyboard-voice" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={sendMessage} 
            style={styles.sendButton}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: Colors.background,
    marginTop: 22
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  defaultHeaderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  defaultHeaderAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  status: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  specialization: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  city: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  callButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  callButton: {
    backgroundColor: '#5ad',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    maxWidth: '85%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderInfo: {
    marginRight: 8,
    alignItems: 'center',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 4,
  },
  messageProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  myMessageText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 20,
  },
  otherMessageText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  otherMessageTime: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 34
  },
  emojiButton: {
    padding: 8,
  },
  voiceButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 8,
    maxHeight: 100,
    backgroundColor: '#FFFFFF',
    color: Colors.text,
  },
  sendButton: {
    backgroundColor: '#5ad',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
  },
  typingText: {
    marginLeft: 8,
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default ChatScreen;