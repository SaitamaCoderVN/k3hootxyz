import { useState, useEffect } from 'react';
import { TopicWithStats } from '@/lib/solana-client';
import { useK3HootClient } from '@/lib/solana-client';
import { PublicKey } from '@solana/web3.js';

export function useTopics() {
  const [topics, setTopics] = useState<TopicWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  
  const client = useK3HootClient();

  // Updated fetchTopics to properly count quiz sets and get claimed info
  const fetchTopics = async () => {
    if (!client) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const allTopics = await client.getAllTopics();
      
      // Transform topics with actual quiz set counts and claimed info
      const transformedTopics: TopicWithStats[] = [];
      
      for (const topic of allTopics) {
        try {
          // Validate topic data
          if (!topic.name || typeof topic.name !== 'string') {
            console.warn('Invalid topic data:', topic);
            continue;
          }
          
          // Format data according to reference implementation
          const created = new Date(topic.createdAt.toNumber() * 1000);
          
          // Get actual quiz sets for this topic and count them
          const quizSets = await client.findQuizSetsForTopic(topic.name);
          const actualQuizCount = quizSets.length;
          
          // Count claimed vs unclaimed quiz sets
          let claimedCount = 0;
          let unclaimedCount = 0;
          let totalParticipants = 0;
          
          for (const quizSet of quizSets) {
            if (quizSet.account.isRewardClaimed) {
              claimedCount++;
            } else {
              unclaimedCount++;
            }
            // Count participants (winners)
            if (quizSet.account.winner) {
              totalParticipants++;
            }
          }
          
          const transformedTopic: TopicWithStats = {
            name: topic.name,
            isActive: topic.isActive,
            totalQuizzes: actualQuizCount, // Use actual count
            totalParticipants: totalParticipants, // Use actual participants count
            minRewardAmount: topic.minRewardAmount.toNumber() / 1_000_000_000,
            minQuestionCount: topic.minQuestionCount,
            owner: topic.owner.toString(),
            createdAt: created,
            // Add extra stats for UI
            claimedCount,
            unclaimedCount
          };
          
          transformedTopics.push(transformedTopic);
          
        } catch (transformError) {
          console.warn(`Error transforming topic:`, transformError);
          continue;
        }
      }

      setTopics(transformedTopics);
      
    } catch (err: any) {
      console.error('❌ Error fetching topics:', err);
      setError(err.message || 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  // Create new topic
  const createTopic = async (name: string): Promise<boolean> => {
    if (!client) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setCreating(true);
      setError(null);
      
      const topicAddress = await client.createTopic(name);
      
      // Refresh topics list after creation
      await fetchTopics();
      
      return true;
      
    } catch (err: any) {
      console.error('❌ Error creating topic:', err);
      setError(err.message || 'Failed to create topic');
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Check if topic name already exists
  const checkTopicExists = (name: string): boolean => {
    return topics.some(topic => topic.name.toLowerCase() === name.toLowerCase());
  };

  // Get active topics only
  const getActiveTopics = (): TopicWithStats[] => {
    return topics.filter(topic => topic.isActive);
  };

  // Get topics owned by current user
  const getMyTopics = (userPublicKey?: string): TopicWithStats[] => {
    if (!userPublicKey) return [];
    return topics.filter(topic => topic.owner === userPublicKey);
  };

  // Initial fetch on client ready
  useEffect(() => {
    if (client) {
      fetchTopics();
    }
  }, [client]);

  // Transfer topic ownership
  const transferTopicOwnership = async (topicName: string, newOwner: string): Promise<boolean> => {
    if (!client) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setError(null);
      
      await client.transferTopicOwnership(topicName, new PublicKey(newOwner));
      
      // Refresh topics list after transfer
      await fetchTopics();
      
      return true;
    } catch (err: any) {
      console.error('❌ Error transferring topic ownership:', err);
      setError(err.message || 'Failed to transfer topic ownership');
      return false;
    }
  };

  // Toggle topic status
  const toggleTopicStatus = async (topicName: string, isActive: boolean): Promise<boolean> => {
    if (!client) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setError(null);
      
      await client.toggleTopicStatus(topicName, isActive);
      
      // Refresh topics list after status change
      await fetchTopics();
      
      return true;
    } catch (err: any) {
      console.error('❌ Error toggling topic status:', err);
      setError(err.message || 'Failed to toggle topic status');
      return false;
    }
  };

  // Get topic by name with detailed information
  const getTopicByName = async (name: string): Promise<any | null> => {
    if (!client) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);
      
      const topicDetails = await client.getTopicByName(name);
      return topicDetails;
    } catch (err: any) {
      console.error(`❌ Error getting topic "${name}":`, err);
      setError(err.message || 'Failed to get topic details');
      return null;
    }
  };

  // Create demo topics if none exist
  const createDemoTopics = async (): Promise<boolean> => {
    if (!client) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setError(null);
      
      await client.runTopicDemo();
      
      // Refresh topics list after creation
      await fetchTopics();
      
      return true;
    } catch (err: any) {
      console.error('❌ Error creating demo topics:', err);
      setError(err.message || 'Failed to create demo topics');
      return false;
    }
  };

  // Demo workflow function (for testing)
  const runTopicDemo = async (): Promise<void> => {
    if (!client) {
      setError('Wallet not connected');
      return;
    }

    try {
      // Create some sample topics
      const topics = ['Mathematics', 'Science', 'History'];
      for (const topicName of topics) {
        if (!checkTopicExists(topicName)) {
          await createTopic(topicName);
        }
      }
      
      // List all topics
      await fetchTopics();
      
    } catch (error) {
      console.error("❌ Topic management demo failed:", error);
      throw error;
    }
  };

  // Refresh topics
  const refreshTopics = async () => {
    await fetchTopics();
  };

  return {
    // Data
    topics,
    activeTopics: getActiveTopics(),
    
    // State
    loading,
    error,
    creating,
    
    // Actions
    fetchTopics,
    createTopic,
    createDemoTopics,
    checkTopicExists,
    getMyTopics,
    transferTopicOwnership,
    toggleTopicStatus,
    getTopicByName,
    runTopicDemo,
    
    // Stats
    totalTopics: topics.length,
    activeTopicsCount: getActiveTopics().length,
    refreshTopics
  };
}