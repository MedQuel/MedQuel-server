import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { EarnedBadgeCard, EarnedItemInput } from '../../components/EarnedBadgeCard';
import { ProfileScreenStatsCard } from '../../components/ProfileScreenStatsCard';
import { getInitials } from '../../common/utils/getInitials';
import { useTheme } from '../../theme/ThemeContext';

export interface UserProfileData {
  uid: string;
  displayName: string;
  photoURL?: string;
  targetExam?: string;
  college?: string;
  describesYou?: string;
  yearOfStudy?: string;
  level?: number;
  xp?: number;
  quizzesCount?: number;
  streak?: number;
  accuracy?: number;
  badges?: EarnedItemInput[];
}

interface UserProfileScreenProps {
  visible: boolean;
  onClose: () => void;
  userData: UserProfileData | null;
  onChallenge?: (uid: string) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  visible,
  onClose,
  userData,
  onChallenge,
}) => {
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const { theme } = useTheme();

  if (!userData) return null;

  const handleAvatarPress = () => {
    if (userData.photoURL) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setImageViewerVisible(true);
    }
  };

  // Map user metrics to ProfileScreenStatsCard format matching reference design
  const userStats = [
    {
      label: 'Level',
      value: String(userData.level ?? 1),
      color: '#F59E0B',
      icon: 'star',
    },
    {
      label: 'Quizzes',
      value: String(userData.quizzesCount ?? 0),
      color: '#60A5FA',
      icon: 'lightning-bolt',
    },
    {
      label: 'Streak',
      value: String(userData.streak ?? 0),
      color: '#EF4444',
      icon: 'fire',
    },
    {
      label: 'Accuracy',
      value: `${userData.accuracy ?? 0}%`,
      color: '#10B981',
      icon: 'target',
    },
  ];

  // Normalize badges if string IDs or objects are passed
  const formattedBadges: EarnedItemInput[] = (userData.badges ?? []).map((b: any, index: number) => {
    if (typeof b === 'string') {
      return { id: b || `badge-${index}`, badgeId: b, title: b, icon: 'shield-star' };
    }
    return {
      id: b.id || b.badgeId || `badge-${index}`,
      badgeId: b.badgeId || b.id || `badge-${index}`,
      title: b.title || b.name,
      icon: b.icon,
      imageUrl: b.imageUrl,
    };
  });

  const hasBadges = formattedBadges.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.color.background || '#050B14' }]}>
        {/* Top Navigation Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={20} color={theme.color.textSecondary || '#94A3B8'} />
          </TouchableOpacity>
          <Text
            style={[
              styles.navTitle,
              {
                color: theme.color.textPrimary || '#F8FAFC',
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.md || 16,
              },
            ]}
          >
            Profile
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Hero Card Container */}
          <View style={styles.heroCard}>
            {/* Avatar Section */}
            <TouchableOpacity
              activeOpacity={userData.photoURL ? 0.85 : 1}
              onPress={handleAvatarPress}
              style={styles.avatarGlowContainer}
            >
              <View style={styles.avatarBorder}>
                {userData.photoURL ? (
                  <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={styles.initialsAvatar}>
                    <Text
                      style={[
                        styles.initialsText,
                        { fontFamily: theme.fontFamily.bold || theme.fontFamily.regular },
                      ]}
                    >
                      {getInitials(userData.displayName || '')}
                    </Text>
                  </View>
                )}
              </View>
              {/* Shield Badge on Avatar */}
              <View style={styles.avatarLevelBadge}>
                <MaterialCommunityIcons name="shield-check" size={14} color="#38BDF8" />
              </View>
            </TouchableOpacity>

            <Text
              style={[
                styles.nameText,
                {
                  color: theme.color.textPrimary || '#FFFFFF',
                  fontFamily: theme.fontFamily.bold || theme.fontFamily.regular,
                  fontSize: theme.fontSize.xxl || 22,
                },
              ]}
            >
              {userData.displayName}
            </Text>

            {/* Tag Badges Row */}
            <View style={styles.tagRow}>
              {userData.describesYou && (
                <View style={styles.describesBadge}>
                  <Text
                    style={[
                      styles.describesBadgeText,
                      {
                        fontFamily: theme.fontFamily.bold || theme.fontFamily.regular,
                        fontSize: theme.fontSize.xs || 12,
                      },
                    ]}
                  >
                    {userData.describesYou}
                  </Text>
                </View>
              )}

              {userData.yearOfStudy && (
                <View style={styles.yearBadge}>
                  <Text
                    style={[
                      styles.yearBadgeText,
                      {
                        fontFamily: theme.fontFamily.regular,
                        fontSize: theme.fontSize.xs || 12,
                      },
                    ]}
                  >
                    {userData.yearOfStudy}
                  </Text>
                </View>
              )}

              <View style={styles.levelBadge}>
                <MaterialCommunityIcons name="star" size={13} color="#F59E0B" />
                <Text
                  style={[
                    styles.levelBadgeText,
                    {
                      fontFamily: theme.fontFamily.bold || theme.fontFamily.regular,
                      fontSize: theme.fontSize.xs || 12,
                    },
                  ]}
                >
                  Lv {userData.level || 1}
                </Text>
              </View>
            </View>

            {/* Sub-info Row */}
            <View style={styles.metaRow}>
              {userData.targetExam && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="target" size={14} color="#60A5FA" />
                  <Text
                    style={[
                      styles.metaText,
                      {
                        color: theme.color.textSecondary || '#94A3B8',
                        fontFamily: theme.fontFamily.regular,
                        fontSize: theme.fontSize.xs || 12,
                      },
                    ]}
                  >
                    {userData.targetExam}
                  </Text>
                </View>
              )}

              {userData.college && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.color.textSecondary || '#94A3B8'} />
                  <Text
                    style={[
                      styles.metaText,
                      {
                        color: theme.color.textSecondary || '#94A3B8',
                        fontFamily: theme.fontFamily.regular,
                        fontSize: theme.fontSize.xs || 12,
                      },
                    ]}
                  >
                    {userData.college}
                  </Text>
                </View>
              )}

              <View style={styles.xpChip}>
                <MaterialCommunityIcons name="lightning-bolt" size={14} color="#38BDF8" />
                <Text
                  style={[
                    styles.xpText,
                    {
                      fontFamily: theme.fontFamily.bold || theme.fontFamily.regular,
                      fontSize: theme.fontSize.xs || 12,
                    },
                  ]}
                >
                  {userData.xp || 0} XP
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Metrics Grid using ProfileScreenStatsCard */}
          <View style={styles.statsContainer}>
            <ProfileScreenStatsCard stats={userStats} />
          </View>

          {/* Action Challenge Button */}
          {onChallenge && (
            <TouchableOpacity
              style={styles.challengeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onChallenge(userData.uid);
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="sword-cross" size={18} color="#FFFFFF" />
              <Text
                style={[
                  styles.challengeButtonText,
                  {
                    fontFamily: theme.fontFamily.bold || theme.fontFamily.regular,
                    fontSize: theme.fontSize.sm || 15,
                  },
                ]}
              >
                Challenge Player
              </Text>
            </TouchableOpacity>
          )}

          {/* Earned Badges Section */}
          {hasBadges ? (
            <EarnedBadgeCard achievements={formattedBadges} title="Earned Badges" />
          ) : (
            <View style={styles.emptyBadgeCard}>
              <MaterialCommunityIcons name="shield-outline" size={32} color={theme.color.textMuted || '#64748B'} />
              <Text
                style={[
                  styles.emptyBadgeText,
                  {
                    color: theme.color.textMuted || '#64748B',
                    fontFamily: theme.fontFamily.regular,
                  },
                ]}
              >
                No badges earned yet
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Fullscreen Photo Preview Modal */}
      {userData.photoURL && (
        <Modal
          visible={imageViewerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageViewerVisible(false)}
        >
          <View style={styles.fullScreenModalBg}>
            <TouchableOpacity
              style={styles.fullScreenCloseBtn}
              onPress={() => setImageViewerVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: userData.photoURL }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#0A1220',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 4,
  },
  avatarGlowContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarBorder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#38BDF8',
    padding: 3,
    backgroundColor: '#050B14',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  initialsAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#38BDF8',
    fontSize: 26,
    fontWeight: '800',
  },
  avatarLevelBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#0F172A',
    borderColor: '#38BDF8',
    borderWidth: 1,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  describesBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: '#2563EB',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  describesBadgeText: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  yearBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  yearBadgeText: {
    color: '#94A3B8',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  levelBadgeText: {
    color: '#F59E0B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  xpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  statsContainer: {
    marginVertical: 14,
  },
  challengeButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyBadgeCard: {
    backgroundColor: '#0A1220',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  emptyBadgeText: {
    marginTop: 8,
    fontSize: 13,
  },
  fullScreenModalBg: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  fullScreenImage: {
    width: '90%',
    height: '70%',
  },
});