# 🗺️ K3HOOT IMPLEMENTATION ROADMAP

## 📋 Overview

This roadmap breaks down the implementation into 4 phases over 4-5 weeks.

---

## 🎯 Phase 1: Core Backend Infrastructure (Week 1)

### 1.1 Setup Redis
```bash
# Install Redis (local dev)
brew install redis
redis-server

# Or use Upstash (cloud Redis)
# Sign up at https://upstash.com
# Get REDIS_URL from dashboard
```

**Files to create:**
- `src/lib/redis-client.ts` - Redis connection wrapper
- `src/lib/cache-keys.ts` - Centralized cache key definitions

**Code:**
```typescript
// src/lib/redis-client.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

// Helper functions
export async function getSession(sessionId: string) {
  const data = await redis.get(`session:${sessionId}`);
  return data ? JSON.parse(data as string) : null;
}

export async function setSession(sessionId: string, data: any, ttl = 3600) {
  await redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data));
}

export async function addPlayerToSession(sessionId: string, player: any) {
  await redis.hset(`session:${sessionId}:players`, player.id, JSON.stringify(player));
}

export async function getLeaderboard(sessionId: string) {
  const players = await redis.zrevrange(`leaderboard:${sessionId}`, 0, -1, 'WITHSCORES');
  return players;
}
```

---

### 1.2 Setup WebSocket Server (Socket.IO)

```bash
npm install socket.io @types/socket.io
```

**Files to create:**
- `src/lib/websocket-server.ts` - Socket.IO server setup
- `src/lib/websocket-events.ts` - Event type definitions

**Code:**
```typescript
// src/lib/websocket-server.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { redis } from './redis-client';

let io: SocketIOServer;

export function initWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join game session
    socket.on('join_game', async ({ sessionId, participantId, role }) => {
      socket.join(sessionId);
      socket.join(`${role}:${participantId}`);

      // Notify others
      io.to(sessionId).emit('player_joined', { participantId });

      console.log(`${role} ${participantId} joined session ${sessionId}`);
    });

    // Leave game session
    socket.on('leave_game', ({ sessionId, participantId }) => {
      socket.leave(sessionId);
      io.to(sessionId).emit('player_left', { participantId });
    });

    // Host controls
    socket.on('host_advance_phase', async ({ sessionId }) => {
      // Trigger phase advancement
      const gameState = new GameStateMachine(sessionId, io);
      await gameState.advancePhase();
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
```

**Update Next.js server:**
```typescript
// src/server.ts (create this file)
import { createServer } from 'http';
import next from 'next';
import { initWebSocket } from './lib/websocket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize WebSocket
  initWebSocket(httpServer);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

**Update package.json:**
```json
{
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "next build",
    "start": "NODE_ENV=production ts-node src/server.ts"
  }
}
```

---

### 1.3 Build Game State Machine

**Files to create:**
- `src/lib/game-state-machine.ts` - Core game logic

**Code:**
```typescript
// src/lib/game-state-machine.ts
import { Server as SocketIOServer } from 'socket.io';
import { redis, getSession, setSession } from './redis-client';
import { supabase } from './supabase-client';
import { arciumClient } from './arcium-client';
import type { GamePhase, GameSession } from '@/types/game';

export class GameStateMachine {
  private sessionId: string;
  private io: SocketIOServer;

  constructor(sessionId: string, io: SocketIOServer) {
    this.sessionId = sessionId;
    this.io = io;
  }

  async advancePhase() {
    const session = await getSession(this.sessionId);
    if (!session) throw new Error('Session not found');

    const currentPhase = session.phase as GamePhase;

    switch (currentPhase) {
      case 'lobby':
        return await this.startGame();
      case 'question':
        return await this.processAnswers();
      case 'answering':
        return await this.revealAnswer();
      case 'reveal':
        return await this.showLeaderboard();
      case 'leaderboard':
        return await this.nextQuestionOrFinish();
      case 'finished':
        throw new Error('Game already finished');
    }
  }

