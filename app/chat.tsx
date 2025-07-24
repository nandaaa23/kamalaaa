import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../app/src/i18n/i18n';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  detectedLanguage?: string;
  isEmergency?: boolean;
  isError?: boolean;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

  const API_BASE_URL = 'http://192.168.137.82:5000';

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      
      let storedSessionId = await AsyncStorage.getItem('chatSessionId');
      if (!storedSessionId) {
        storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('chatSessionId', storedSessionId);
      }
      setSessionId(storedSessionId);

      const welcomeMessage: Message = {
        id: 'welcome_' + Date.now(),
        text:i18n.t('first'),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([welcomeMessage]);

    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: 'user_' + Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput,
          session_id: sessionId,
          user_name: undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const botMessage: Message = {
          id: 'bot_' + Date.now(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          detectedLanguage: data.detected_language,
          isEmergency: data.is_emergency
        };

        setMessages(prev => [...prev, botMessage]);
        if (data.is_emergency) {
          Alert.alert(
            i18n.t('emergencyTitle'), 
            i18n.t('emergencyMessage'), 
            [
              {
                text: i18n.t('ok'), 
                style: 'default',
              },
            ]
          );
        }
        
      } else {
        throw new Error(data.error || 'Failed to get response');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: 'error_' + Date.now(),
        text:i18n.t('botr'),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        Alert.alert('Connection Success', 'Backend is running properly!');
      } else {
        Alert.alert('Connection Failed', 'Backend is not responding correctly.');
      }
    } catch (error) {
      Alert.alert('Connection Failed', `Cannot reach backend at ${API_BASE_URL}. Make sure it is running.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{i18n.t('bottitle')}</Text>
          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === 'user' ? styles.userMessage : styles.botMessage,
                message.isEmergency && styles.emergencyMessage,
                message.isError && styles.errorMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                message.isEmergency && styles.emergencyText
              ]}>
                {message.text}
              </Text>
              <View style={styles.messageFooter}>
                <Text style={styles.timestamp}>{message.timestamp}</Text>
                {message.detectedLanguage && (
                  <Text style={styles.languageTag}>
                    {message.detectedLanguage}
                  </Text>
                )}
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{i18n.t('bottype')}</Text>
              <View style={styles.typingIndicator}>
                <Text style={styles.dot}>●</Text>
                <Text style={styles.dot}>●</Text>
                <Text style={styles.dot}>●</Text>
              </View>
            </View>
          )}
        </ScrollView>

        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={i18n.t('botsay')}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            <Text style={styles.sendButtonText}>{i18n.t('send')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#E8B4CB',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#E8B4CB',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  emergencyMessage: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 2,
  },
  errorMessage: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  emergencyText: {
    color: '#d32f2f',
    fontWeight: '500',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  languageTag: {
    fontSize: 10,
    color: '#888',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  loadingContainer: {
    padding: 15,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  typingIndicator: {
    flexDirection: 'row',
  },
  dot: {
    fontSize: 20,
    color: '#E8B4CB',
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#E8B4CB',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
