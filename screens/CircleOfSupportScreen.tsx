import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { Colors } from '../constants/Colors';

const socket = io('http://192.168.1.2:3000');

type User = {
  id: string;
  name: string;
  role: 'psychologist' | 'mom';
  specialization?: string;
  status: 'online' | 'offline';
};

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
};

export default function CircleOfSupportScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const currentUserId = 'current_user'; 

  useEffect(() => {
    setUsers([
      { 
        id: '1', 
        name: 'Dr. Nisha Patel', 
        role: 'psychologist',
        specialization: 'Postpartum Mental Health',
        status: 'online'
      },
      { 
        id: '2', 
        name: 'Aarti Sharma', 
        role: 'mom',
        status: 'online'
      },
      { 
        id: '3', 
        name: 'Rina Gupta', 
        role: 'mom',
        status: 'offline'
      },
    ]);
  }, []);

  useEffect(() => {
    const handleMessage = (data: Message) => {
      if (
        selectedUser &&
        (data.senderId === selectedUser.id || data.receiverId === selectedUser.id)
      ) {
        setMessages((prev) => [...prev, data]);
        saveMessagesToStorage(selectedUser.id, [...messages, data]);
      }
    };

    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message', handleMessage);
    };
  }, [selectedUser, messages]);


  const loadMessagesFromStorage = async (userId: string) => {
    try {
      const storedMessages = await AsyncStorage.getItem(`messages_${currentUserId}_${userId}`);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const saveMessagesToStorage = async (userId: string, messagesToSave: Message[]) => {
    try {
      await AsyncStorage.setItem(
        `messages_${currentUserId}_${userId}`, 
        JSON.stringify(messagesToSave)
      );
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setIsLoading(true);
    await loadMessagesFromStorage(user.id);
    setIsLoading(false);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (selectedUser && message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: currentUserId,
        receiverId: selectedUser.id,
        content: message.trim(),
        timestamp: new Date(),
        status: 'sent'
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      await saveMessagesToStorage(selectedUser.id, updatedMessages);
      
      socket.emit('send_message', newMessage);
      setMessage('');
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.senderId === currentUserId ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={[
        styles.messageText,
        item.senderId === currentUserId ? styles.myMessageText : styles.theirMessageText
      ]}>
        {item.content}
      </Text>
      <Text style={[
        styles.timestamp,
        item.senderId === currentUserId ? styles.myTimestamp : styles.theirTimestamp
      ]}>
        {formatTime(item.timestamp)}
      </Text>
    </View>
  );

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserSelect(item)}
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={[
            styles.statusDot, 
            item.status === 'online' ? styles.onlineStatus : styles.offlineStatus
          ]} />
        </View>
        <Text style={styles.userRole}>
          {item.role === 'psychologist' 
            ? item.specialization || 'Licensed Psychologist'
            : 'Community Member'
          }
        </Text>
        <Text style={styles.userStatus}>
          {item.status === 'online' ? 'Available now' : 'Last seen recently'}
        </Text>
      </View>
      <Text style={styles.chatArrow}>💬</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.container}>
          {!selectedUser ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Circle of Support</Text>
                <Text style={styles.subtitle}>
                  Connect with professionals and community members
                </Text>
              </View>
              
              <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={renderUserCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.usersList}
              />
            </>
          ) : (
            <View style={styles.chatContainer}>
              {/* Chat Header */}
              <View style={styles.chatHeader}>
                <TouchableOpacity 
                  onPress={handleBack} 
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                
                <View style={styles.chatUserInfo}>
                  <Text style={styles.chatUserName}>{selectedUser.name}</Text>
                  <Text style={styles.chatUserRole}>
                    {selectedUser.role === 'psychologist' 
                      ? selectedUser.specialization || 'Licensed Psychologist'
                      : 'Community Member'
                    }
                  </Text>
                </View>
                
                <View style={[
                  styles.headerStatusDot,
                  selectedUser.status === 'online' ? styles.onlineStatus : styles.offlineStatus
                ]} />
              </View>

              {/* Messages List */}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={renderMessage}
                  contentContainerStyle={styles.messagesList}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() => 
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                />
              )}

              {/* Input Container */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your message..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  onPress={handleSend} 
                  style={[
                    styles.sendButton,
                    !message.trim() && styles.sendButtonDisabled
                  ]}
                  disabled={!message.trim()}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F5EB',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F5EB',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#323431',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 22,
  },
  usersList: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#323431',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineStatus: {
    backgroundColor: '#22C55E',
  },
  offlineStatus: {
    backgroundColor: '#94A3B8',
  },
  userRole: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    color: '#64748B',
  },
  chatArrow: {
    fontSize: 24,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  backButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  chatUserInfo: {
    flex: 1,
    alignItems: 'center',
  },
  chatUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#323431',
  },
  chatUserRole: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  headerStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessage: {
    backgroundColor: '#EEB6E7',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#323431',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
  },
  theirTimestamp: {
    color: '#94A3B8',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#F7F5EB',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontSize: 16,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#EEB6E7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});