  private async startGame() {
    const session = await getSession(this.sessionId);

    // Update session
    session.phase = 'question';
    session.status = 'playing';
    session.current_question_index = 0;
    session.question_started_at = Date.now();
    session.started_at = Date.now();

    await setSession(this.sessionId, session);

    // Load first question
    const question = await this.loadQuestion(0);

    // Broadcast to all clients
    this.io.to(this.sessionId).emit('phase_change', {
      phase: 'question',
      question: {
        index: 0,
        text: question.question_text,
        options: question.choices,
        // DO NOT send correct_answer!
      },
      timeLimit: 20000,
    });

    // Schedule auto-advance after 20s
    setTimeout(() => this.advancePhase(), 20000);

    return session;
  }

  private async processAnswers() {
    const session = await getSession(this.sessionId);

    // Update phase
    session.phase = 'answering';
    await setSession(this.sessionId, session);

    this.io.to(this.sessionId).emit('phase_change', { phase: 'answering' });

    // Get all players and their answers
    const playersData = await redis.hgetall(`session:${this.sessionId}:players`);
    const players = Object.values(playersData).map((p) => JSON.parse(p as string));

    // Validate answers in parallel
    const validationPromises = players.map(async (player) => {
      if (!player.answer) return null;

      return await this.validateAnswer(
        player.id,
        session.current_question_index,
        player.answer,
        session.question_started_at
      );
    });

    const results = await Promise.all(validationPromises);

    // Store results
    await redis.setex(
      `session:${this.sessionId}:question:${session.current_question_index}:results`,
      3600,
      JSON.stringify(results)
    );

    // Auto-advance after 2s
    setTimeout(() => this.advancePhase(), 2000);

    return results;
  }

  private async validateAnswer(
    playerId: string,
    questionIndex: number,
    selectedAnswer: string,
    questionStartTime: number
  ) {
    // Get question from database
    const session = await getSession(this.sessionId);
    const { data: question } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_set_id', session.quiz_id)
      .eq('question_index', questionIndex)
      .single();

    if (!question) throw new Error('Question not found');

    // CRITICAL: Validate on server using Arcium MPC
    const isCorrect = await arciumClient.verifyAnswer(
      selectedAnswer,
      question.blockchain_question_id
    );

    // Calculate score
    let score = 0;
    if (isCorrect) {
      const timeElapsed = (Date.now() - questionStartTime) / 1000;
      const timeBonus = Math.max(0, Math.floor(500 * (1 - timeElapsed / 20)));
      score = 1000 + timeBonus;
    }

    // Update player score
    const playerData = await redis.hget(`session:${this.sessionId}:players`, playerId);
    const player = JSON.parse(playerData as string);
    player.score += score;
    player.correct_answers += isCorrect ? 1 : 0;

    await redis.hset(`session:${this.sessionId}:players`, playerId, JSON.stringify(player));

    // Update leaderboard sorted set
    await redis.zadd(`leaderboard:${this.sessionId}`, player.score, playerId);

    return {
      playerId,
      isCorrect,
      score,
      totalScore: player.score,
    };
  }

  private async revealAnswer() {
    const session = await getSession(this.sessionId);

    // Get question
    const { data: question } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_set_id', session.quiz_id)
      .eq('question_index', session.current_question_index)
      .single();

    // Get results
    const resultsData = await redis.get(
      `session:${this.sessionId}:question:${session.current_question_index}:results`
    );
    const results = JSON.parse(resultsData as string);

    // Update phase
    session.phase = 'reveal';
    await setSession(this.sessionId, session);

    // Broadcast reveal
    this.io.to(this.sessionId).emit('phase_change', {
      phase: 'reveal',
      correctAnswer: question.correct_answer,
      results,
    });

    // Auto-advance after 3s
    setTimeout(() => this.advancePhase(), 3000);

    return { question, results };
  }

