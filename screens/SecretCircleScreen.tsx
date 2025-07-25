import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { BackButton } from '../components/BackButton';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import i18n from '../src/i18n/i18n';
import GuestGuard from '../components/GuestGuard';
import { db } from '../firebase/firebase'; 
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';


export const SecretCircleScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'share' | 'read' | 'my-replies'>('read');
  const [secretText, setSecretText] = useState('');
  const [allowReplies, setAllowReplies] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { secrets, addSecret } = useData();
  const { user } = useAuth();

  const floatAnimation = useSharedValue(0);

  const handleShareSecret = async () => {
    if (!secretText.trim()) return;
  
    addSecret({
      content: secretText,          
      allowReplies: allowReplies,
      replies: [],
      timestamp: Timestamp.now(),
      authorId: user!.id,
    });
  
    floatAnimation.value = withSequence(
      withTiming(-50, { duration: 1000 }),
      withTiming(0, { duration: 0 })
    );
    Alert.alert(i18n.t('sharedTitle'), i18n.t('sharedMessage'));
    setSecretText('');
    setActiveTab('read');
  };
  
  const handleReply = async (secretId: string) => {
  if (!replyText.trim() || !user) return;

  const secret = secrets.find((s) => s.id === secretId);
  if (!secret) return;

  // Prevent replying to your own secret
  if (secret.authorId === user.id) {
    Alert.alert("Not allowed", "You can't reply to your own secret.");
    return;
  }

  const reply = {
    id: Date.now().toString(),
    content: replyText.trim(),
    timestamp: Date.now(),
    authorId: user.id,
  };

  try {
    const secretRef = doc(db, 'secrets', secretId);
    await updateDoc(secretRef, {
      replies: arrayUnion(reply),
    });

    Alert.alert(i18n.t('replySentTitle'), i18n.t('replySentMessage'));
    setReplyText('');
    setReplyingTo(null);
  } catch (error) {
    console.error('Failed to send reply:', error);
    Alert.alert('Error', 'Could not send reply. Please try again.');
  }
};


  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnimation.value }],
  }));

  const tabs = [
    { key: 'read', label: i18n.t('tabReadSecrets'), icon: '👁' },
    { key: 'share', label: i18n.t('tabShareSecret'), icon: '✍' },
    { key: 'my-replies', label: i18n.t('tabMyReplies'), icon: '📩' },
  ];
  
  return (
    <GuestGuard>
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
  <Text style={styles.title}>{i18n.t('secretCircleTitle')}</Text>
  <Text style={styles.subtitle}>{i18n.t('secretCircleSubtitle')}</Text>
</View>


      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'share' && (
          <Animated.View style={[styles.shareSection, animatedStyle]}>
            <Text style={styles.sharePrompt}>
              {i18n.t('sharePrompt')}
             </Text>

            <TextInput
              style={styles.secretInput}
              placeholder={i18n.t('sharePlaceholder')}
              placeholderTextColor={Colors.textSecondary}
              value={secretText}
              onChangeText={setSecretText}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.replyToggle}>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setAllowReplies(!allowReplies)}
              >
                <View style={[styles.checkbox, allowReplies && styles.checkedBox]}>
                  {allowReplies && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.toggleText}>{i18n.t('allowReplies')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.shareButton, !secretText.trim() && styles.disabledButton]}
              onPress={handleShareSecret}
              disabled={!secretText.trim()}
            >
              <Text style={styles.shareButtonText}>{i18n.t('releaseSecret')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {activeTab === 'read' && (
          <View style={styles.secretsList}>
            {secrets.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                 {i18n.t('noSecretsYet')}
                </Text>
 
              </View>
            ) : (
              secrets.map((secret) => (
                <View key={secret.id} style={styles.secretCard}>
                  <Text style={styles.secretContent}>{secret.content}</Text>
                  <View style={styles.secretFooter}>
                    <Text style={styles.secretTime}>
                      {secret.timestamp?.toDate
                      ? new Date(secret.timestamp.toDate()).toLocaleDateString()
                      : '...'}
                    </Text>
                    {secret.allowReplies && secret.authorId !== user?.id &&(
                      <TouchableOpacity
                        style={styles.replyButton}
                        onPress={() => setReplyingTo(secret.id)}
                      >
                        <Text style={styles.replyButtonText}>
                          💙 {i18n.t('sendSupport', { count: secret.replies.length })}
                        
                           </Text>

                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {replyingTo === secret.id && (
                    <View style={styles.replySection}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder={i18n.t('supportivePlaceholder')}
                        placeholderTextColor={Colors.textSecondary}
                        value={replyText}
                        onChangeText={setReplyText}
                        multiline
                      />
                      <View style={styles.replyActions}>
                        <TouchableOpacity
                          style={styles.cancelReply}
                          onPress={() => setReplyingTo(null)}
                        >
                         <Text style={styles.cancelReplyText}>{i18n.t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.sendReply, !replyText.trim() && styles.disabledButton]}
                          onPress={() => handleReply(secret.id)}
                          disabled={!replyText.trim()}
                        >
                         <Text style={styles.sendReplyText}>{i18n.t('send')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'my-replies' && (
          <View style={styles.myRepliesSection}>
            <Text style={styles.myRepliesTitle}>{i18n.t('yourSecretsAndReplies')}</Text>
            {secrets.filter(s => s.replies.length > 0).length === 0 ? (
              <Text style={styles.emptyText}>
              {i18n.t('noRepliesYet')}
            </Text>            
            ) : (
              secrets
                .filter(s => s.replies.length > 0)
                .map((secret) => (
                  <View key={secret.id} style={styles.mySecretCard}>
                    <Text style={styles.mySecretContent}>{secret.content}</Text>
                    <Text style={styles.repliesHeader}>
  {i18n.t('supportiveReplies', { count: secret.replies.length })}
</Text>

                    {secret.replies.map((reply) => (
                      <View key={reply.id} style={styles.replyCard}>
                        <Text style={styles.replyContent}>{reply.content}</Text>
                        <Text style={styles.replyTime}>
                          {new Date(reply.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))
            )}
          </View>
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
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.jet,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shareSection: {
    paddingTop: 20,
  },
  sharePrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 16,
    textAlign: 'center',
  },
  secretInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  replyToggle: {
    marginBottom: 24,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.jet,
    fontSize: 12,
    fontWeight: 'bold',
  },
  toggleText: {
    fontSize: 16,
    color: Colors.text,
  },
  shareButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.jet,
  },
  secretsList: {
    paddingTop: 20,
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
    fontStyle: 'italic',
  },
  secretCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secretContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  secretFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secretTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  replyButton: {
    backgroundColor: Colors.lightCyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  replyButtonText: {
    fontSize: 12,
    color: Colors.jet,
    fontWeight: '600',
  },
  replySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  replyInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 60,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelReply: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelReplyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sendReply: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendReplyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.jet,
  },
  myRepliesSection: {
    paddingTop: 20,
  },
  myRepliesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 16,
  },
  mySecretCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mySecretContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  repliesHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.jet,
    marginBottom: 8,
  },
  replyCard: {
    backgroundColor: Colors.mintCream,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  replyContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  replyTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});