using Microsoft.EntityFrameworkCore;
using PlatformAPI.Controllers.Users;
using PlatformAPI.Data;
using PlatformAPI.Models.Quizzes;
using PlatformAPI.Services;
using PlatformAPI.DTO.Questions;
using System.Linq;
using PlatformAPI.Controllers.QuizBuilder;

namespace PlatformAPI.Repositories.Quizzes
{
    public class QuestionsRepository : IQuestionsRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SignInController> _logger;

        public QuestionsRepository(AppDbContext context, ILogger<SignInController> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Get Functions

        public async Task<List<Question>> GetQuestionsByQuizIdAsync(int quizId)
        {
            return await _context.Questions
                .Where(q => _context.QuizQuestions
                    .Any(qq => qq.QuizId == quizId && qq.QuestionId == q.Id && q.IsActive))
                .Include(q => q.QuestionType)
                .OrderBy(q => q.SortOrder)
                .ToListAsync();
        }

        public async Task<Question?> GetQuestionByIdAsync(int questionId)
        {
            return await _context.Questions
                .Include(q => q.QuestionType)
                .Where(q => q.IsActive && q.Id == questionId)
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetQuizIdByQuestionIdAsync(int questionId)
        {
            var quizId = await _context.QuizQuestions
                .Where(qq => qq.QuestionId == questionId)
                .Select(qq => qq.QuizId)
                .FirstOrDefaultAsync();

            // If no quiz found, return null instead of 0
            //if (quizId == 0)
            //    return null;

            return quizId;
        }

        public async Task<QuestionPositionDto?> GetQuestionPositionAsync(int questionId)
        {
            // Step 1: Get the quiz ID for this question
            var quizId = await _context.QuizQuestions
                .Where(qq => qq.QuestionId == questionId)
                .Select(qq => qq.QuizId)
                .FirstOrDefaultAsync();

            if (quizId == 0)
                return null;

            // Step 2: Get all active questions for this quiz, ordered by SortOrder
            var activeQuestions = await (
                from q in _context.Questions
                join qq in _context.QuizQuestions on q.Id equals qq.QuestionId
                where qq.QuizId == quizId && q.IsActive
                orderby q.SortOrder
                select q
            ).ToListAsync();

            var total = activeQuestions.Count;

            // Step 3: Determine the current question number
            var index = activeQuestions.FindIndex(q => q.Id == questionId);

            if (index == -1)
                return null;

            return new QuestionPositionDto
            {
                QuizId = quizId,
                TotalQuestions = total,
                CurrentQuestionNumber = index + 1
            };
        }

        public async Task<int> GetActiveQuestionCountAsync(int quizId)
        {
            return await _context.Questions
                .Where(q => q.IsActive && q.QuizQuestion.QuizId == quizId)
                .CountAsync();
        }

        public async Task<int?> GetLastActiveQuestionIdAsync(int quizId)
        {
            return await _context.Questions
                .Join(_context.QuizQuestions,
                      q => q.Id,
                      qq => qq.QuestionId,
                      (q, qq) => new { q, qq })
                .Where(x => x.qq.QuizId == quizId &&
                            x.q.IsActive)
                .OrderByDescending(x => x.q.SortOrder)
                .Select(x => (int?)x.q.Id)
                .FirstOrDefaultAsync();
        }


        #region Get Previous and Next Question Functions

        public async Task<int?> GetNextQuestionIdAsync(int quizId, int currentQuestionId)
        {
            // Get the current question's sort order
            var currentSortOrder = await _context.Questions
                .Where(q => q.Id == currentQuestionId)
                .Select(q => q.SortOrder)
                .FirstAsync();

            // Find the next question
            var nextQuestionId = await _context.Questions
                .Join(_context.QuizQuestions,
                      q => q.Id,
                      qq => qq.QuestionId,
                      (q, qq) => new { q, qq })
                .Where(x => x.qq.QuizId == quizId &&
                            x.q.IsActive &&
                            x.q.SortOrder > currentSortOrder)
                .OrderBy(x => x.q.SortOrder)
                .Select(x => (int?)x.q.Id)
                .FirstOrDefaultAsync();

            return nextQuestionId;
        }

        public async Task<int?> GetPreviousQuestionIdAsync(int quizId, int currentQuestionId)
        {
            // Get the current question's sort order
            var currentSortOrder = await _context.Questions
                .Where(q => q.Id == currentQuestionId)
                .Select(q => q.SortOrder)
                .FirstAsync();

            // Find the previous question
            var previousQuestionId = await _context.Questions
                .Join(_context.QuizQuestions,
                      q => q.Id,
                      qq => qq.QuestionId,
                      (q, qq) => new { q, qq })
                .Where(x => x.qq.QuizId == quizId &&
                            x.q.IsActive &&
                            x.q.SortOrder < currentSortOrder)
                .OrderByDescending(x => x.q.SortOrder)
                .Select(x => (int?)x.q.Id)
                .FirstOrDefaultAsync();

            return previousQuestionId;
        }

        #endregion

        #endregion

        #region Insert / Update Functions

        public async Task<int?> CreateQuestionAsync(CreateQuestionRequestDto dto)
        {
            // Get max sort order for this quiz
            var maxSortOrder = await _context.Questions
                .Where(q => q.QuizQuestion.QuizId == dto.QuizId && q.IsActive)
                .MaxAsync(q => (int?)q.SortOrder) ?? 0;

            // Create Question
            var question = new Question
            {
                Description = dto.Description,
                QuestionTypeId = dto.QuestionTypeId,
                SortOrder = maxSortOrder + 1,
                IsActive = true,
                IsPublished = dto.IsPublished
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            // Create QuizQuestion link
            var quizQuestion = new QuizQuestion
            {
                QuizId = dto.QuizId,
                QuestionId = question.Id
            };

            _context.QuizQuestions.Add(quizQuestion);
            await _context.SaveChangesAsync();

            return question.Id;
        }
        public async Task<bool> UpdateQuestionSortOrderAsync(int quizId, List<QuestionsSortOrderDto> updates)
        {
            try
            {
                var questionIds = updates.Select(u => u.Id).ToList();

                var questions = await _context.Questions
                    .Where(q => questionIds.Contains(q.Id) && q.IsActive && q.QuizQuestion.QuizId == quizId)
                    .ToListAsync();


                if (!questions.Any())
                    return false;

                foreach (var question in questions)
                {
                    var update = updates.FirstOrDefault(u => u.Id == question.Id);
                    if (update != null)
                    {
                        question.SortOrder = update.SortOrder;
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }

        }

        public async Task<bool> UpdateQuestionAsync(int questionId, string description, int questionTypeId, bool IsPublished)
        {
            try
            {
                var question = await _context.Questions
                .FirstOrDefaultAsync(q => q.Id == questionId);

                if (question == null)
                    return false;

                question.Description = description;
                question.QuestionTypeId = questionTypeId;
                question.IsPublished = IsPublished;

                await _context.SaveChangesAsync();
                return true;
            }
            catch ( Exception ex)
            {
                return false;
            }
            
        }



        #endregion

        #region Delete Functions

        public async Task<bool> DeleteQuestionAsync(int id)
        {
            try
            {
                var question = await _context.Questions.FindAsync(id);

                if (question == null)
                    return false;

                question.IsActive = false;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }

        }


        #endregion





    }
}