  private async showLeaderboard() {
    const session = await getSession(this.sessionId);

    // Get leaderboard from Redis sorted set
    const leaderboardData = await redis.zrevrange(
      `leaderboard:${this.sessionId}`,
      0,
      4, // Top 5
      'WITHSCORES'
    );

    // Parse leaderboard
    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const playerId = leaderboardData[i];
      const score = parseInt(leaderboardData[i + 1] as string);

      const playerData = await redis.hget(`session:${this.sessionId}:players`, playerId);
      const player = JSON.parse(playerData as string);

      leaderboard.push({
        rank: i / 2 + 1,
        id: player.id,
        name: player.name,
        score,
      });
    }

    // Update phase
    session.phase = 'leaderboard';
    await setSession(this.sessionId, session);

    // Broadcast leaderboard
    this.io.to(this.sessionId).emit('phase_change', {
      phase: 'leaderboard',
      leaderboard,
    });

    // Auto-advance after 5s
    setTimeout(() => this.advancePhase(), 5000);

    return leaderboard;
  }

  private async nextQuestionOrFinish() {
    const session = await getSession(this.sessionId);

    // Get total questions
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_set_id', session.quiz_id);

    if (session.current_question_index + 1 < (count || 0)) {
      // More questions - go to next
      session.current_question_index += 1;
      session.question_started_at = Date.now();
      await setSession(this.sessionId, session);

      await this.startGame();
    } else {
      // Game finished
      await this.finalizeGame();
    }
  }

  private async finalizeGame() {
    const session = await getSession(this.sessionId);

    // Get final leaderboard
    const leaderboardData = await redis.zrevrange(
      `leaderboard:${this.sessionId}`,
      0,
      -1, // All players
      'WITHSCORES'
    );

    // Parse and determine winner
    const winner = {
      id: leaderboardData[0],
      score: parseInt(leaderboardData[1] as string),
    };

    const winnerPlayerData = await redis.hget(`session:${this.sessionId}:players`, winner.id);
    const winnerPlayer = JSON.parse(winnerPlayerData as string);

    // Update session
    session.phase = 'finished';
    session.status = 'finished';
    session.ended_at = Date.now();
    session.winner_id = winner.id;

    await setSession(this.sessionId, session);

    // Update database
    await supabase
      .from('game_sessions')
      .update({
        status: 'finished',
        phase: 'finished',
        ended_at: new Date().toISOString(),
        winner_wallet: winnerPlayer.wallet_address,
      })
      .eq('id', this.sessionId);

    // Broadcast final results
    this.io.to(this.sessionId).emit('phase_change', {
      phase: 'finished',
      winner: {
        id: winner.id,
        name: winnerPlayer.name,
        score: winner.score,
        canClaim: !!winnerPlayer.wallet_address,
      },
    });

    return { winner, session };
  }

  private async loadQuestion(index: number) {
    const session = await getSession(this.sessionId);

    const { data: question } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_set_id', session.quiz_id)
      .eq('question_index', index)
      .single();

    return question;
  }
}
```

---

### 1.4 Update API Routes

**Files to update:**
- `src/app/api/game/create-session/route.ts`
- `src/app/api/game/join-session/route.ts`
- `src/app/api/game/submit-answer/route.ts`

**Code:**
```typescript
// src/app/api/game/submit-answer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis-client';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, participantId, answer } = await req.json();

    // Store answer in player data
    const playerData = await redis.hget(`session:${sessionId}:players`, participantId);

    if (!playerData) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = JSON.parse(playerData as string);

    // Check if already answered
    if (player.answer) {
      return NextResponse.json({ error: 'Already answered' }, { status: 400 });
    }

    // Store answer (will be validated in processAnswers phase)
    player.answer = answer;
    player.answered_at = Date.now();

    await redis.hset(`session:${sessionId}:players`, participantId, JSON.stringify(player));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 🔐 Phase 2: Arcium Integration (Week 2)

### 2.1 Update Solana Program

**Files to update:**
- `programs/k3hoot-program/src/lib.rs`

See the detailed Solana program code in ARCHITECTURE.md

**Deploy:**
```bash
cd programs/k3hoot-program
anchor build
anchor deploy --provider.cluster devnet

# Copy program ID and update Anchor.toml and src/lib/constants.ts
```

---

### 2.2 Implement Arcium Client

**Files to create:**
- `src/lib/arcium-client.ts`

