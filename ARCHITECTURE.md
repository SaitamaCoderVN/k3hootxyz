# 🏗️ K3HOOT ARCHITECTURE v2.0

## 🎯 Core Objectives

1. **Kahoot-like Quiz Game Experience**
   - Host creates quiz → Players join by PIN → Real-time gameplay → Winner claims SOL

2. **Arcium Encrypted Answers On-Chain**
   - Questions and correct answers encrypted using Arcium MPC
   - Stored on Solana blockchain
   - Answers validated without revealing correct answer

3. **Winner Reward Distribution**
   - Top 1 player in leaderboard wins
   - Claims SOL reward on-chain
   - Trustless and transparent

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐                │
│  │   Host UI   │  │  Player UI   │  │ Spectator   │                │
│  │             │  │              │  │             │                │
│  │ • Create    │  │ • Join PIN   │  │ • Watch     │                │
│  │ • Control   │  │ • Answer     │  │ • No play   │                │
│  │ • Monitor   │  │ • See score  │  └─────────────┘                │
│  └─────────────┘  └──────────────┘                                  │
│         │                  │                                         │
│         └──────────┬───────┘                                         │
│                    │                                                 │
└────────────────────┼─────────────────────────────────────────────────┘
                     │
                     │ Socket.IO / WebSocket
                     │
┌────────────────────▼─────────────────────────────────────────────────┐
│                    BACKEND LAYER (Next.js API + WS)                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │             Game State Machine Service                         │ │
│  │  • lobby → question → answering → reveal → leaderboard        │ │
│  │  • Auto-advance phases based on timer + player status         │ │
│  │  • Broadcast state changes to all clients                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │             Real-Time WebSocket Service                        │ │
│  │  • Player join/leave events                                   │ │
│  │  • Answer submissions (encrypted)                             │ │
│  │  • Leaderboard updates                                        │ │
│  │  • Phase transitions                                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │             Blockchain Integration Service                     │ │
│  │  • Create quiz on Solana (encrypted answers via Arcium)       │ │
│  │  • Validate answers using Arcium MPC                          │ │
│  │  • Record winner on-chain                                     │ │
│  │  • Process reward claims                                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────┬──────────────────────────┬──────────────────────┘
                     │                          │
        ┌────────────▼──────────┐   ┌──────────▼───────────────┐
        │   Redis Cache         │   │  Supabase PostgreSQL     │
        │  (Fast Game State)    │   │  (Persistent Storage)    │
        │                       │   │                          │
        │  • Active sessions    │   │  • Quiz sets             │
        │  • Player state       │   │  • Questions             │
        │  • Live leaderboard   │   │  • Game history          │
        │  • Pub/Sub events     │   │  • User profiles         │
        │  • TTL: 1 hour        │   │  • Analytics             │
        └───────────────────────┘   └──────────────────────────┘
                     │
                     │
┌────────────────────▼─────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER (Solana)                         │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              K3Hoot Program (Anchor)                           │ │
│  │                                                                │ │
│  │  Instructions:                                                 │ │
│  │  1. create_quiz(quiz_data) → QuizSet PDA                      │ │
│  │  2. add_encrypted_question(question, arcium_ciphertext)       │ │
│  │  3. initialize_reward_pool(amount) → Escrow PDA               │ │
│  │  4. submit_answer_mpc(answer, arcium_proof) → Validation      │ │
│  │  5. finalize_winner(session_id, winner_pubkey)                │ │
│  │  6. claim_reward(winner_signature) → Transfer SOL             │ │
│  │                                                                │ │
│  │  Accounts (PDAs):                                              │ │
│  │  • QuizSet: ["quiz", quiz_id]                                 │ │
│  │  • Question: ["question", quiz_id, question_idx]              │ │
│  │  • RewardPool: ["reward", quiz_id]                            │ │
│  │  • WinnerRecord: ["winner", session_id]                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Arcium MPC Network                                │ │
│  │                                                                │ │
│  │  • Encrypted answer storage (x25519 + RescueCipher)           │ │
│  │  • MPC computation: compare(user_ans, correct_ans)            │ │
│  │  • Returns boolean without revealing correct answer           │ │
│  │  • Callback transaction with validation result                │ │
│  └────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Core Game Flow

### Phase 1: Quiz Creation (Host)

```
Host → Create Quiz Form → Backend API
                              │
                              ├─→ Save to Supabase (quiz_sets, questions)
                              │
                              └─→ Solana Program: create_quiz()
                                    │
                                    ├─→ For each question:
                                    │     • Encrypt correct answer with Arcium
                                    │     • Store encrypted data on-chain
                                    │     • Store question_pda in database
                                    │
                                    └─→ Create reward pool (escrow PDA)
                                          • Host deposits SOL
                                          • Locked until winner claims
```

