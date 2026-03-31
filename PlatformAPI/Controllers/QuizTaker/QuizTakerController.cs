using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Data;
using PlatformAPI.DTO.QuizTaker;
using PlatformAPI.Models;
using PlatformAPI.Models.Quizzes;
using PlatformAPI.Models.Subjects;

namespace PlatformAPI.Controllers.QuizTaker
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizTakerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizTakerController(AppDbContext context)
        {
            _context = context;
        }

        // MAIN ENDPOINT (stub)
        [HttpGet("{quizId}")]
        public async Task<ActionResult<QuizTakerDTO>> GetQuizForTaker(int quizId)
        {
            // 1. Load quiz metadata
            //var quiz = await _context.Quizzes
            //    .Where(q => q.Id == quizId && q.IsActive && q.IsPublished)
            //    .FirstOrDefaultAsync();
            var quiz = await _context.Quizzes
                .Where(q => q.Id == quizId && q.IsActive && q.IsPublished)
                .Include(q => q.Subject)
                .FirstOrDefaultAsync();


            if (quiz == null)
            {
                return NotFound($"Quiz {quizId} not found or not available.");
            }

            // 2. Load questions (stub function)
            var questions = GetQuestionsForQuiz(quizId);

            // 3. Assemble DTO
            var dto = new QuizTakerDTO
            {
                Id = quiz.Id,
                Name = quiz.Name,
                Description = quiz.Description,
                SortOrder = quiz.SortOrder,
                IsPublished = quiz.IsPublished,
                SubjectName = quiz.Subject.Description,
                Questions = new List<QuizTakerQuestionDTO>()
            };

            // 4. For each question, load answer choices and map to DTO
            foreach (var q in questions)
            {
                var answerChoices = GetAnswerChoicesForQuestion(q.Id);

                var questionDto = new QuizTakerQuestionDTO
                {
                    Id = q.Id,
                    Description = q.Description,
                    SortOrder = q.SortOrder,
                    IsPublished = q.IsPublished,
                    QuestionTypeId = q.QuestionTypeId,
                    AnswerChoices = new List<QuizTakerAnswerChoiceDTO>()
                };

                foreach (var ac in answerChoices)
                {
                    questionDto.AnswerChoices.Add(new QuizTakerAnswerChoiceDTO
                    {
                        Id = ac.Id,
                        Description = ac.Description,
                        SortOrder = ac.SortOrder
                    });
                }

                dto.Questions.Add(questionDto);
            }

            return Ok(dto);
        }


        // ============================
        // SERVICE-LIKE INTERNAL METHODS
        // ============================

        // SUB-FUNCTION #1 — GET QUESTIONS (stub)
        private List<Question> GetQuestionsForQuiz(int quizId)
        {
            var questions = (from qq in _context.QuizQuestions
                             join q in _context.Questions
                                 on qq.QuestionId equals q.Id
                             where qq.QuizId == quizId
                                   && q.IsActive
                                   && q.IsPublished
                             orderby q.SortOrder
                             select q)
                             .ToList();

            return questions;
        }


        // SUB-FUNCTION #2 — GET ANSWER CHOICES (stub)
        private List<AnswerChoice> GetAnswerChoicesForQuestion(int questionId)
        {
            var answerChoices = (from qa in _context.QuestionAnswers
                                 join ac in _context.AnswerChoices
                                     on qa.AnswerChoiceId equals ac.Id
                                 where qa.QuestionId == questionId
                                       && ac.IsActive
                                 orderby ac.SortOrder
                                 select ac)
                                 .ToList();

            return answerChoices;
        }

    }
}