**Code:**
```typescript
// src/lib/arcium-client.ts
import { ArciumClient } from '@arcium-hq/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { RescueCipher } from '@/lib/encryption/rescue-cipher';

const ARCIUM_MXE_URL = process.env.NEXT_PUBLIC_ARCIUM_MXE_URL!;

export class ArciumService {
  private client: ArciumClient;
  private connection: Connection;
  private mxePublicKey: Uint8Array | null = null;

  constructor() {
    this.connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
    this.client = new ArciumClient({ mxeUrl: ARCIUM_MXE_URL });
  }

  async getMXEPublicKey(): Promise<Uint8Array> {
    if (this.mxePublicKey) return this.mxePublicKey;

    try {
      const response = await fetch(`${ARCIUM_MXE_URL}/public_key`);
      const data = await response.json();
      this.mxePublicKey = new Uint8Array(data.public_key);
      return this.mxePublicKey;
    } catch (error) {
      console.error('Failed to get MXE public key:', error);
      // Fallback to hardcoded devnet key
      const DEVNET_MXE_KEY = new Uint8Array([/* hardcoded key */]);
      return DEVNET_MXE_KEY;
    }
  }

  async encryptAnswer(answer: string): Promise<{ ciphertext: Uint8Array; nonce: bigint }> {
    const mxeKey = await this.getMXEPublicKey();

    // Convert answer to bytes
    const answerBytes = new Uint8Array([answer.charCodeAt(0)]);

    // Encrypt with x25519 + RescueCipher
    const cipher = new RescueCipher();
    const nonce = BigInt(Date.now());

    const ciphertext = cipher.encrypt(answerBytes, mxeKey, nonce);

    return { ciphertext, nonce };
  }

  async verifyAnswer(userAnswer: string, questionPda: PublicKey): Promise<boolean> {
    // Get encrypted correct answer from blockchain
    const questionAccount = await this.connection.getAccountInfo(questionPda);

    if (!questionAccount) {
      throw new Error('Question not found on-chain');
    }

    // Deserialize question data
    const questionData = deserializeQuestionAccount(questionAccount.data);

    // Encrypt user's answer
    const { ciphertext: encryptedUserAnswer, nonce } = await this.encryptAnswer(userAnswer);

    // Submit to Arcium MPC for comparison
    const result = await this.client.computeComparison({
      encryptedA: encryptedUserAnswer,
      encryptedB: questionData.encryptedAnswer,
      nonce: nonce.toString(),
    });

    return result.isEqual;
  }
}

export const arciumClient = new ArciumService();

function deserializeQuestionAccount(data: Buffer) {
  // Parse Anchor account data
  // This depends on your Anchor IDL
  // Use @coral-xyz/anchor to deserialize
  return {
    encryptedAnswer: new Uint8Array(data.slice(8, 40)), // Example offset
    arciumNonce: BigInt(data.readBigUInt64LE(40)),
    arciumPubkey: new Uint8Array(data.slice(48, 80)),
  };
}
```

---

### 2.3 Quiz Creation with Encryption

**Files to update:**
- `src/app/api/quiz/create/route.ts`

