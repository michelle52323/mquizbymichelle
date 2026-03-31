using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Data;
using PlatformAPI.Models.Quizzes;
using PlatformAPI.Models.Users;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace PlatformAPI.Controllers.QuizBuilder
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizCloneController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizCloneController(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------------
        // MAIN ENDPOINT
        // ---------------------------------------------------------
        [HttpPost("{newUserId}")]
        public async Task<IActionResult> CloneSamples(int newUserId)
        {
            // 1. Get template user
            var templateUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == "sampletestcreator");

            if (templateUser == null)
                return BadRequest("Template user not found.");

            // 2. Get all quizzes created by template user
            var templateQuizzes = await _context.Quizzes
                .Where(q => q.CreatedByUserId == templateUser.Id)
                .ToListAsync();

            if (!templateQuizzes.Any())
                return Ok("No sample quizzes to clone.");

            // 3. Clone each quiz
            foreach (var originalQuiz in templateQuizzes)
            {
                await CloneSingleQuiz(originalQuiz, newUserId);
            }

            await _context.SaveChangesAsync();
            return Ok("Sample quizzes cloned successfully.");
        }


        // ---------------------------------------------------------
        // CLONE ONE QUIZ (calls all helper functions)
        // ---------------------------------------------------------
        private async Task CloneSingleQuiz(Quiz originalQuiz, int newUserId)
        {
            // 1. Insert Quiz
            var newQuiz = await InsertQuiz(originalQuiz, newUserId);

            // 2. Insert UserQuiz
            await InsertUserQuiz(newUserId, newQuiz.Id);

            // 3. Clone Questions (returns mapping)
            var questionMap = await CloneQuestions(originalQuiz.Id);

            // 4. Clone QuizQuestion using mapping
            await CloneQuizQuestions(originalQuiz.Id, newQuiz.Id, questionMap);

            // 5. Clone AnswerChoices (returns mapping)
            var answerChoiceMap = await CloneAnswerChoices(questionMap);

            // 6. Clone QuestionAnswer using both mappings
            await CloneQuestionAnswers(questionMap, answerChoiceMap);
        }


        // =====================================================================
        // #region Cloning Functions
        // =====================================================================
        #region Cloning Functions


        // ---------------------------------------------------------
        // 1. Insert Quiz
        // ---------------------------------------------------------
        private async Task<Quiz> InsertQuiz(Quiz original, int newUserId)
        {
            var newQuiz = new Quiz
            {
                SubjectId = original.SubjectId,
                Name = original.Name,
                Description = original.Description,
                SortOrder = original.SortOrder,
                IsActive = original.IsActive,
                IsPublished = original.IsPublished,   // preserve published state
                CreatedByUserId = newUserId,
                DateCreated = DateTime.UtcNow
            };

            _context.Quizzes.Add(newQuiz);
            await _context.SaveChangesAsync();

            return newQuiz;
        }



        // ---------------------------------------------------------
        // 2. Insert UserQuiz
        // ---------------------------------------------------------
        private async Task InsertUserQuiz(int newUserId, int newQuizId)
        {
            var userQuiz = new UserQuiz
            {
                UserId = newUserId,
                QuizId = newQuizId
            };

            _context.UserQuizzes.Add(userQuiz);
            await _context.SaveChangesAsync();
        }



        // ---------------------------------------------------------
        // 3. Clone Questions
        // returns Dictionary<oldQuestionId, newQuestionId>
        // ---------------------------------------------------------
        private async Task<Dictionary<int, int>> CloneQuestions(int originalQuizId)
        {
            // 1. Get all original question IDs via QuizQuestion
            var originalQuestionIds = await _context.QuizQuestions
                .Where(qq => qq.QuizId == originalQuizId)
                .Select(qq => qq.QuestionId)
                .ToListAsync();

            // 2. Load the full Question objects
            var originalQuestions = await _context.Questions
                .Where(q => originalQuestionIds.Contains(q.Id))
                .ToListAsync();

            // Mapping: oldQuestionId -> newQuestionId
            var questionMap = new Dictionary<int, int>();

            foreach (var original in originalQuestions)
            {
                var newQuestion = new Question
                {
                    Description = original.Description,
                    QuestionTypeId = original.QuestionTypeId,
                    SortOrder = original.SortOrder,
                    IsActive = original.IsActive,
                    IsPublished = original.IsPublished
                };

                _context.Questions.Add(newQuestion);
                await _context.SaveChangesAsync();

                questionMap.Add(original.Id, newQuestion.Id);
            }

            return questionMap;
        }



        // ---------------------------------------------------------
        // 4. Clone QuizQuestion
        // ---------------------------------------------------------
        private async Task CloneQuizQuestions(
        int originalQuizId,
        int newQuizId,
        Dictionary<int, int> questionMap)
        {
            // 1. Get all original QuizQuestion rows
            var originalQuizQuestions = await _context.QuizQuestions
                .Where(qq => qq.QuizId == originalQuizId)
                .ToListAsync();

            foreach (var original in originalQuizQuestions)
            {
                // 2. Map old question ID → new question ID
                var newQuestionId = questionMap[original.QuestionId];

                var newQuizQuestion = new QuizQuestion
                {
                    QuizId = newQuizId,
                    QuestionId = newQuestionId
                };

                _context.QuizQuestions.Add(newQuizQuestion);
            }

            await _context.SaveChangesAsync();
        }



        // ---------------------------------------------------------
        // 5. Clone AnswerChoices
        // returns Dictionary<oldAnswerChoiceId, newAnswerChoiceId>
        // ---------------------------------------------------------
        private async Task<Dictionary<int, int>> CloneAnswerChoices(Dictionary<int, int> questionMap)
        {
            // 1. Get all original question IDs
            var originalQuestionIds = questionMap.Keys.ToList();

            // 2. Load all AnswerChoices for those questions
            var originalAnswerChoices = await _context.AnswerChoices
                .Where(ac => originalQuestionIds.Contains(ac.QuestionAnswer.QuestionId))
                .Include(ac => ac.QuestionAnswer)
                .ToListAsync();

            // Mapping: oldAnswerChoiceId → newAnswerChoiceId
            var answerChoiceMap = new Dictionary<int, int>();

            foreach (var original in originalAnswerChoices)
            {
                // 3. Map old question → new question
                var newQuestionId = questionMap[original.QuestionAnswer.QuestionId];

                // 4. Create new AnswerChoice
                var newAnswerChoice = new AnswerChoice
                {
                    Description = original.Description,
                    SortOrder = original.SortOrder,
                    IsCorrect = original.IsCorrect,
                    IsActive = original.IsActive
                };

                _context.AnswerChoices.Add(newAnswerChoice);
                await _context.SaveChangesAsync();

                // 5. Add to mapping
                answerChoiceMap.Add(original.Id, newAnswerChoice.Id);
            }

            return answerChoiceMap;
        }



        // ---------------------------------------------------------
        // 6. Clone QuestionAnswer
        // ---------------------------------------------------------
        private async Task CloneQuestionAnswers(
        Dictionary<int, int> questionMap,
        Dictionary<int, int> answerChoiceMap)
        {
            // 1. Get all original question IDs
            var originalQuestionIds = questionMap.Keys.ToList();

            // 2. Load all original QuestionAnswer rows
            var originalQuestionAnswers = await _context.QuestionAnswers
                .Where(qa => originalQuestionIds.Contains(qa.QuestionId))
                .ToListAsync();

            foreach (var original in originalQuestionAnswers)
            {
                // 3. Map old → new IDs
                var newQuestionId = questionMap[original.QuestionId];
                var newAnswerChoiceId = answerChoiceMap[original.AnswerChoiceId];

                // 4. Create new QuestionAnswer
                var newQA = new QuestionAnswer
                {
                    QuestionId = newQuestionId,
                    AnswerChoiceId = newAnswerChoiceId
                };

                _context.QuestionAnswers.Add(newQA);
            }

            await _context.SaveChangesAsync();
        }



        #endregion
        // =====================================================================
    }
}
