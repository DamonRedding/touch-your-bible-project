import { View, ScrollView, ActivityIndicator, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/auth';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserFriends } from '../../services/friends';
import { createUniqueInviteCode, getUserInviteStats } from '../../services/invites';
import { getUserGlobalRank } from '../../services/leaderboard';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getTotalVerifications,
} from '../../services/verification';
import type { Friend } from '../../types/firestore';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import {
  Text,
  Button,
  Card,
  CardContent,
  CardTitle,
  CardSubtitle,
  CardDescription,
  List,
  ListItem,
  type ListDataItem,
  ESTIMATED_ITEM_HEIGHT,
} from '../../components/nativewindui';
import { type ListRenderItemInfo } from '@shopify/flash-list';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalVerifications: 0,
    points: 0,
    rank: null as number | null,
  });

  // Load user data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get invite code (create if doesn't exist)
        const code = await createUniqueInviteCode(user.uid, user.email || undefined);

        const [friendsList, currentStreak, longestStreak, totalVerifications, rank] =
          await Promise.all([
            getUserFriends(user.uid),
            calculateCurrentStreak(user.uid),
            calculateLongestStreak(user.uid),
            getTotalVerifications(user.uid),
            getUserGlobalRank(user.uid, 0).catch(() => null),
          ]);

        setInviteCode(code);
        setFriends(friendsList);
        setStats({
          currentStreak,
          longestStreak,
          totalVerifications,
          points: totalVerifications * 10,
          rank,
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInviteFriends = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const message = `Join me on Touch Your Bible! Build a daily Bible reading habit together.\n\nUse my invite code: ${inviteCode}\n\nDownload the app: [App Store Link]`;

      await Share.share({
        message,
        title: 'Join Touch Your Bible',
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
    }
  };

  const handleCopyInviteCode = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copied!', `Invite code ${inviteCode} copied to clipboard`);
  };

  const renderFriendItem = (info: ListRenderItemInfo<Friend>) => {
    const item = info.item;
    const listItemData: ListDataItem = {
      id: item.id,
      title: item.displayName || 'Anonymous Friend',
      subTitle:
        item.currentStreak > 0
          ? `🔥 ${item.currentStreak} day${item.currentStreak === 1 ? '' : 's'}`
          : undefined,
    };

    return (
      <ListItem
        item={listItemData}
        index={info.index}
        variant="insets"
        rightView={
          <View className="items-end ml-3">
            <Text variant="callout" className="font-bold">
              {item.points}
            </Text>
            <Text variant="caption2" color="secondary">
              points
            </Text>
          </View>
        }
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2196F3" />
          <Text variant="subhead" color="secondary" className="mt-3">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-card px-4 py-3 border-b border-border">
          <Text variant="largeTitle">Profile</Text>
          {user?.displayName && (
            <Text variant="subhead" color="secondary" className="mt-1">
              {user.displayName}
            </Text>
          )}
        </View>

        {/* Stats Card */}
        <View className="mx-4 mt-4">
          <Card>
            <CardContent>
              <CardTitle>Your Stats</CardTitle>

              <View className="gap-3 mt-4">
                <View className="flex-row justify-between">
                  <Text variant="subhead" color="secondary">
                    Current Streak
                  </Text>
                  <Text variant="callout" className="font-semibold">
                    {stats.currentStreak} day{stats.currentStreak === 1 ? '' : 's'}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text variant="subhead" color="secondary">
                    Longest Streak
                  </Text>
                  <Text variant="callout" className="font-semibold">
                    {stats.longestStreak} day{stats.longestStreak === 1 ? '' : 's'}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text variant="subhead" color="secondary">
                    Total Verifications
                  </Text>
                  <Text variant="callout" className="font-semibold">
                    {stats.totalVerifications}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text variant="subhead" color="secondary">
                    Total Points
                  </Text>
                  <Text variant="callout" className="font-semibold">
                    {stats.points}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text variant="subhead" color="secondary">
                    Global Rank
                  </Text>
                  <Text variant="callout" className="font-semibold">
                    {stats.rank ? `#${stats.rank}` : 'Unranked'}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Invite Code Card */}
        <View className="mx-4 mt-4">
          <Card>
            <CardContent>
              <CardTitle>Your Invite Code</CardTitle>

              <View className="bg-accent/10 p-4 rounded-lg mt-3 mb-3">
                <Text variant="caption1" color="secondary" className="mb-2">
                  Share this code with friends
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text variant="title2" className="font-mono font-bold text-primary">
                    {inviteCode}
                  </Text>
                  <Button variant="primary" size="sm" onPress={handleCopyInviteCode}>
                    <Text variant="subhead" className="text-white font-semibold">
                      Copy
                    </Text>
                  </Button>
                </View>
              </View>

              <Button variant="primary" size="lg" onPress={handleInviteFriends} className="w-full">
                <Text variant="callout" className="text-white font-semibold">
                  📤 Share Invite
                </Text>
              </Button>
              <Text variant="caption1" color="secondary" className="text-center mt-2">
                Both you and your friend get 10 bonus points!
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Friends List */}
        <View className="mx-4 mt-4">
          <Card>
            <CardContent>
              <CardTitle>Friends ({friends.length})</CardTitle>

              {friends.length === 0 ? (
                <View className="items-center py-6">
                  <Text className="text-4xl mb-2">👥</Text>
                  <Text variant="subhead" color="secondary" className="text-center">
                    No friends yet. Share your invite code to get started!
                  </Text>
                </View>
              ) : (
                <View className="mt-3 -mx-5">
                  <List
                    variant="insets"
                    data={friends}
                    renderItem={renderFriendItem}
                    estimatedItemSize={ESTIMATED_ITEM_HEIGHT.withSubTitle}
                    keyExtractor={(item: Friend) => item.id}
                    scrollEnabled={false}
                    contentContainerClassName="px-0"
                  />
                </View>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Account Actions */}
        <View className="mx-4 mt-4 mb-6">
          {user?.email && (
            <Card className="mb-3">
              <CardContent>
                <Text variant="caption1" color="secondary">
                  Signed in as
                </Text>
                <Text variant="subhead" className="mt-1">
                  {user.email}
                </Text>
              </CardContent>
            </Card>
          )}

          <Button
            variant="plain"
            size="lg"
            onPress={handleSignOut}
            className="w-full bg-red-500 active:bg-red-600"
          >
            <Text variant="callout" className="text-white font-bold">
              Sign Out
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