**Code:**
```typescript
// src/app/api/quiz/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { k3hootProgram } from '@/lib/solana-client';
import { arciumClient } from '@/lib/arcium-client';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export async function POST(req: NextRequest) {
  try {
    const { title, questions, rewardAmount, creatorWallet } = await req.json();

    // 1. Create quiz in database first
    const { data: quizSet, error: dbError } = await supabase
      .from('quiz_sets')
      .insert({
        title,
        owner_wallet: creatorWallet,
        total_questions: questions.length,
        reward_amount: rewardAmount,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Derive PDAs
    const [quizPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('quiz'), Buffer.from(quizSet.id)],
      k3hootProgram.programId
    );

    const [rewardPoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('reward'), quizPda.toBuffer()],
      k3hootProgram.programId
    );

    // 3. Create quiz on-chain
    const createQuizTx = await k3hootProgram.methods
      .createQuiz(title, questions.length, new BN(rewardAmount * 1e9))
      .accounts({
        creator: new PublicKey(creatorWallet),
        quizSet: quizPda,
        rewardPool: rewardPoolPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // 4. Encrypt and store questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // Encrypt correct answer with Arcium
      const { ciphertext, nonce } = await arciumClient.encryptAnswer(q.correctAnswer);

      // Derive question PDA
      const [questionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('question'), quizPda.toBuffer(), Buffer.from([i])],
        k3hootProgram.programId
      );

      // Store encrypted question on-chain
      await k3hootProgram.methods
        .addEncryptedQuestion(
          i,
          q.questionText,
          q.options,
          Array.from(ciphertext),
          nonce.toString(),
          Array.from(await arciumClient.getMXEPublicKey())
        )
        .accounts({
          creator: new PublicKey(creatorWallet),
          quizSet: quizPda,
          question: questionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Store in database
      await supabase.from('questions').insert({
        quiz_set_id: quizSet.id,
        question_index: i,
        question_text: q.questionText,
        choices: q.options,
        correct_answer: q.correctAnswer,
        blockchain_question_id: questionPda.toString(),
      });
    }

    // 5. Update quiz with blockchain references
    await supabase
      .from('quiz_sets')
      .update({
        blockchain_quiz_id: quizPda.toString(),
        reward_pool_pda: rewardPoolPda.toString(),
      })
      .eq('id', quizSet.id);

    return NextResponse.json({
      success: true,
      quizId: quizSet.id,
      quizPda: quizPda.toString(),
      createTx: createQuizTx,
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}
```

---

## 🎨 Phase 3: Frontend Updates (Week 3-4)

### 3.1 Update Game Play UI

**Files to update:**
- `src/app/game/[sessionId]/page.tsx`
- `src/hooks/useWebSocket.ts`

**Code:**
```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(sessionId: string, participantId: string, role: 'host' | 'player') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('/', {
      path: '/api/socket',
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Join game
      newSocket.emit('join_game', { sessionId, participantId, role });
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, participantId, role]);

  return { socket, isConnected };
}
```

```typescript
// src/app/game/[sessionId]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { GamePhase } from '@/types/game';

export default function GamePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const participantId = localStorage.getItem('participantId')!;
  const role = localStorage.getItem('role') as 'host' | 'player';

  const { socket, isConnected } = useWebSocket(sessionId, participantId, role);

  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [question, setQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for phase changes
    socket.on('phase_change', (data: any) => {
      console.log('Phase changed:', data);

      setPhase(data.phase);

      if (data.phase === 'question') {
        setQuestion(data.question);
        setTimeLeft(20);
        setSelectedAnswer(null);
      } else if (data.phase === 'reveal') {
        // Show correct answer
      } else if (data.phase === 'leaderboard') {
        setLeaderboard(data.leaderboard);
      } else if (data.phase === 'finished') {
        // Navigate to results
        window.location.href = `/results/${sessionId}`;
      }
    });

    return () => {
      socket.off('phase_change');
    };
  }, [socket, sessionId]);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'question' || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);

    // Submit answer
    await fetch('/api/game/submit-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        participantId,
        answer,
      }),
    });
  };

  if (!isConnected) {
    return <div>Connecting...</div>;
  }

  if (phase === 'lobby') {
    return <div>Waiting for game to start...</div>;
  }

  if (phase === 'question') {
    return (
      <div className="game-container">
        <div className="timer">{timeLeft}s</div>
        <h2>{question?.text}</h2>
        <div className="answers">
          {['A', 'B', 'C', 'D'].map((letter, idx) => (
            <button
              key={letter}
              onClick={() => handleAnswerSelect(letter)}
              disabled={!!selectedAnswer}
              className={selectedAnswer === letter ? 'selected' : ''}
            >
              {letter}. {question?.options[idx]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'leaderboard') {
    return (
      <div>
        <h2>Leaderboard</h2>
        <ol>
          {leaderboard.map((player) => (
            <li key={player.id}>
              {player.rank}. {player.name} - {player.score}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return <div>Phase: {phase}</div>;
}
```

