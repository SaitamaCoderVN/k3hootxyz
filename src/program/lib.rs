use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod k3hoot {
    use super::*;

    pub fn initialize_quiz(
        ctx: Context<InitializeQuiz>,
        title: String,
        description: String,
        questions: Vec<String>,
        options: Vec<Vec<String>>,
        correct_answers: Vec<u8>,
        reward: u64,
    ) -> Result<()> {
        let quiz = &mut ctx.accounts.quiz;
        let creator = &ctx.accounts.creator;

        quiz.creator = creator.key();
        quiz.title = title;
        quiz.description = description;
        quiz.questions = questions;
        quiz.options = options;
        quiz.correct_answers = correct_answers;
        quiz.reward = reward;
        quiz.participants = 0;
        quiz.is_active = true;

        // Transfer reward to quiz account
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &creator.key(),
            &quiz.key(),
            reward,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                creator.to_account_info(),
                quiz.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn submit_answers(
        ctx: Context<SubmitAnswers>,
        answers: Vec<u8>,
    ) -> Result<()> {
        let quiz = &mut ctx.accounts.quiz;
        let participant = &ctx.accounts.participant;

        require!(quiz.is_active, ErrorCode::QuizInactive);
        require!(answers.len() == quiz.correct_answers.len(), ErrorCode::InvalidAnswerCount);

        // Calculate score
        let mut score = 0;
        for (i, answer) in answers.iter().enumerate() {
            if *answer == quiz.correct_answers[i] {
                score += 1;
            }
        }

        // Calculate reward based on score
        let reward = (quiz.reward as f64 * (score as f64 / quiz.correct_answers.len() as f64)) as u64;

        // Transfer reward to participant
        **quiz.to_account_info().try_borrow_mut_lamports()? -= reward;
        **participant.to_account_info().try_borrow_mut_lamports()? += reward;

        quiz.participants += 1;

        // Close quiz if all rewards have been distributed
        if **quiz.to_account_info().try_borrow_lamports()? == 0 {
            quiz.is_active = false;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeQuiz<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 100 + 1000 + 1000 + 1000 + 8 + 8 + 1
    )]
    pub quiz: Account<'info, Quiz>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitAnswers<'info> {
    #[account(mut)]
    pub quiz: Account<'info, Quiz>,
    #[account(mut)]
    pub participant: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Quiz {
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub questions: Vec<String>,
    pub options: Vec<Vec<String>>,
    pub correct_answers: Vec<u8>,
    pub reward: u64,
    pub participants: u64,
    pub is_active: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Quiz is not active")]
    QuizInactive,
    #[msg("Invalid number of answers")]
    InvalidAnswerCount,
} 