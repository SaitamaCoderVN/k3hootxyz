'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';
import GlowingButton from '@/components/ui/GlowingButton';
import CreateQuizForm from '@/components/CreateQuizForm';
import { FaRocket, FaQuestionCircle, FaPlus, FaList, FaSpinner, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useTopics } from '@/hooks/useTopics';
import { BlockchainLoadingIndicator } from '@/components/ui/LoadingStates';
import { LoadingContainer, PageWrapper } from '@/components/layout/MinHeightContainer';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export default function CreatePage() {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'topics'>('topics');
  const [newTopicName, setNewTopicName] = useState('');
  const [showCreateTopicForm, setShowCreateTopicForm] = useState(false);

  const {
    topics,
    activeTopics,
    loading: topicsLoading,
    error: topicsError,
    creating: creatingTopic,
    createTopic,
    checkTopicExists,
    getMyTopics,
    getUserOwnedActiveTopics,
    fetchTopics,
    retryFetchTopics,
    retryCount,
    maxRetries,
    totalTopics,
    activeTopicsCount
  } = useTopics();

  const myTopics = getMyTopics(publicKey?.toString());
  const userOwnedActiveTopics = getUserOwnedActiveTopics(publicKey?.toString());

  useEffect(() => {
    setMounted(true);
    // Simulate initial loading time to match other pages
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;
    
    if (checkTopicExists(newTopicName)) {
      alert('Topic name already exists. Please choose a different name.');
      return;
    }

    const success = await createTopic(newTopicName.trim());
    if (success) {
      setNewTopicName('');
      setShowCreateTopicForm(false);
    }
  };

  if (!mounted) return null;

  return (
    <PageWrapper minHeight="screen" className="bg-black text-white overflow-hidden">
      <SpaceBackground />
      <Stars />
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
              Quiz Management
            </h1>
            <p className="text-lg text-purple-300 max-w-2xl mx-auto">
              Create topics and design your own quizzes. Your quiz will be encrypted and stored on Solana blockchain.
            </p>
          </div>

          {/* Stats */}
          {connected && !topicsLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 mb-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold gradient-text">{totalTopics}</p>
                  <p className="text-purple-300 text-sm">Total Topics</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">{activeTopicsCount}</p>
                  <p className="text-purple-300 text-sm">Active Topics</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">{myTopics.length}</p>
                  <p className="text-purple-300 text-sm">My Topics</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">
                    {topics.reduce((acc, topic) => acc + topic.totalQuizzes, 0)}
                  </p>
                  <p className="text-purple-300 text-sm">Total Quizzes</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Wallet Connection */}
          {!connected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 mb-8 text-center"
            >
              <FaRocket className="text-4xl text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="text-purple-300 mb-4">
                Connect your Solana wallet to create topics and manage quizzes
              </p>
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !text-white !font-bold !px-6 !py-3 !rounded-lg hover:!from-purple-600 hover:!to-pink-600" />
              </div>
            </motion.div>
          )}

          {/* Management Tabs */}
          {connected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-purple-500/20 mb-8"
            >
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-purple-800/30 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('topics')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'topics'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-purple-300 hover:text-white hover:bg-purple-700/50'
                  }`}
                >
                  <FaList className="text-sm" />
                  Manage Topics ({totalTopics})
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'create'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-purple-300 hover:text-white hover:bg-purple-700/50'
                  }`}
                >
                  <FaPlus className="text-sm" />
                  Create Quiz
                  {topicsLoading && activeTab !== 'create' && (
                    <FaSpinner className="text-xs animate-spin ml-1" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'topics' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Topic Management</h3>
                      <p className="text-purple-300">
                        Manage your existing topics and create new ones for organizing quizzes.
                      </p>
                    </div>
                    <GlowingButton
                      variant="primary"
                      onClick={() => setShowCreateTopicForm(!showCreateTopicForm)}
                      className="px-4 py-2"
                    >
                      <FaPlus className="inline mr-2" />
                      New Topic
                    </GlowingButton>
                  </div>

                  {/* Create Topic Form */}
                  {showCreateTopicForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-6"
                    >
                      <h4 className="text-lg font-semibold mb-4 text-blue-300">Create New Topic</h4>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={newTopicName}
                          onChange={(e) => setNewTopicName(e.target.value)}
                          placeholder="Enter topic name (e.g., Mathematics, Science, History)"
                          className="flex-1 px-4 py-2 bg-purple-900/30 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={creatingTopic}
                        />
                        <GlowingButton
                          variant="primary"
                          onClick={handleCreateTopic}
                          disabled={!newTopicName.trim() || creatingTopic}
                          className="px-6 py-2"
                        >
                          {creatingTopic ? (
                            <>
                              <FaSpinner className="inline mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="inline mr-2" />
                              Create
                            </>
                          )}
                        </GlowingButton>
                      </div>
                      {topicsError && (
                        <p className="text-red-400 text-sm mt-2 flex items-center">
                          <FaExclamationTriangle className="mr-2" />
                          {topicsError}
                        </p>
                      )}
                    </motion.div>
                  )}
                  
                  {/* Topics List */}
                  <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-green-300">Available Topics</h4>
                      <button
                        onClick={fetchTopics}
                        disabled={topicsLoading}
                        className="text-green-300 hover:text-green-200 disabled:opacity-50"
                      >
                        {topicsLoading ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          '🔄 Refresh'
                        )}
                      </button>
                    </div>
                    
                    {topicsLoading ? (
                      <div className="py-8">
                        <BlockchainLoadingIndicator 
                          message="Loading topics from blockchain..."
                          showProgress={false}
                        />
                      </div>
                    ) : topicsError ? (
                                              <div className="text-center py-8 text-red-300">
                          <FaExclamationTriangle className="text-4xl mx-auto mb-4 opacity-50" />
                          <p className="mb-4">Error loading topics: {topicsError}</p>
                          {retryCount >= maxRetries ? (
                            <div className="space-y-4">
                              <p className="text-yellow-300">
                                Failed to load topics after {maxRetries} attempts. You may not have any topics yet.
                              </p>
                              <div className="flex gap-3 justify-center">
                                <button
                                  onClick={retryFetchTopics}
                                  className="px-4 py-2 bg-blue-600/20 border border-blue-500/20 rounded text-blue-300 hover:text-blue-200"
                                >
                                  Try Again
                                </button>
                                <button
                                  onClick={() => setShowCreateTopicForm(true)}
                                  className="px-4 py-2 bg-green-600/20 border border-green-500/20 rounded text-green-300 hover:text-green-200"
                                >
                                  Create Your First Topic
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={retryFetchTopics}
                              className="px-4 py-2 bg-red-600/20 border border-red-500/20 rounded text-red-300 hover:text-red-200"
                            >
                              Try Again (Attempt {retryCount + 1}/{maxRetries})
                            </button>
                          )}
                        </div>
                    ) : topics.length === 0 ? (
                      <div className="text-center py-8 text-green-300">
                        <FaList className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>No topics found. Create your first topic to get started!</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {topics.map((topic, index) => (
                          <motion.div
                            key={topic.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${
                              topic.isActive 
                                ? 'bg-green-900/30 border-green-500/30' 
                                : 'bg-gray-900/30 border-gray-500/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-white">{topic.name}</h5>
                              <span className={`px-2 py-1 rounded text-xs ${
                                topic.isActive 
                                  ? 'bg-green-600 text-green-100' 
                                  : 'bg-gray-600 text-gray-100'
                              }`}>
                                {topic.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                              <div>Quizzes: {topic.totalQuizzes}</div>
                              <div>Players: {topic.totalParticipants}</div>
                              <div>Min Reward: {topic.minRewardAmount} SOL</div>
                              <div>Min Questions: {topic.minQuestionCount}</div>
                            </div>
                            {topic.owner === publicKey?.toString() && (
                              <div className="mt-2">
                                <span className="inline-block px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded">
                                  Owner
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Create New Quiz</h3>
                    <p className="text-purple-300">
                      Design your quiz with questions and answers. All data will be encrypted on-chain.
                    </p>
                  </div>
                  
                  {/* Show loading state while fetching user topics */}
                  {topicsLoading ? (
                    <div className="py-8">
                      <BlockchainLoadingIndicator 
                        message="Loading your topics..."
                        showProgress={false}
                      />
                    </div>
                  ) : (
                    <CreateQuizForm 
                      availableTopics={activeTopics} 
                      userOwnedTopics={userOwnedActiveTopics}
                    />
                  )}
                </div>
              )}

              {/* Info Box */}
              <div className="mt-6 p-4 sm:p-6 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaQuestionCircle className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-blue-300">
                    <p className="font-medium mb-2 sm:mb-3">How it works:</p>
                    <ul className="space-y-1 sm:space-y-2">
                      <li>• Create topics to organize your quizzes (e.g., "Mathematics", "Science")</li>
                      <li>• Each topic can contain multiple quiz sets with different reward amounts</li>
                      <li>• Quiz data is encrypted using XOR encryption with unique nonces</li>
                      <li>• Questions and options are stored together in encrypted X-coordinates</li>
                      <li>• Correct answers are stored separately in encrypted Y-coordinates</li>
                      <li>• All data is stored directly on Solana blockchain (no IPFS needed)</li>
                      <li>• Players can decrypt questions but answers remain secure</li>
                      <li>• Each question uses a unique nonce for enhanced security</li>
                      <li>• Arcium integration enables on-chain verification without decryption</li>
                      <li>• Reward amounts are distributed to quiz winners</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Footer />
    </PageWrapper>
  );
} 