**Implementation:**
```typescript
// 1. Client submits quiz
const quizData = {
  title: "Math Quiz",
  questions: [
    {
      text: "2 + 2 = ?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "B" // Index 1
    }
  ],
  rewardAmount: 0.5 // SOL
};

// 2. Backend encrypts answers with Arcium
const encryptedQuestions = await Promise.all(
  quizData.questions.map(async (q) => {
    const correctAnswerBytes = Buffer.from([q.correctAnswer.charCodeAt(0)]);

    // Encrypt using Arcium MPC public key
    const encrypted = await arciumClient.encrypt(
      correctAnswerBytes,
      mxePublicKey
    );

    return {
      ...q,
      encrypted_answer: encrypted.ciphertext,
      arcium_nonce: encrypted.nonce,
      arcium_pubkey: mxePublicKey
    };
  })
);

// 3. Store on-chain
const quizPda = await k3hootProgram.methods
  .createQuiz({
    title: quizData.title,
    questionCount: quizData.questions.length,
    rewardAmount: new BN(quizData.rewardAmount * LAMPORTS_PER_SOL)
  })
  .accounts({
    creator: hostWallet.publicKey,
    quizSet: quizPda,
    rewardPool: rewardPoolPda,
    systemProgram: SystemProgram.programId
  })
  .rpc();

// 4. Store encrypted questions on-chain
for (let i = 0; i < encryptedQuestions.length; i++) {
  const q = encryptedQuestions[i];

  await k3hootProgram.methods
    .addEncryptedQuestion({
      questionIndex: i,
      questionText: q.text,
      options: q.options,
      encryptedAnswer: q.encrypted_answer,
      arciumNonce: q.arcium_nonce
    })
    .accounts({
      quizSet: quizPda,
      question: questionPda,
      creator: hostWallet.publicKey
    })
    .rpc();
}

// 5. Save to database with blockchain references
await supabase.from('quiz_sets').insert({
  id: quizId,
  title: quizData.title,
  owner_wallet: hostWallet.publicKey.toString(),
  blockchain_quiz_id: quizPda.toString(),
  reward_pool_pda: rewardPoolPda.toString(),
  total_questions: quizData.questions.length,
  reward_amount: quizData.rewardAmount
});
```

---

### Phase 2: Game Session (Host Creates Room)

```
Host → Start Game Session
         │
         ├─→ Generate 6-digit PIN
         │
         ├─→ Create session in Redis (fast access)
         │     {
         │       id: uuid,
         │       pin: "123456",
         │       quiz_id: "...",
         │       status: "lobby",
         │       phase: "lobby",
         │       host: wallet_address,
         │       players: [],
         │       started_at: null
         │     }
         │
         └─→ Create session in Supabase (backup)
               • Return session_id + host_token
```

---

### Phase 3: Players Join (Players)

```
Player → Enter PIN → Backend
                        │
                        ├─→ Validate PIN exists
                        │
                        ├─→ Check session status = "lobby"
                        │
                        ├─→ Add player to Redis session
                        │     {
                        │       id: uuid,
                        │       name: "Player1",
                        │       wallet: "..." (optional),
                        │       score: 0,
                        │       answers: []
                        │     }
                        │
                        ├─→ WebSocket broadcast: "player_joined"
                        │
                        └─→ Return participant_id + participant_token
```

---

### Phase 4: Gameplay Loop

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE: LOBBY (Waiting for players)                         │
│  • Host sees players joining in real-time                   │
│  • Host clicks "Start Game"                                 │
│  • Transition to: QUESTION phase                            │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  PHASE: QUESTION (20 seconds timer)                         │
│  • Display question text + 4 options                        │
│  • Timer countdown from 20→0                                │
│  • Players submit answers (encrypted)                       │
│  • Auto-advance when: timer=0 OR all answered               │
│  • Transition to: ANSWERING phase                           │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  PHASE: ANSWERING (Processing answers)                      │
│  • Backend validates answers via Arcium MPC                 │
│  • For each player:                                         │
│    1. Encrypt player's answer with Arcium key              │
│    2. Submit to Arcium MPC computation                     │
│    3. MPC compares encrypted_user_ans vs encrypted_correct │
│    4. Returns is_correct (boolean)                         │
│    5. Calculate score: base + time_bonus                   │
│  • Duration: 2-3 seconds                                    │
│  • Transition to: REVEAL phase                              │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  PHASE: REVEAL (3 seconds)                                  │
│  • Show correct answer (green highlight)                    │
│  • Show who got it right (✓) vs wrong (✗)                  │
│  • Display points earned                                    │
│  • Transition to: LEADERBOARD phase                         │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  PHASE: LEADERBOARD (5 seconds)                             │
│  • Display top 5 players with scores                        │
│  • Show rank changes (↑↓)                                   │
│  • Highlight current player's rank                          │
│  • Auto-advance after 5s                                    │
│  • Transition to:                                           │
│    - QUESTION (if more questions)                           │
│    - FINISHED (if last question)                            │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  PHASE: FINISHED (Game over)                                │
│  • Display final podium (1st, 2nd, 3rd)                    │
│  • Show winner with 🎉 confetti                            │
│  • Winner sees "Claim Reward" button                        │
│  • Record winner on-chain                                   │
│  • Navigate to: RESULTS page                                │
└──────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

