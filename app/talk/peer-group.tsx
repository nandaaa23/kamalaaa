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
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
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

interface GroupMember {
  id: string;
  displayName: string;
  photoURL?: string | null;
  city?: string;
  isOnline: boolean;
  lastSeen?: string;
}

const PeerGroupChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    id: string;
    displayName: string;
    photoURL?: string | null;
    city?: string;
  } | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const currentUser = auth.currentUser;
  const PEER_GROUP_ID = 'mothers_peer_support_group';

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Error', 'No authenticated user found');
      return;
    }

    const checkUserRole = async () => {
      try {
        const motherDoc = await getDoc(doc(db, 'mothers', currentUser.uid));
        if (!motherDoc.exists()) {
          Alert.alert('Access Denied', 'This group is only for mothers.', [
            { text: 'OK', onPress: () => router.back() }
          ]);
          return;
        }
        
        const userData = motherDoc.data();
        setCurrentUserProfile({
          id: currentUser.uid,
          displayName: userData.profile?.displayName || userData.name || 'Anonymous',
          photoURL: userData.profile?.photoURL || null,
          city: userData.profile?.city
        });
      } catch (error) {
        console.error('Error checking user role:', error);
        Alert.alert('Error', 'Failed to verify access');
      }
    };

    checkUserRole();

    const newSocket = io('http://your-server-ip:3000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUserProfile) return;

    const messagesRef = collection(db, 'peerGroups', PEER_GROUP_ID, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
      const loadedMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar || null,
          isMe: data.senderId === currentUser.uid,
          time: data.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
          type: data.type || 'text',
          timestamp: data.timestamp
        });
      });
      setMessages(loadedMessages);
      scrollToBottom();
    });

    const mothersRef = collection(db, 'mothers');
    const unsubscribeMembers = onSnapshot(mothersRef, (querySnapshot) => {
      const members: GroupMember[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        members.push({
          id: doc.id,
          displayName: data.profile?.displayName || data.name || 'Anonymous',
          photoURL: data.profile?.photoURL || null,
          city: data.profile?.city,
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen
        });
      });
      setGroupMembers(members.filter(member => member.id !== currentUser.uid));
      setLoading(false);
    });

    if (socket) {
      socket.emit('join-peer-group', {
        groupId: PEER_GROUP_ID,
        userId: currentUser.uid,
        userName: currentUserProfile.displayName
      });

      const handleGroupTyping = (data: { senderId: string; userName: string; groupId: string }) => {
        if (data.senderId !== currentUser.uid && data.groupId === PEER_GROUP_ID) {
          setTypingUsers(prev => [...new Set([...prev, data.userName])]);
        }
      };

      const handleGroupStopTyping = (data: { senderId: string; userName: string; groupId: string }) => {
        if (data.senderId !== currentUser.uid && data.groupId === PEER_GROUP_ID) {
          setTypingUsers(prev => prev.filter(user => user !== data.userName));
        }
      };

      socket.on('group-typing', handleGroupTyping);
      socket.on('group-stop-typing', handleGroupStopTyping);

      return () => {
        unsubscribeMessages();
        unsubscribeMembers();
        socket.emit('leave-peer-group', {
          groupId: PEER_GROUP_ID,
          userId: currentUser.uid
        });
        socket.off('group-typing', handleGroupTyping);
        socket.off('group-stop-typing', handleGroupStopTyping);
      };
    }

    return () => {
      unsubscribeMessages();
      unsubscribeMembers();
    };
  }, [socket, currentUser, currentUserProfile]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!currentUser || !currentUserProfile || !message.trim()) return;

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
      const messagesRef = collection(db, 'peerGroups', PEER_GROUP_ID, 'messages');
      
      await addDoc(messagesRef, {
        text: message,
        senderId: currentUser.uid,
        senderName: currentUserProfile.displayName,
        senderAvatar: currentUserProfile.photoURL || null,
        timestamp: serverTimestamp(),
        type: 'text'
      });

      if (socket) {
        socket.emit('group-stop-typing', {
          groupId: PEER_GROUP_ID,
          senderId: currentUser.uid,
          userName: currentUserProfile.displayName
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
    if (!socket || !currentUser || !currentUserProfile) return;
    
    setMessage(text);
    
    if (text.trim()) {
      socket.emit('group-typing', {
        groupId: PEER_GROUP_ID,
        senderId: currentUser.uid,
        userName: currentUserProfile.displayName
      });
    } else {
      socket.emit('group-stop-typing', {
        groupId: PEER_GROUP_ID,
        senderId: currentUser.uid,
        userName: currentUserProfile.displayName
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
          <Text style={styles.senderName}>{item.senderName}</Text>
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.isMe ? styles.myMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={item.isMe ? styles.myMessageText : styles.otherMessageText}>
          {item.text}
        </Text>
        <Text style={item.isMe ? styles.myMessageTime : styles.otherMessageTime}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  const renderGroupHeader = () => (
    <View style={styles.groupHeaderContainer}>
      <View style={styles.groupIconContainer}>
        <Ionicons name="people" size={24} color="white" />
      </View>
      <View style={styles.groupHeaderText}>
        <Text style={styles.groupTitle}>Mother's Peer Support</Text>
        <Text style={styles.groupSubtitle}>
          {groupMembers.length + 1} members • Safe space for mothers
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.infoButton}
       // onPress={() => router.push('/group-info')}
      >
        <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    const typingText = typingUsers.length === 1 
      ? `${typingUsers[0]} is typing...`
      : `${typingUsers.slice(0, 2).join(' and ')} are typing...`;

    return (
      <View style={styles.typingIndicator}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.typingText}>{typingText}</Text>
      </View>
    );
  };

  if (loading || !currentUserProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading peer group...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderGroupHeader()}

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
          ListHeaderComponent={() => (
            <View style={styles.welcomeMessage}>
              <Text style={styles.welcomeText}>
                🌸 Welcome to the Mother's Peer Support Group
              </Text>
              <Text style={styles.welcomeSubtext}>
                Share your experiences, ask questions, and support each other on this beautiful journey of motherhood.
              </Text>
            </View>
          )}
          ListFooterComponent={renderTypingIndicator}
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
            placeholder="Share with the group..."
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
    backgroundColor: '#f8f9fa',
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
  groupHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: Colors.background,
    marginTop:24
  },
  groupIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupHeaderText: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  groupSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoButton: {
    padding: 8,
  },
  messagesContainer: {
    padding: 15,
  },
  welcomeMessage: {
    backgroundColor: Colors.mintCream,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
    color: Colors.textSecondary,
    marginTop: 4,
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
    marginBottom:34
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
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

export default PeerGroupChatScreen;