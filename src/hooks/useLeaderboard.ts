import { useState, useEffect } from 'react';
import { useK3HootClient, TopicWithStats } from '@/lib/solana-client';
import { PublicKey } from '@solana/web3.js';

export interface LeaderboardEntry {
  userAddress: string;
  score: number;
  totalCompleted: number;
  totalRewards: number;
  lastActivity: Date;
  winRate: number;
  rank: number;
}

export interface TopicLeaderboardData {
  topic: TopicWithStats;
  quizSets: any[];
  participants: LeaderboardEntry[];
}

export function useLeaderboard() {
  const [topics, setTopics] = useState<TopicWithStats[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicWithStats | null>(null);
  const [topicLeaderboard, setTopicLeaderboard] = useState<TopicLeaderboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = useK3HootClient();

  // Load all topics from blockchain
  const loadTopics = async () => {
    if (!client) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allTopics = await client.getAllTopics();
      
      // Transform topics and get additional stats
      const topicsWithStats: TopicWithStats[] = [];
      
      for (const topic of allTopics) {
        try {
          // Get quiz sets for this topic to get real stats
          const quizSets = await client.findQuizSetsForTopic(topic.name);
          
          let claimedCount = 0;
          let unclaimedCount = 0;
          let totalParticipants = 0;
          const uniqueParticipants = new Set<string>();

          for (const quizSet of quizSets) {
            if (quizSet.account.isRewardClaimed) {
              claimedCount++;
            } else {
              unclaimedCount++;
            }
            
            if (quizSet.account.winner) {
              uniqueParticipants.add(quizSet.account.winner.toString());
            }
          }

          totalParticipants = uniqueParticipants.size;
          
          const topicWithStats: TopicWithStats = {
            name: topic.name,
            isActive: topic.isActive,
            totalQuizzes: quizSets.length, // Real count from blockchain
            totalParticipants: totalParticipants, // Real unique participants
            minRewardAmount: topic.minRewardAmount.toNumber() / 1_000_000_000,
            minQuestionCount: topic.minQuestionCount,
            owner: topic.owner.toString(),
            createdAt: new Date(topic.createdAt.toNumber() * 1000),
            claimedCount,
            unclaimedCount
          };
          
          topicsWithStats.push(topicWithStats);
          
        } catch (err) {
          console.warn(`Error processing topic ${topic.name}:`, err);
          // Add topic with basic info if detailed stats fail
          topicsWithStats.push({
            name: topic.name,
            isActive: topic.isActive,
            totalQuizzes: topic.totalQuizzes,
            totalParticipants: topic.totalParticipants,
            minRewardAmount: topic.minRewardAmount.toNumber() / 1_000_000_000,
            minQuestionCount: topic.minQuestionCount,
            owner: topic.owner.toString(),
            createdAt: new Date(topic.createdAt.toNumber() * 1000),
            claimedCount: 0,
            unclaimedCount: 0
          });
        }
      }

      // Sort by popularity (total participants + total quizzes)
      topicsWithStats.sort((a, b) => {
        const scoreA = (a.totalParticipants * 2) + a.totalQuizzes;
        const scoreB = (b.totalParticipants * 2) + b.totalQuizzes;
        return scoreB - scoreA;
      });

      setTopics(topicsWithStats);

    } catch (err: any) {
      console.error('❌ Error loading topics:', err);
      setError(err.message || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  // Load leaderboard for selected topic
  const loadTopicLeaderboard = async (topic: TopicWithStats) => {
    if (!client) return;

    try {
      setLoadingLeaderboard(true);
      setError(null);

      // Get all quiz sets for this topic
      const quizSets = await client.findQuizSetsForTopic(topic.name);
      
      // Calculate leaderboard from real quiz data
      const participantStats = new Map<string, {
        userAddress: string;
        completedQuizzes: number;
        totalScore: number;
        totalRewards: number;
        lastActivity: Date;
        isWinner: boolean[];
      }>();

      for (const quizSet of quizSets) {
        if (quizSet.account.winner) {
          const userAddress = quizSet.account.winner.toString();
          const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
          
          if (!participantStats.has(userAddress)) {
            participantStats.set(userAddress, {
              userAddress: shortAddress,
              completedQuizzes: 0,
              totalScore: 0,
              totalRewards: 0,
              lastActivity: new Date(quizSet.account.createdAt.toNumber() * 1000),
              isWinner: []
            });
          }

          const stats = participantStats.get(userAddress)!;
          stats.completedQuizzes += 1;
          stats.totalScore += quizSet.account.correctAnswersCount || quizSet.account.questionCount;
          stats.totalRewards += quizSet.account.rewardAmount.toNumber() / 1_000_000_000;
          stats.lastActivity = new Date(Math.max(
            stats.lastActivity.getTime(),
            quizSet.account.createdAt.toNumber() * 1000
          ));
          stats.isWinner.push(!!quizSet.account.winner);
        }
      }

      // Convert to leaderboard entries
      const leaderboardEntries: LeaderboardEntry[] = Array.from(participantStats.values())
        .map(stats => ({
          userAddress: stats.userAddress,
          score: stats.totalScore,
          totalCompleted: stats.completedQuizzes,
          totalRewards: stats.totalRewards,
          lastActivity: stats.lastActivity,
          winRate: stats.completedQuizzes > 0 ? (stats.isWinner.filter(Boolean).length / stats.completedQuizzes) * 100 : 0
        }))
        .sort((a, b) => {
          // Sort by score first, then by win rate, then by total completed
          if (b.score !== a.score) return b.score - a.score;
          if (b.winRate !== a.winRate) return b.winRate - a.winRate;
          return b.totalCompleted - a.totalCompleted;
        })
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      setTopicLeaderboard({
        topic,
        quizSets,
        participants: leaderboardEntries
      });

    } catch (err: any) {
      console.error('❌ Error loading topic leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Filter topics based on search query
  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Select topic and load its leaderboard
  const selectTopic = async (topic: TopicWithStats) => {
    setSelectedTopic(topic);
    await loadTopicLeaderboard(topic);
  };

  // Go back to topics list
  const backToTopics = () => {
    setSelectedTopic(null);
    setTopicLeaderboard(null);
    setError(null);
  };

  // Initial load
  useEffect(() => {
    loadTopics();
  }, [client]);

  return {
    // Data
    topics: filteredTopics,
    selectedTopic,
    topicLeaderboard,
    
    // State
    loading,
    loadingLeaderboard,
    error,
    searchQuery,
    
    // Actions
    setSearchQuery,
    selectTopic,
    backToTopics,
    loadTopics,
    
    // Stats
    totalTopics: topics.length,
    totalActiveTopics: topics.filter(t => t.isActive).length,
    hasTopics: topics.length > 0
  };
}