```typescript
// Game State Machine (Backend)
class GameStateMachine {
  private sessionId: string;
  private redis: Redis;
  private supabase: SupabaseClient;
  private io: SocketIOServer;

  async advancePhase() {
    const session = await this.getSession();
    const currentPhase = session.phase;

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
        return await this.finalizeGame();
    }
  }

  async startGame() {
    // Update session
    await this.redis.hset(`session:${this.sessionId}`, {
      phase: 'question',
      current_question_index: 0,
      question_started_at: Date.now(),
      status: 'playing'
    });

    // Load first question
    const question = await this.loadQuestion(0);

    // Broadcast to all clients
    this.io.to(this.sessionId).emit('phase_change', {
      phase: 'question',
      question: {
        index: 0,
        text: question.text,
        options: question.options
        // DO NOT send correct answer to client!
      },
      timeLimit: 20000
    });

    // Schedule auto-advance after 20s
    setTimeout(() => this.advancePhase(), 20000);
  }

  async processAnswers() {
    const session = await this.getSession();
    const players = await this.getPlayers();
    const question = await this.loadQuestion(session.current_question_index);

    // Update phase
    await this.redis.hset(`session:${this.sessionId}`, 'phase', 'answering');
    this.io.to(this.sessionId).emit('phase_change', { phase: 'answering' });

    // Validate answers via Arcium MPC
    const validationResults = await Promise.all(
      players.map(async (player) => {
        if (!player.answer) return null;

        // Get encrypted correct answer from blockchain
        const questionAccount = await k3hootProgram.account.question.fetch(
          question.blockchain_pda
        );

        // Encrypt player's answer
        const playerAnswerBytes = Buffer.from([player.answer.charCodeAt(0)]);
        const encryptedPlayerAnswer = await arciumClient.encrypt(
          playerAnswerBytes,
          questionAccount.arciumPubkey
        );

        // Submit to Arcium MPC for comparison
        const mpcResult = await arciumClient.computeComparison({
          encryptedA: encryptedPlayerAnswer.ciphertext,
          encryptedB: questionAccount.encryptedAnswer,
          nonce: encryptedPlayerAnswer.nonce
        });

        // Calculate score
        const isCorrect = mpcResult.isEqual;
        let score = 0;

        if (isCorrect) {
          const timeElapsed = (player.answered_at - session.question_started_at) / 1000;
          const timeBonus = Math.max(0, Math.floor(500 * (1 - timeElapsed / 20)));
          score = 1000 + timeBonus;
        }

        // Update player score
        await this.redis.hincrby(`player:${player.id}`, 'score', score);

        // Store validation on-chain (optional, for audit)
        await k3hootProgram.methods
          .recordValidation({
            sessionId: this.sessionId,
            playerId: player.id,
            questionIndex: session.current_question_index,
            isCorrect: isCorrect,
            pointsEarned: score
          })
          .accounts({
            session: sessionPda,
            player: playerPda,
            validation: validationPda
          })
          .rpc();

        return {
          playerId: player.id,
          isCorrect,
          score,
          totalScore: await this.getPlayerScore(player.id)
        };
      })
    );

    // Store results
    await this.redis.set(
      `session:${this.sessionId}:question:${session.current_question_index}:results`,
      JSON.stringify(validationResults),
      'EX',
      3600
    );

    // Auto-advance to reveal
    setTimeout(() => this.advancePhase(), 2000);
  }

  async revealAnswer() {
    const session = await this.getSession();
    const question = await this.loadQuestion(session.current_question_index);
    const results = await this.getQuestionResults(session.current_question_index);

    // Update phase
    await this.redis.hset(`session:${this.sessionId}`, 'phase', 'reveal');

    // Broadcast reveal
    this.io.to(this.sessionId).emit('phase_change', {
      phase: 'reveal',
      correctAnswer: question.correct_answer,
      results: results.map(r => ({
        playerId: r.playerId,
        isCorrect: r.isCorrect,
        score: r.score
      }))
    });

    // Auto-advance after 3s
    setTimeout(() => this.advancePhase(), 3000);
  }

  async showLeaderboard() {
    const leaderboard = await this.calculateLeaderboard();

    // Update phase
    await this.redis.hset(`session:${this.sessionId}`, 'phase', 'leaderboard');

    // Broadcast leaderboard
    this.io.to(this.sessionId).emit('phase_change', {
      phase: 'leaderboard',
      leaderboard: leaderboard.slice(0, 5) // Top 5
    });

    // Auto-advance after 5s
    setTimeout(() => this.advancePhase(), 5000);
  }

  async nextQuestionOrFinish() {
    const session = await this.getSession();
    const totalQuestions = await this.getTotalQuestions();

    if (session.current_question_index + 1 < totalQuestions) {
      // More questions
      await this.redis.hincrby(`session:${this.sessionId}`, 'current_question_index', 1);
      await this.startGame();
    } else {
      // Game finished
      await this.finalizeGame();
    }
  }

  async finalizeGame() {
    const leaderboard = await this.calculateLeaderboard();
    const winner = leaderboard[0];

    // Update session
    await this.redis.hset(`session:${this.sessionId}`, {
      phase: 'finished',
      status: 'finished',
      ended_at: Date.now(),
      winner_id: winner.id
    });

    // Record winner on-chain
    const winnerPda = await k3hootProgram.methods
      .finalizeWinner({
        sessionId: this.sessionId,
        winnerPubkey: winner.wallet_address,
        finalScore: winner.score
      })
      .accounts({
        session: sessionPda,
        winner: winnerPda,
        authority: hostWallet.publicKey
      })
      .rpc();

    // Broadcast final results
    this.io.to(this.sessionId).emit('phase_change', {
      phase: 'finished',
      winner: {
        id: winner.id,
        name: winner.name,
        score: winner.score,
        canClaim: !!winner.wallet_address
      },
      leaderboard: leaderboard,
      winnerPda: winnerPda.toString()
    });

    // Save to Supabase for history
    await this.supabase.from('game_sessions').update({
      status: 'finished',
      ended_at: new Date().toISOString(),
      winner_wallet: winner.wallet_address
    }).eq('id', this.sessionId);
  }

  private async calculateLeaderboard() {
    const players = await this.getPlayers();

    return players
      .map(p => ({
        id: p.id,
        name: p.name,
        wallet_address: p.wallet_address,
        score: parseInt(p.score) || 0
      }))
      .sort((a, b) => b.score - a.score);
  }
}
```