---

### 3.2 Implement Reward Claiming

**Files to create:**
- `src/app/results/[sessionId]/page.tsx`
- `src/app/api/game/claim-reward/route.ts`

See detailed code in ARCHITECTURE.md

---

## 🧪 Phase 4: Testing & Deployment (Week 5)

### 4.1 Integration Tests

```typescript
// tests/game-flow.test.ts
import { describe, it, expect } from 'vitest';

describe('Full Game Flow', () => {
  it('should complete a game with 2 players', async () => {
    // 1. Create quiz
    const quiz = await createQuiz({
      title: 'Test Quiz',
      questions: [
        { text: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
      ],
      rewardAmount: 0.1,
    });

    // 2. Create session
    const session = await createSession(quiz.id);

    // 3. Join players
    const player1 = await joinSession(session.pin, 'Alice');
    const player2 = await joinSession(session.pin, 'Bob');

    // 4. Start game
    await advancePhase(session.id);

    // 5. Submit answers
    await submitAnswer(player1.id, 'B'); // Correct
    await submitAnswer(player2.id, 'A'); // Wrong

    // 6. Wait for game to finish
    await new Promise((r) => setTimeout(r, 30000)); // 20s question + 3s reveal + 5s leaderboard

    // 7. Check winner
    const finalSession = await getSession(session.id);
    expect(finalSession.winner_id).toBe(player1.id);
  });
});
```

---

### 4.2 Load Testing

```typescript
// tests/load-test.ts
import { io } from 'socket.io-client';

async function loadTest() {
  const sessionId = 'test-session';
  const playerCount = 100;

  const sockets = [];

  // Connect 100 players
  for (let i = 0; i < playerCount; i++) {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      socket.emit('join_game', {
        sessionId,
        participantId: `player-${i}`,
        role: 'player',
      });
    });

    sockets.push(socket);
  }

  console.log(`${playerCount} players connected`);

  // Simulate answer submissions
  setTimeout(() => {
    sockets.forEach((socket) => {
      socket.emit('submit_answer', {
        answer: 'B',
      });
    });

    console.log('All answers submitted');
  }, 5000);
}

loadTest();
```

---

### 4.3 Deploy to Production

```bash
# 1. Build Solana program
cd programs/k3hoot-program
anchor build
anchor deploy --provider.cluster mainnet-beta

# 2. Deploy Next.js app
npm run build
npm run start

# Or deploy to Vercel
vercel deploy --prod
```

---

## ✅ Checklist

### Week 1: Backend
- [ ] Setup Redis (local or Upstash)
- [ ] Implement WebSocket server (Socket.IO)
- [ ] Build GameStateMachine class
- [ ] Update API routes to use Redis
- [ ] Test phase transitions

### Week 2: Blockchain
- [ ] Update Solana program with encryption
- [ ] Implement Arcium client
- [ ] Create quiz with encrypted answers
- [ ] Test answer validation via Arcium MPC
- [ ] Deploy program to devnet

### Week 3-4: Frontend
- [ ] Update game UI to use WebSocket
- [ ] Implement real-time phase updates
- [ ] Add leaderboard animations
- [ ] Build reward claiming flow
- [ ] Test on mobile devices

### Week 5: Launch
- [ ] Integration testing
- [ ] Load testing (100+ players)
- [ ] Security audit
- [ ] Deploy to mainnet
- [ ] Launch! 🚀

---

## 📚 Resources

- [Socket.IO Docs](https://socket.io/docs/v4/)
- [Redis Commands](https://redis.io/commands/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Arcium Documentation](https://docs.arcium.com/)
- [Solana Cookbook](https://solanacookbook.com/)

---

## 💡 Tips

1. **Start with local testing**: Use local Redis and devnet Solana
2. **Incremental development**: Test each phase of the state machine individually
3. **Monitor performance**: Use console.time() to track phase transition times
4. **Handle edge cases**: Network disconnections, duplicate answers, etc.
5. **Keep it simple**: Don't over-engineer - focus on the 3 core goals

---

Ready to build! 🎯
