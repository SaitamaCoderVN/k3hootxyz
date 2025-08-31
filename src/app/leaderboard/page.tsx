'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Search, ArrowLeft, Users, Trophy, Clock, Coins } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';

export default function LeaderboardPage() {
  const {
    topics,
    selectedTopic,
    topicLeaderboard,
    loading,
    loadingLeaderboard,
    error,
    searchQuery,
    setSearchQuery,
    selectTopic,
    backToTopics,
    totalTopics,
    totalActiveTopics,
    hasTopics
  } = useLeaderboard();

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden">
        <SpaceBackground />
        <Stars />
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🏆</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-400 bg-gray-700/50 rounded-full">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/30';
      default:
        return 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20';
    }
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <SpaceBackground />
      <Stars />
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <AnimatePresence mode="wait">
          {!selectedTopic ? (
            // Topics List View
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                  🏆 Leaderboard
                </h1>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                  Select a topic to view rankings and compete with other players
                </p>
                
                {/* Stats */}
                <div className="flex justify-center gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{totalTopics}</div>
                    <div className="text-sm text-gray-400">Total Topics</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{totalActiveTopics}</div>
                    <div className="text-sm text-gray-400">Active Topics</div>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search topics or creator address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="text-center mb-8">
                  <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md mx-auto">
                    {error}
                  </div>
                </div>
              )}

              {/* Topics Grid */}
              {hasTopics ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {topics.map((topic, index) => (
                    <motion.div
                      key={topic.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => selectTopic(topic)}
                      className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:bg-white/5 hover:border-purple-500/30 hover:scale-105"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">📚 {topic.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          topic.isActive 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {topic.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center gap-2">
                            <Trophy className="w-4 h-4" />
                            Quizzes:
                          </span>
                          <span className="text-white font-medium">{topic.totalQuizzes}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Players:
                          </span>
                          <span className="text-white font-medium">{topic.totalParticipants}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center gap-2">
                            <Coins className="w-4 h-4" />
                            Min Reward:
                          </span>
                          <span className="text-purple-400 font-medium">{topic.minRewardAmount} SOL</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10">
                        <div className="text-xs text-gray-400 mb-1">Created by:</div>
                        <div className="text-xs text-purple-300 font-mono break-all">
                          {topic.owner.slice(0, 8)}...{topic.owner.slice(-8)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {topic.createdAt.toLocaleDateString()}
                        </div>
                      </div>

                      {/* Claimed/Unclaimed Stats */}
                      {(topic.claimedCount! > 0 || topic.unclaimedCount! > 0) && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-400">
                              ✅ Claimed: {topic.claimedCount}
                            </span>
                            <span className="text-yellow-400">
                              ⏳ Unclaimed: {topic.unclaimedCount}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No topics found</div>
                  <div className="text-gray-500 text-sm">
                    {searchQuery ? 'Try adjusting your search terms' : 'No topics have been created yet'}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            // Topic Leaderboard View
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Header */}
              <div className="mb-8">
                <button
                  onClick={backToTopics}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Topics
                </button>
                
                <div className="text-center">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                    🏆 {selectedTopic.name} Leaderboard
                  </h1>
                  <p className="text-gray-300">
                    Rankings based on quiz performance and rewards earned
                  </p>
                </div>
              </div>

              {/* Topic Stats */}
              <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{topicLeaderboard?.quizSets.length || 0}</div>
                    <div className="text-sm text-gray-400">Total Quizzes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{topicLeaderboard?.participants.length || 0}</div>
                    <div className="text-sm text-gray-400">Active Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{selectedTopic.minRewardAmount}</div>
                    <div className="text-sm text-gray-400">Min Reward (SOL)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{selectedTopic.minQuestionCount}</div>
                    <div className="text-sm text-gray-400">Min Questions</div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loadingLeaderboard && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                  <div className="text-gray-400 mt-4">Loading leaderboard...</div>
                </div>
              )}

              {/* Leaderboard */}
              {topicLeaderboard && !loadingLeaderboard && (
                <div className="space-y-3">
                  {topicLeaderboard.participants.length > 0 ? (
                    topicLeaderboard.participants.map((entry, index) => (
                      <motion.div
                        key={entry.userAddress}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border backdrop-blur-sm ${getRankBgColor(entry.rank)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {getRankIcon(entry.rank)}
                            <div>
                              <div className="font-mono text-white font-medium">
                                {entry.userAddress}
                              </div>
                              <div className="text-sm text-gray-400">
                                {entry.totalCompleted} quizzes completed
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">
                              {entry.score} pts
                            </div>
                            <div className="text-sm text-purple-400">
                              {entry.totalRewards.toFixed(2)} SOL
                            </div>
                            <div className="text-xs text-gray-400">
                              {entry.winRate.toFixed(1)}% win rate
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg">No participants yet</div>
                      <div className="text-gray-500 text-sm mt-2">
                        Be the first to complete a quiz in this topic!
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error State */}
              {error && !loadingLeaderboard && (
                <div className="text-center py-12">
                  <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md mx-auto">
                    {error}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
} 