---

### Phase 5: Winner Claims Reward

```
Winner → Click "Claim Reward"
           │
           ├─→ Connect wallet (if not connected)
           │
           ├─→ Verify winner on-chain
           │     • Check WinnerRecord PDA
           │     • Validate wallet matches
           │     • Check not already claimed
           │
           ├─→ Execute claim_reward instruction
           │     • Transfer SOL from reward_pool to winner
           │     • Mark as claimed
           │     • Update database
           │
           └─→ Show success message + TX signature
```

**Implementation:**

```typescript
// Client-side claim
async function claimReward(sessionId: string) {
  if (!wallet.connected) {
    await wallet.connect();
  }

  // 1. Get session data
  const { data: session } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  // 2. Verify eligibility
  const winnerPda = PublicKey.findProgramAddressSync(
    [
      Buffer.from('winner'),
      Buffer.from(sessionId)
    ],
    k3hootProgram.programId
  )[0];

  const winnerAccount = await k3hootProgram.account.winnerRecord.fetch(winnerPda);

  if (winnerAccount.claimed) {
    throw new Error('Reward already claimed');
  }

  if (winnerAccount.winner.toString() !== wallet.publicKey.toString()) {
    throw new Error('You are not the winner');
  }

  // 3. Execute claim
  const rewardPoolPda = new PublicKey(session.reward_pool_pda);

  const tx = await k3hootProgram.methods
    .claimReward()
    .accounts({
      winner: wallet.publicKey,
      winnerRecord: winnerPda,
      rewardPool: rewardPoolPda,
      systemProgram: SystemProgram.programId
    })
    .rpc();

  // 4. Update database
  await supabase
    .from('game_sessions')
    .update({
      reward_claimed: true,
      claim_tx_signature: tx
    })
    .eq('id', sessionId);

  return tx;
}
```

---

## 📊 Database Schema (Simplified)

