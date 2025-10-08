import { View, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import {
  subscribeToGlobalLeaderboard,
  subscribeToFriendsLeaderboard,
  getUserPositionInTopN,
} from '../../services/leaderboard';
import type { LeaderboardEntry, FriendsLeaderboardEntry } from '../../types/firestore';
import * as Haptics from 'expo-haptics';
import {
  List,
  ListItem,
  type ListDataItem,
  ESTIMATED_ITEM_HEIGHT,
  Text,
  Button,
} from '../../components/nativewindui';
import { type ListRenderItemInfo } from '@shopify/flash-list';

type LeaderboardTab = 'global' | 'friends';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<FriendsLeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to global leaderboard
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = subscribeToGlobalLeaderboard(
      100,
      (leaderboard) => {
        setGlobalLeaderboard(leaderboard);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading global leaderboard:', err);
        setError('Failed to load leaderboard. Pull to retry.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to friends leaderboard
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToFriendsLeaderboard(
      user.uid,
      (leaderboard) => {
        setFriendsLeaderboard(leaderboard);
      },
      (err) => {
        console.error('Error loading friends leaderboard:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Get user's rank in global leaderboard
  useEffect(() => {
    if (!user) return;

    getUserPositionInTopN(user.uid, 100)
      .then((rank) => setUserRank(rank))
      .catch((err) => console.error('Error getting user rank:', err));
  }, [user, globalLeaderboard]);

  const handleTabSwitch = (tab: LeaderboardTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRefreshing(true);
    // Real-time subscription will auto-update, just provide feedback
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const renderLeaderboardItem = (
    info: ListRenderItemInfo<LeaderboardEntry | FriendsLeaderboardEntry>
  ) => {
    const item = info.item;
    const isCurrentUser =
      'user' in item ? item.user.id === user?.uid : item.friend.userId === user?.uid;
    const displayName =
      'user' in item ? item.user.displayName || 'Anonymous' : item.friend.displayName;
    const points = 'user' in item ? item.user.points || 0 : item.friend.points || 0;
    const streak = 'user' in item ? item.user.currentStreak || 0 : item.friend.currentStreak || 0;

    // Medal emojis for top 3
    const getMedal = (rank: number) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };

    const listItemData: ListDataItem = {
      id: String(item.rank),
      title: displayName + (isCurrentUser ? ' (You)' : ''),
      subTitle: streak > 0 ? `🔥 ${streak} day${streak === 1 ? '' : 's'}` : undefined,
    };

    return (
      <ListItem
        item={listItemData}
        index={info.index}
        variant="insets"
        className={isCurrentUser ? 'border-2 border-primary' : ''}
        leftView={
          <View className="w-12 items-center justify-center">
            <Text variant="title2">{getMedal(item.rank)}</Text>
          </View>
        }
        rightView={
          <View className="items-end ml-3">
            <Text variant="headline" className="font-bold">
              {points}
            </Text>
            <Text variant="caption1" color="secondary">
              points
            </Text>
          </View>
        }
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      />
    );
  };

  const renderEmptyState = () => {
    if (activeTab === 'global') {
      return (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-6xl mb-4">🏆</Text>
          <Text variant="title3" className="text-center mb-2">
            Leaderboard Empty
          </Text>
          <Text variant="subhead" color="secondary" className="text-center">
            Complete your first verification to appear on the leaderboard!
          </Text>
        </View>
      );
    } else {
      return (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-6xl mb-4">👥</Text>
          <Text variant="title3" className="text-center mb-2">
            No Friends Yet
          </Text>
          <Text variant="subhead" color="secondary" className="text-center mb-6">
            Invite friends to compete together and stay motivated!
          </Text>
          <Button
            variant="primary"
            size="lg"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // TODO: Navigate to invite flow
            }}
          >
            <Text variant="callout" className="text-white font-semibold">
              Invite Friends
            </Text>
          </Button>
        </View>
      );
    }
  };

  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-6xl mb-4">⚠️</Text>
      <Text variant="title3" className="text-center mb-2">
        Connection Error
      </Text>
      <Text variant="subhead" color="secondary" className="text-center mb-6">
        {error}
      </Text>
      <Button variant="primary" size="lg" onPress={handleRefresh}>
        <Text variant="callout" className="text-white font-semibold">
          Retry
        </Text>
      </Button>
    </View>
  );

  const currentLeaderboard = activeTab === 'global' ? globalLeaderboard : friendsLeaderboard;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex-1">
        {/* Header with User Rank */}
        <View className="bg-card px-4 py-3 border-b border-border">
          <Text variant="largeTitle">Leaderboard</Text>
          {userRank && (
            <Text variant="subhead" color="secondary" className="mt-1">
              You're ranked #{userRank} globally
            </Text>
          )}
        </View>

        {/* Tab Selector */}
        <View className="flex-row bg-card px-4 py-3 border-b border-border gap-2">
          <Button
            variant={activeTab === 'global' ? 'primary' : 'tonal'}
            size="md"
            className="flex-1"
            onPress={() => handleTabSwitch('global')}
          >
            <Text
              variant="callout"
              className={activeTab === 'global' ? 'text-white font-semibold' : 'font-semibold'}
            >
              🌍 Global
            </Text>
          </Button>
          <Button
            variant={activeTab === 'friends' ? 'primary' : 'tonal'}
            size="md"
            className="flex-1"
            onPress={() => handleTabSwitch('friends')}
          >
            <Text
              variant="callout"
              className={activeTab === 'friends' ? 'text-white font-semibold' : 'font-semibold'}
            >
              👥 Friends
            </Text>
          </Button>
        </View>

        {/* Leaderboard List */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text variant="subhead" color="secondary" className="mt-3">
              Loading leaderboard...
            </Text>
          </View>
        ) : error ? (
          renderErrorState()
        ) : currentLeaderboard.length === 0 ? (
          renderEmptyState()
        ) : (
          <List
            variant="insets"
            data={currentLeaderboard}
            renderItem={renderLeaderboardItem}
            estimatedItemSize={ESTIMATED_ITEM_HEIGHT.withSubTitle}
            keyExtractor={(item: any) => `${item.rank}`}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#3B82F6"
              />
            }
            contentContainerClassName="py-4"
          />
        )}
      </View>
    </SafeAreaView>
  );
}
