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
import { useAuth } from '../contexts/AuthContext';
import i18n from '../src/i18n/i18n';

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
  const { logout } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentModal, setCurrentModal] = useState<string>('');

  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: i18n.t('defaultName'),
    email: i18n.t('defaultEmail'),
    phone: i18n.t('defaultPhone'),
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
          name: user.name || i18n.t('defaultName'),
          email: user.email || i18n.t('defaultEmail'),
          phone: user.phone || i18n.t('defaultPhone'),
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
      Alert.alert(i18n.t('errorTitle'), i18n.t('saveUserError'));
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
      i18n.t('upgradeTitle'),
      i18n.t('upgradeMessage'),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('upgradeButton'),
          onPress: async () => {
            Alert.alert(i18n.t('success'), i18n.t('premiumWelcome'));
            setIsPremium(true);
            await savePreferences('isPremium', true);
          },
        },        
      ]
    );
  };

  const handlePayments = (): void => {
    Alert.alert(
      i18n.t('paymentMethodsTitle'),
      i18n.t('paymentMethodsSubtitle'),
      [
        { text: i18n.t('viewBillingHistory'), onPress: () => console.log('Billing history') },
        { text: i18n.t('addPaymentMethod'), onPress: () => console.log('Add payment') },
        { text: i18n.t('cancel'), style: 'cancel' },
      ]
    );
  };

  const handleRateUs = async (): Promise<void> => {
    try {
      await Share.share({
        message: i18n.t('share.message') as string,
        title: i18n.t('share.title') as string,
      });
    } catch (error) {
      Alert.alert(
        i18n.t('errorTitle') || 'Error',
        i18n.t('shareErrorMessage') || 'Unable to share at this time'
      );
    }    
  };

  const handleFAQs = (): void => {
    Alert.alert(
      i18n.t('faqTitle') || 'Frequently Asked Questions',
      i18n.t('faqContent') || 'Common questions and answers',
      [{ text: i18n.t('ok') || 'OK' }]
    );    
  };

  const handleContactUs = (): void => {
    Alert.alert(
      i18n.t('contactTitle'),
      i18n.t('contactMessage'),
      [
        {
          text: i18n.t('email'),
          onPress: () => Linking.openURL('mailto:support@kamalaapp.com'),
        },
        {
          text: i18n.t('contactPhone'),
          onPress: () => Linking.openURL('tel:+1234567890'),
        },
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
      ]
    );    
  };

  const handlePrivacyPolicy = (): void => {
    Alert.alert(
      i18n.t('privacyTitle'),
      i18n.t('privacyMessage'),
      [{ text: i18n.t('ok') }]
    );
  };
  
  const handleTermsOfService = (): void => {
    Alert.alert(
      i18n.t('termsTitle'),
      i18n.t('termsMessage'),
      [{ text: i18n.t('ok') }]
    );
  };
  
  const handleSettings = (): void => {
    setCurrentModal('settings');
    setModalVisible(true);
  };

  const handleLogout = (): void => {
    Alert.alert(
      i18n.t('logoutTitle'),
      i18n.t('logoutMessage'),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('logoutConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };
  
  const sections: Section[] = [
    {
      title: i18n.t('profile.personalInfo'),
      data: [
        { 
          icon: <User size={18} color="#666" />, 
          label: i18n.t('profile.account'),
          onPress: handleAccountPress 
        },
        { 
          icon: <Globe size={18} color="#666" />, 
          label: i18n.t('profile.language'),
          onPress: handleLanguagePress 
        },
        { 
          icon: <Bell size={18} color="#666" />, 
          label: i18n.t('profile.notifications'),
          onPress: handleNotificationsPress 
        },
      ],
    },
    {
      title: i18n.t('profile.premiumFeatures'),
      data: [
        { 
          icon: <Crown size={18} color={isPremium ? "#FFD700" : "#666"} />, 
          label: isPremium ? i18n.t('profile.premiumActive') : i18n.t('profile.upgradeToPremium'), 
          onPress: isPremium ? () => Alert.alert(i18n.t('profile.premium'), i18n.t('profile.premiumMessage')) : handleUpgradeToPremium,
        },
        { 
          icon: <CreditCard size={18} color="#666" />, 
          label: i18n.t('profile.payments'),
          onPress: handlePayments 
        },
        { 
          icon: <Star size={18} color="#666" />, 
          label: i18n.t('profile.rateUs'),
          onPress: handleRateUs 
        },
      ],
    },
    {
      title: i18n.t('profile.support'),
      data: [
        { 
          icon: <HelpCircle size={18} color="#666" />, 
          label: i18n.t('profile.faqs'),
          onPress: handleFAQs 
        },
        { 
          icon: <Mail size={18} color="#666" />, 
          label: i18n.t('profile.contactUs'),
          onPress: handleContactUs 
        },
        { 
          icon: <Shield size={18} color="#666" />, 
          label: i18n.t('profile.privacyPolicy'),
          onPress: handlePrivacyPolicy 
        },
        { 
          icon: <FileText size={18} color="#666" />, 
          label: i18n.t('profile.termsOfService'),
          onPress: handleTermsOfService 
        },
      ],
    },
    {
      title: i18n.t('profile.general'),
      data: [
        { 
          icon: <Settings size={18} color="#666" />, 
          label: i18n.t('profile.settings'),
          onPress: handleSettings 
        },
        { 
          icon: <LogOut size={18} color="#e74c3c" />, 
          label: i18n.t('profile.logout'),
          onPress: handleLogout 
        },
      ],
    },
  ];

  const renderModalContent = (): ReactElement | null => {
    switch (currentModal) {
      case 'account':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('modals.account.title')}</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{i18n.t('modals.account.name')}</Text>
              <TextInput
                style={styles.input}
                value={userInfo.name}
                onChangeText={(text) => setUserInfo({...userInfo, name: text})}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{i18n.t('modals.account.email')}</Text>
              <TextInput
                style={styles.input}
                value={userInfo.email}
                onChangeText={(text) => setUserInfo({...userInfo, email: text})}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{i18n.t('modals.account.phone')}</Text>
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
                Alert.alert(
                  i18n.t('common.success'), 
                  i18n.t('modals.account.updateSuccess')
                );
                setModalVisible(false);
              }}
            >
              <Text style={styles.saveButtonText}>{i18n.t('common.saveChanges')}</Text>
            </TouchableOpacity>
          </View>
        );
  
      case 'language':

      const languages = [
        { code: 'en', name: i18n.t('languagess.english') },
        { code: 'ml', name: i18n.t('languagess.malayalam') },
        { code: 'es', name: i18n.t('languagess.spanish') },
        { code: 'fr', name: i18n.t('languagess.french') }
      ];
        
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('modals.language.title')}</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.languageOption, selectedLanguage === lang.code && styles.selectedLanguage]}
                onPress={async () => {
                  setSelectedLanguage(lang.code);
                  await savePreferences('selectedLanguage', lang.code);
                  Alert.alert(
                    i18n.t('modals.language.changed'),
                    i18n.t('modals.language.setTo', { language: lang.name })
                  );
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.languageText, selectedLanguage === lang.code && styles.selectedLanguageText]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
  
      case 'notifications':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('modals.notifications.title')}</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{i18n.t('modals.notifications.push')}</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (value) => {
                  setNotificationsEnabled(value);
                  await savePreferences('notificationsEnabled', value);
                  Alert.alert(
                    i18n.t('common.updated'),
                    value ? i18n.t('modals.notifications.pushEnabled') 
                          : i18n.t('modals.notifications.pushDisabled')
                  );
                }}
              />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{i18n.t('modals.notifications.email')}</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{i18n.t('modals.notifications.sms')}</Text>
              <Switch value={false} onValueChange={() => {}} />
            </View>
          </View>
        );
  
      case 'settings':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('modals.settings.title')}</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{i18n.t('modals.settings.darkMode')}</Text>
              <Switch value={false} onValueChange={() => {}} />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{i18n.t('modals.settings.autoSync')}</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{i18n.t('modals.settings.offlineMode')}</Text>
              <Switch value={false} onValueChange={() => {}} />
            </View>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => {
                Alert.alert(
                  i18n.t('modals.settings.clearCache'),
                  i18n.t('modals.settings.clearCacheConfirm'),
                  [
                    { 
                      text: i18n.t('common.cancel'), 
                      style: 'cancel' 
                    },
                    { 
                      text: i18n.t('common.clear'), 
                      onPress: () => Alert.alert(
                        i18n.t('common.success'), 
                        i18n.t('modals.settings.cacheCleared')
                      ) 
                    },
                  ]
                );
              }}
            >
              <Text style={styles.dangerButtonText}>{i18n.t('modals.settings.clearCache')}</Text>
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

      <Text style={styles.header}>{i18n.t('profile.title')}</Text>
      
      {isPremium && (
        <View style={styles.premiumBadge}>
          <Crown size={16} color="#FFD700" />
          <Text style={styles.premiumText}>{i18n.t('profile.premiumBadge')}</Text>
        </View>
      )}

      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.data.map((item, i) => (
            <TouchableOpacity key={i} style={styles.item} onPress={item.onPress}>
              <View style={styles.itemContent}>
                <View style={styles.icon}>{item.icon}</View>
                <Text style={[styles.label, item.label === i18n.t('profile.logout') && styles.logoutText]}>
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
                {renderModalContent()}
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