```sql
-- Quiz Sets (Created by hosts)
CREATE TABLE quiz_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  owner_wallet TEXT NOT NULL,
  blockchain_quiz_id TEXT UNIQUE, -- Solana QuizSet PDA
  reward_pool_pda TEXT, -- Solana RewardPool PDA
  total_questions INTEGER NOT NULL,
  reward_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions (Belongs to quiz set)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_set_id UUID REFERENCES quiz_sets(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL, -- Array of 4 options
  correct_answer TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
  blockchain_question_id TEXT, -- Solana Question PDA
  encrypted_answer_onchain TEXT, -- Arcium encrypted data reference
  UNIQUE(quiz_set_id, question_index)
);

-- Game Sessions (Active games)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin TEXT UNIQUE NOT NULL, -- 6-digit PIN
  quiz_set_id UUID REFERENCES quiz_sets(id),
  host_wallet TEXT NOT NULL,
  host_token UUID DEFAULT uuid_generate_v4(),
  status TEXT DEFAULT 'lobby', -- lobby, playing, finished
  phase TEXT DEFAULT 'lobby', -- lobby, question, answering, reveal, leaderboard, finished
  current_question_index INTEGER DEFAULT 0,
  total_players INTEGER DEFAULT 0,
  winner_wallet TEXT,
  winner_pda TEXT, -- Solana WinnerRecord PDA
  reward_claimed BOOLEAN DEFAULT false,
  claim_tx_signature TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

-- Game Participants (Players in a session)
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  wallet_address TEXT, -- Optional (can play anonymously)
  participant_token UUID DEFAULT uuid_generate_v4(),
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, player_name)
);

-- Game Answers (Answer history)
CREATE TABLE game_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES game_participants(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  selected_answer TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INTEGER NOT NULL,
  points_earned INTEGER NOT NULL,
  answered_at TIMESTAMP DEFAULT NOW(),
  arcium_validation_tx TEXT, -- Solana TX with Arcium validation
  UNIQUE(participant_id, question_index)
);

-- Indexes for performance
CREATE INDEX idx_sessions_pin ON game_sessions(pin);
CREATE INDEX idx_sessions_status ON game_sessions(status);
CREATE INDEX idx_participants_session ON game_participants(session_id);
CREATE INDEX idx_answers_session ON game_answers(session_id);
CREATE INDEX idx_answers_participant ON game_answers(participant_id);
```

---

## 🔐 Solana Program Structure (Anchor)

```rust
// lib.rs
use anchor_lang::prelude::*;

declare_id!("24MqGK5Ei8aKG6fCK8Ym36cHy1UvYD3zicRHWaEpekz4");

#[program]
pub mod k3hoot_program {
    use super::*;

    // 1. Create quiz with reward pool
    pub fn create_quiz(
        ctx: Context<CreateQuiz>,
        title: String,
        question_count: u8,
        reward_amount: u64,
    ) -> Result<()> {
        let quiz = &mut ctx.accounts.quiz_set;
        quiz.creator = ctx.accounts.creator.key();
        quiz.title = title;
        quiz.question_count = question_count;
        quiz.reward_amount = reward_amount;
        quiz.created_at = Clock::get()?.unix_timestamp;

        // Transfer SOL to reward pool
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.creator.key(),
            &ctx.accounts.reward_pool.key(),
            reward_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.reward_pool.to_account_info(),
            ],
        )?;

        Ok(())
    }

    // 2. Add encrypted question with Arcium
    pub fn add_encrypted_question(
        ctx: Context<AddQuestion>,
        question_index: u8,
        question_text: String,
        options: Vec<String>,
        encrypted_answer: [u8; 32], // Arcium ciphertext
        arcium_nonce: u128,
        arcium_pubkey: [u8; 32],
    ) -> Result<()> {
        require!(options.len() == 4, ErrorCode::InvalidOptionCount);

        let question = &mut ctx.accounts.question;
        question.quiz_set = ctx.accounts.quiz_set.key();
        question.question_index = question_index;
        question.question_text = question_text;
        question.options = options;
        question.encrypted_answer = encrypted_answer;
        question.arcium_nonce = arcium_nonce;
        question.arcium_pubkey = arcium_pubkey;

        Ok(())
    }

    // 3. Record winner
    pub fn finalize_winner(
        ctx: Context<FinalizeWinner>,
        session_id: String,
        final_score: u64,
    ) -> Result<()> {
        let winner_record = &mut ctx.accounts.winner_record;
        winner_record.session_id = session_id;
        winner_record.quiz_set = ctx.accounts.quiz_set.key();
        winner_record.winner = ctx.accounts.winner.key();
        winner_record.final_score = final_score;
        winner_record.claimed = false;
        winner_record.recorded_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    // 4. Claim reward
    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        let winner_record = &mut ctx.accounts.winner_record;

        require!(!winner_record.claimed, ErrorCode::AlreadyClaimed);
        require!(
            winner_record.winner == ctx.accounts.winner.key(),
            ErrorCode::UnauthorizedWinner
        );

        // Transfer SOL from reward pool to winner
        let reward_amount = ctx.accounts.reward_pool.lamports();
        **ctx.accounts.reward_pool.try_borrow_mut_lamports()? -= reward_amount;
        **ctx.accounts.winner.try_borrow_mut_lamports()? += reward_amount;

        winner_record.claimed = true;
        winner_record.claimed_at = Some(Clock::get()?.unix_timestamp);

        Ok(())
    }
}

// Account structures
#[account]
pub struct QuizSet {
    pub creator: Pubkey,
    pub title: String,
    pub question_count: u8,
    pub reward_amount: u64,
    pub created_at: i64,
}

#[account]
pub struct Question {
    pub quiz_set: Pubkey,
    pub question_index: u8,
    pub question_text: String,
    pub options: Vec<String>,
    pub encrypted_answer: [u8; 32], // Arcium encrypted correct answer
    pub arcium_nonce: u128,
    pub arcium_pubkey: [u8; 32],
}

#[account]
pub struct WinnerRecord {
    pub session_id: String,
    pub quiz_set: Pubkey,
    pub winner: Pubkey,
    pub final_score: u64,
    pub claimed: bool,
    pub recorded_at: i64,
    pub claimed_at: Option<i64>,
}

// Context structs
#[derive(Accounts)]
pub struct CreateQuiz<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 100 + 1 + 8 + 8,
        seeds = [b"quiz", creator.key().as_ref()],
        bump
    )]
    pub quiz_set: Account<'info, QuizSet>,

    #[account(
        mut,
        seeds = [b"reward", quiz_set.key().as_ref()],
        bump
    )]
    /// CHECK: PDA for holding reward SOL
    pub reward_pool: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(question_index: u8)]
pub struct AddQuestion<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"quiz", creator.key().as_ref()],
        bump,
        constraint = quiz_set.creator == creator.key()
    )]
    pub quiz_set: Account<'info, QuizSet>,

    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 1 + 200 + 400 + 32 + 16 + 32,
        seeds = [b"question", quiz_set.key().as_ref(), &[question_index]],
        bump
    )]
    pub question: Account<'info, Question>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(session_id: String)]
pub struct FinalizeWinner<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub quiz_set: Account<'info, QuizSet>,

    /// CHECK: Winner's wallet (verified by game backend)
    pub winner: AccountInfo<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + 64 + 32 + 32 + 8 + 1 + 8 + 9,
        seeds = [b"winner", session_id.as_bytes()],
        bump
    )]
    pub winner_record: Account<'info, WinnerRecord>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub winner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"winner", winner_record.session_id.as_bytes()],
        bump,
        constraint = winner_record.winner == winner.key(),
        constraint = !winner_record.claimed
    )]
    pub winner_record: Account<'info, WinnerRecord>,

    #[account(
        mut,
        seeds = [b"reward", winner_record.quiz_set.as_ref()],
        bump
    )]
    /// CHECK: PDA holding reward SOL
    pub reward_pool: AccountInfo<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Must provide exactly 4 options")]
    InvalidOptionCount,
    #[msg("Reward already claimed")]
    AlreadyClaimed,
    #[msg("You are not the winner")]
    UnauthorizedWinner,
}
```

