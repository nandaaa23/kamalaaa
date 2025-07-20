import React, { useState, useContext, ReactElement, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  Linking,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  User,
  Globe,
  Bell,
  Star,
  CreditCard,
  HelpCircle,
  Mail,
  Shield,
  FileText,
  LogOut,
  Settings,
  Crown,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

interface SectionItem {
  icon: ReactElement;
  label: string;
  onPress: () => void;
}

interface Section {
  title: string;
  data: SectionItem[];
}

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentModal, setCurrentModal] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async (): Promise<void> => {
    try {
      const savedUserInfo = await AsyncStorage.getItem('userInfo');
      const savedIsPremium = await AsyncStorage.getItem('isPremium');
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      const savedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const userData = await AsyncStorage.getItem('user');

      if (userData) {
        const user = JSON.parse(userData);
        setUserInfo({
          name: user.name || 'User',
          email: user.email || 'user@example.com',
          phone: user.phone || '+1 234 567 8900',
        });
      } else if (savedUserInfo) {
        setUserInfo(JSON.parse(savedUserInfo));
      }
      
      if (savedIsPremium) {
        setIsPremium(JSON.parse(savedIsPremium));
      }
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
      if (savedNotifications) {
        setNotificationsEnabled(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = async (updatedUserInfo: UserInfo): Promise<void> => {
    try {
      await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save user information');
    }
  };

  const savePreferences = async (key: string, value: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const handleBackPress = (): void => {
    router.back();
  };

  const handleAccountPress = (): void => {
    setCurrentModal('account');
    setModalVisible(true);
  };

  const handleLanguagePress = (): void => {
    setCurrentModal('language');
    setModalVisible(true);
  };

  const handleNotificationsPress = (): void => {
    setCurrentModal('notifications');
    setModalVisible(true);
  };

  const handleUpgradeToPremium = (): void => {
    Alert.alert(
      'Upgrade to Premium',
      'Unlock exclusive features with Kamala Premium!\n\n• Ad-free experience\n• Advanced features\n• Priority support\n• Monthly updates',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade - $9.99/month',
          onPress: async () => {
            Alert.alert('Success!', 'Welcome to Kamala Premium!');
            setIsPremium(true);
            await savePreferences('isPremium', true);
          },
        },
      ]
    );
  };

  const handlePayments = (): void => {
    Alert.alert(
      'Payment Methods',
      'Manage your payment methods and billing history.',
      [
        { text: 'View Billing History', onPress: () => console.log('Billing history') },
        { text: 'Add Payment Method', onPress: () => console.log('Add payment') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRateUs = async (): Promise<void> => {
    try {
      await Share.share({
        message: 'Check out Kamala app! It\'s amazing!',
        title: 'Kamala App',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time');
    }
  };

  const handleFAQs = (): void => {
    Alert.alert(
      'Frequently Asked Questions',
      'Common questions and answers:\n\n• How to reset password?\n• How to contact support?\n• How to upgrade account?\n• How to change language?',
      [{ text: 'OK' }]
    );
  };

  const handleContactUs = (): void => {
    Alert.alert(
      'Contact Us',
      'Choose how you\'d like to contact us:',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@kamalaapp.com'),
        },
        {
          text: 'Phone',
          onPress: () => Linking.openURL('tel:+1234567890'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePrivacyPolicy = (): void => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. We collect and use your data to provide the best experience while keeping your information secure.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsOfService = (): void => {
    Alert.alert(
      'Terms of Service',
      'By using Kamala app, you agree to our terms and conditions. Please read them carefully.',
      [{ text: 'OK' }]
    );
  };

  const handleSettings = (): void => {
    setCurrentModal('settings');
    setModalVisible(true);
  };


const handleLogout = (): void => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('🚪 Starting logout process...');

            await AsyncStorage.clear();
            console.log('🧹 Storage cleared');
  
            setTimeout(() => {
              try {
                router.dismissAll?.();
                router.replace('/');
              } catch (navError) {
                console.log('Navigation handled, app will restart');
              }
            }, 100);
            
            console.log('✅ Logout completed');
            
          } catch (error) {
            console.error('❌ Logout error:', error);
            console.log('Logout completed despite error');
          }
        },
      },
    ]
  );
};

  const sections: Section[] = [
    {
      title: 'Personal Info',
      data: [
        { icon: <User size={18} color="#666" />, label: 'Account', onPress: handleAccountPress },
        { icon: <Globe size={18} color="#666" />, label: 'Language', onPress: handleLanguagePress },
        { icon: <Bell size={18} color="#666" />, label: 'Notifications', onPress: handleNotificationsPress },
      ],
    },
    {
      title: 'Premium Features',
      data: [
        { 
          icon: <Crown size={18} color={isPremium ? "#FFD700" : "#666"} />, 
          label: isPremium ? 'Premium Active' : 'Upgrade to Premium', 
          onPress: isPremium ? () => Alert.alert('Premium', 'You are already a premium user!') : handleUpgradeToPremium,
        },
        { icon: <CreditCard size={18} color="#666" />, label: 'Payments', onPress: handlePayments },
        { icon: <Star size={18} color="#666" />, label: 'Rate Us', onPress: handleRateUs },
      ],
    },
    {
      title: 'Support',
      data: [
        { icon: <HelpCircle size={18} color="#666" />, label: 'FAQs', onPress: handleFAQs },
        { icon: <Mail size={18} color="#666" />, label: 'Contact Us', onPress: handleContactUs },
        { icon: <Shield size={18} color="#666" />, label: 'Privacy Policy', onPress: handlePrivacyPolicy },
        { icon: <FileText size={18} color="#666" />, label: 'Terms of Service', onPress: handleTermsOfService },
      ],
    },
    {
      title: 'General',
      data: [
        { icon: <Settings size={18} color="#666" />, label: 'Settings', onPress: handleSettings },
        { icon: <LogOut size={18} color="#e74c3c" />, label: 'Logout', onPress: handleLogout },
      ],
    },
  ];

  const renderModal = (): ReactElement | null => {
    switch (currentModal) {
      case 'account':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Account Information</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={userInfo.name}
                onChangeText={(text) => setUserInfo({...userInfo, name: text})}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={userInfo.email}
                onChangeText={(text) => setUserInfo({...userInfo, email: text})}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={userInfo.phone}
                onChangeText={(text) => setUserInfo({...userInfo, phone: text})}
                keyboardType="phone-pad"
              />
            </View>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={async () => {
                await saveUserData(userInfo);
                Alert.alert('Success', 'Account information updated!');
                setModalVisible(false);
              }}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        );

      case 'language':
        const languages: string[] = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese'];
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.languageOption, selectedLanguage === lang && styles.selectedLanguage]}
                onPress={async () => {
                  setSelectedLanguage(lang);
                  await savePreferences('selectedLanguage', lang);
                  Alert.alert('Language Changed', `Language set to ${lang}`);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.languageText, selectedLanguage === lang && styles.selectedLanguageText]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'notifications':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Push Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (value) => {
                  setNotificationsEnabled(value);
                  await savePreferences('notificationsEnabled', value);
                  Alert.alert('Updated', `Push notifications ${value ? 'enabled' : 'disabled'}`);
                }}
              />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Email Notifications</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>SMS Notifications</Text>
              <Switch value={false} onValueChange={() => {}} />
            </View>
          </View>
        );

      case 'settings':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>App Settings</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Dark Mode</Text>
              <Switch value={false} onValueChange={() => {}} />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Auto-sync</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Offline Mode</Text>
              <Switch value={false} onValueChange={() => {}} />
            </View>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => {
                Alert.alert(
                  'Clear Cache',
                  'This will clear all cached data. Are you sure?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared!') },
                  ]
                );
              }}
            >
              <Text style={styles.dangerButtonText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <ChevronLeft size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.header}>Profile</Text>
      
      {isPremium && (
        <View style={styles.premiumBadge}>
          <Crown size={16} color="#FFD700" />
          <Text style={styles.premiumText}>Premium User</Text>
        </View>
      )}

      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.data.map((item, i) => (
            <TouchableOpacity key={i} style={styles.item} onPress={item.onPress}>
              <View style={styles.itemContent}>
                <View style={styles.icon}>{item.icon}</View>
                <Text style={[styles.label, item.label === 'Logout' && styles.logoutText]}>
                  {item.label}
                </Text>
              </View>
              <ChevronRight size={16} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity 
              style={styles.modalContainer} 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <ScrollView showsVerticalScrollIndicator={false}>
                {renderModal()}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
    padding: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumText: {
    marginLeft: 8,
    color: '#B8860B',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  logoutText: {
    color: '#e74c3c',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalContent: {
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  languageOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguage: {
    backgroundColor: '#007AFF20',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;