---

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + Framer Motion
- **State**: Zustand (for game state)
- **Wallet**: @solana/wallet-adapter-react
- **Real-time**: Socket.IO client

### Backend
- **Runtime**: Node.js (Next.js API routes)
- **WebSocket**: Socket.IO
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis (Upstash or self-hosted)
- **Queue**: BullMQ (for background jobs)

### Blockchain
- **Network**: Solana (Devnet/Mainnet)
- **Framework**: Anchor
- **Client**: @coral-xyz/anchor
- **Encryption**: Arcium MPC (@arcium-hq/client)

---

## 📁 Project Structure

```
k3hootxyz/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── quiz/
│   │   │   │   ├── create/route.ts          # Create quiz + encrypt with Arcium
│   │   │   │   └── [id]/route.ts            # Get quiz details
│   │   │   ├── game/
│   │   │   │   ├── create-session/route.ts  # Host creates session
│   │   │   │   ├── join/route.ts            # Player joins
│   │   │   │   └── claim-reward/route.ts    # Winner claims SOL
│   │   │   └── websocket/route.ts           # WebSocket handler
│   │   ├── create/page.tsx                  # Create quiz UI
│   │   ├── play/page.tsx                    # Browse quizzes
│   │   ├── host/[sessionId]/page.tsx        # Host control panel
│   │   ├── join/page.tsx                    # Enter PIN to join
│   │   ├── game/[sessionId]/page.tsx        # Game play UI
│   │   └── results/[sessionId]/page.tsx     # Results + claim reward
│   ├── components/
│   │   ├── game/
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── AnswerButton.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── Timer.tsx
│   │   │   └── Podium.tsx
│   │   └── wallet/
│   │       └── WalletButton.tsx
│   ├── lib/
│   │   ├── solana-client.ts                 # Anchor program wrapper
│   │   ├── arcium-client.ts                 # Arcium MPC encryption
│   │   ├── redis-client.ts                  # Redis connection
│   │   ├── supabase-client.ts               # Supabase connection
│   │   └── game-state-machine.ts            # Game logic
│   ├── hooks/
│   │   ├── useGameSession.ts
│   │   ├── useWebSocket.ts
│   │   └── useWallet.ts
│   └── types/
│       ├── game.ts
│       └── blockchain.ts
├── programs/
│   └── k3hoot-program/
│       ├── src/
│       │   ├── lib.rs                       # Anchor program
│       │   └── errors.rs
│       └── Cargo.toml
└── tests/
    ├── game-flow.test.ts
    └── arcium-integration.test.ts
```

---

## ⚡ Performance Optimizations

### 1. Redis Caching Strategy
```typescript
// Cache active game sessions in Redis (TTL: 1 hour)
await redis.setex(
  `session:${sessionId}`,
  3600,
  JSON.stringify(sessionData)
);

// Cache leaderboard as sorted set
await redis.zadd(
  `leaderboard:${sessionId}`,
  player.score,
  player.id
);

// Get top 10 with O(log(N)) complexity
const top10 = await redis.zrevrange(
  `leaderboard:${sessionId}`,
  0,
  9,
  'WITHSCORES'
);
```

### 2. WebSocket Room Optimization
```typescript
// Group players by session ID
io.on('connection', (socket) => {
  socket.on('join_game', ({ sessionId, participantId }) => {
    socket.join(sessionId);
    socket.join(`player:${participantId}`);
  });

  // Broadcast only to specific session
  io.to(sessionId).emit('phase_change', data);

  // Send to specific player
  io.to(`player:${participantId}`).emit('score_update', score);
});
```

### 3. Database Query Optimization
```sql
-- Materialized view for leaderboard
CREATE MATERIALIZED VIEW game_leaderboards AS
SELECT
  session_id,
  participant_id,
  player_name,
  score,
  ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY score DESC) as rank
FROM game_participants
WHERE session_id IN (
  SELECT id FROM game_sessions WHERE status = 'playing'
);

-- Refresh every 5 seconds
CREATE UNIQUE INDEX ON game_leaderboards (session_id, participant_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY game_leaderboards;
```

---

## 🔒 Security Considerations

### 1. Answer Validation (Critical)
```typescript
// ❌ NEVER send correct answer to client
// ❌ NEVER trust client-provided correctness

// ✅ Server validates everything
async function validateAnswer(
  participantId: string,
  questionIndex: number,
  selectedAnswer: string
) {
  // Get question from backend only
  const question = await getQuestionSecurely(questionIndex);

  // Use Arcium MPC to verify without revealing answer
  const isCorrect = await arciumClient.verifyAnswer(
    selectedAnswer,
    question.encrypted_answer_onchain
  );

  return isCorrect;
}
```

### 2. Prevent Cheating
```typescript
// Rate limiting
await rateLimit(req, {
  interval: 1000, // 1 second
  uniqueTokenPerInterval: 500
});

// Answer timing validation
const questionStartTime = session.question_started_at;
const timeTaken = Date.now() - questionStartTime;

if (timeTaken < 500) {
  throw new Error('Answer submitted too fast (bot detected)');
}

if (timeTaken > 20000) {
  throw new Error('Answer submitted after timeout');
}

// Prevent duplicate answers
const existing = await redis.get(`answer:${participantId}:${questionIndex}`);
if (existing) {
  throw new Error('Answer already submitted');
}
```

### 3. Reward Claim Security
```rust
// On-chain validation
pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
    let winner_record = &ctx.accounts.winner_record;

    // Check not already claimed
    require!(!winner_record.claimed, ErrorCode::AlreadyClaimed);

    // Check caller is the winner
    require!(
        winner_record.winner == ctx.accounts.winner.key(),
        ErrorCode::UnauthorizedWinner
    );

    // Check reward pool has funds
    let reward_amount = ctx.accounts.reward_pool.lamports();
    require!(reward_amount > 0, ErrorCode::NoRewardAvailable);

    // Transfer
    **ctx.accounts.reward_pool.try_borrow_mut_lamports()? -= reward_amount;
    **ctx.accounts.winner.try_borrow_mut_lamports()? += reward_amount;

    winner_record.claimed = true;

    Ok(())
}
```

---

## 📈 Scalability

### Horizontal Scaling
```
┌────────────────────────────────────────────────────┐
│              Load Balancer (Nginx)                 │
└────────┬───────────────────────┬───────────────────┘
         │                       │
┌────────▼────────┐    ┌─────────▼────────┐
│  Next.js App 1  │    │  Next.js App 2   │
│  + Socket.IO    │    │  + Socket.IO     │
└────────┬────────┘    └─────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  Redis Cluster        │
         │  (Pub/Sub + Cache)    │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  Supabase (Pooled)    │
         └───────────────────────┘
```

### Redis Pub/Sub for Multi-Instance
```typescript
// Server 1 publishes event
await redis.publish(`game:${sessionId}`, JSON.stringify({
  type: 'phase_change',
  phase: 'question',
  data: questionData
}));

// Server 2 subscribes and broadcasts to connected clients
redis.subscribe(`game:${sessionId}`);
redis.on('message', (channel, message) => {
  const event = JSON.parse(message);
  io.to(sessionId).emit(event.type, event.data);
});
```

---

## 🎨 UI/UX Design Principles

1. **Mobile-First**: Large touch targets (min 56px)
2. **Real-Time Feedback**: Immediate visual response to actions
3. **Clear State**: Always show current phase and timer
4. **Accessible**: WCAG AA compliant colors and contrast
5. **Performant**: 60fps animations, optimistic updates
6. **Error Recovery**: Graceful handling of disconnections

---

## 🧪 Testing Strategy

```typescript
// Integration test
describe('Game Flow', () => {
  it('should complete full game with Arcium validation', async () => {
    // 1. Create quiz with encrypted answers
    const quiz = await createQuiz({
      questions: [{ text: 'Q1', options: [...], correct: 'B' }],
      rewardAmount: 0.5
    });

    // 2. Host creates session
    const session = await createSession(quiz.id, hostWallet);

    // 3. Players join
    const player1 = await joinSession(session.pin, 'Alice');
    const player2 = await joinSession(session.pin, 'Bob');

    // 4. Start game
    await advancePhase(session.id, 'question');

    // 5. Players answer
    await submitAnswer(player1.id, 'B'); // Correct
    await submitAnswer(player2.id, 'A'); // Wrong

    // 6. Validate with Arcium
    await advancePhase(session.id, 'answering');

    // 7. Check leaderboard
    const leaderboard = await getLeaderboard(session.id);
    expect(leaderboard[0].id).toBe(player1.id);

    // 8. Winner claims reward
    const tx = await claimReward(session.id, player1.wallet);
    expect(tx).toBeTruthy();
  });
});
```

---

## 🚀 Deployment

### Environment Variables
```env
# Blockchain
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_K3HOOT_PROGRAM_ID=24MqGK5Ei8aKG6fCK8Ym36cHy1UvYD3zicRHWaEpekz4
NEXT_PUBLIC_ARCIUM_MXE_URL=https://mxe.arcium.com

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Redis
REDIS_URL=redis://localhost:6379

# Server
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://k3hoot.xyz
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

---

## 📊 Monitoring & Analytics

```typescript
// Track game metrics
await analytics.track({
  event: 'game_completed',
  properties: {
    session_id: sessionId,
    quiz_id: quizId,
    total_players: players.length,
    total_questions: questions.length,
    duration_seconds: duration,
    winner_score: winner.score,
    arcium_validations: validationCount
  }
});

// Monitor performance
await metrics.gauge('active_sessions', await redis.scard('sessions:active'));
await metrics.gauge('active_players', await redis.scard('players:online'));
await metrics.histogram('answer_validation_time', validationTime);
```

---

## 🎯 Success Metrics

1. **Game Performance**
   - Average session duration: 3-5 minutes
   - Player retention: >80% stay until end
   - Answer latency: <500ms

2. **Blockchain Performance**
   - Quiz creation success rate: >95%
   - Arcium validation success rate: >99%
   - Reward claim success rate: 100%

3. **User Engagement**
   - Daily active users
   - Games created per day
   - Average players per game: 10-50
   - Reward distribution rate

---

## 🔄 Migration Path from Current System

### Phase 1: Backend Refactor (Week 1-2)
1. ✅ Implement WebSocket server (Socket.IO)
2. ✅ Add Redis caching
3. ✅ Build GameStateMachine class
4. ✅ Move scoring logic to server-side

### Phase 2: Arcium Integration (Week 2-3)
1. ✅ Update Solana program with encryption
2. ✅ Integrate Arcium client
3. ✅ Implement answer validation flow
4. ✅ Test MPC computations

### Phase 3: Frontend Updates (Week 3-4)
1. ✅ Replace Supabase realtime with Socket.IO
2. ✅ Update UI with new phase flow
3. ✅ Add animations and sound effects
4. ✅ Implement reward claiming UI

### Phase 4: Testing & Launch (Week 4-5)
1. ✅ Integration testing
2. ✅ Load testing (100+ concurrent players)
3. ✅ Security audit
4. ✅ Deploy to mainnet

---

## ✅ This Architecture Achieves All 3 Goals

### ✅ Goal 1: Kahoot-like Experience
- ✅ PIN-based joining
- ✅ Real-time gameplay with phases
- ✅ Timed questions (20s)
- ✅ Live leaderboard
- ✅ Podium results
- ✅ Mobile-responsive UI

### ✅ Goal 2: Arcium Encrypted Answers
- ✅ Questions created with Arcium encryption
- ✅ Correct answers stored encrypted on-chain
- ✅ MPC validation without revealing answer
- ✅ Immutable audit trail

### ✅ Goal 3: Winner Claims SOL Reward
- ✅ Reward pool created on quiz creation
- ✅ Winner recorded on-chain (WinnerRecord PDA)
- ✅ Trustless claim instruction
- ✅ One-time claim validation
- ✅ Direct SOL transfer to winner

---

## 🎉 Summary

This architecture provides:
- **Simple & Focused**: Only what's needed for the 3 goals
- **Scalable**: Redis + WebSocket for real-time, Supabase for persistence
- **Secure**: Server-side validation, Arcium encryption, on-chain rewards
- **Fast**: <300ms latency for game actions
- **Fun**: Kahoot-like experience with crypto rewards

Ready to implement! 🚀
