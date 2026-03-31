using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Data;
using PlatformAPI.Models.Quizzes;
using System.Security.Claims;
using PlatformAPI.Models.Users;
using Microsoft.Data.SqlClient;

namespace PlatformAPI.Controllers.QuizBuilder
{

    public class QuizDto
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }

        public string SubjectName { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public string UserId { get; set; }

        public bool IsPublished { get; set; }
    }

    public class CreateQuizDto
    {
        public string SubjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

    }

    public class EditQuizDto
    {

        public int Id { get; set; }
        public int SubjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

    }

    [ApiController]
    [Route("api/[controller]")]
    public class QuizInfoController : ControllerBase
    {

        private readonly AppDbContext _context;

        public QuizInfoController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<QuizDto>> GetQuiz(int id)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.UserQuiz)
                .Include(q => q.Subject)
                .FirstOrDefaultAsync(q => q.Id == id && q.IsActive);

            if (quiz == null)
                return NotFound();

            var dto = new QuizDto
            {
                Id = quiz.Id,
                SubjectId = quiz.SubjectId,
                SubjectName = quiz.Subject.Description,
                Name = quiz.Name,
                Description = quiz.Description,
                UserId = quiz.UserQuiz.UserId.ToString(),
                IsPublished = quiz.IsPublished
            };

            return Ok(dto);
        }


        [HttpPost("create-quiz")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDto dto)
        {

            try
            {
                // Get UserId from auth cookie (or claims)
                var userId = int.Parse(User.FindFirst("UserId").Value);
                

                var quiz = new Quiz();

                //Get max sort order
                var maxSortOrder = await _context.Quizzes
                    .Where(q => q.CreatedByUserId == userId && q.IsActive)
                    .MaxAsync(q => (int?)q.SortOrder) ?? 0;

                // Populate quiz metadata
                quiz.Name = dto.Name;
                quiz.Description = dto.Description;
                quiz.SubjectId = int.Parse(dto.SubjectId);
                quiz.CreatedByUserId = userId;
                quiz.DateCreated = DateTime.UtcNow;
                quiz.IsActive = true;
                quiz.SortOrder = maxSortOrder + 1;
                quiz.IsPublished = false;

                // Add quiz to DB
                _context.Quizzes.Add(quiz);
                await _context.SaveChangesAsync();

                // Create UserQuiz link
                var userQuiz = new UserQuiz
                {
                    UserId = userId,
                    QuizId = quiz.Id
                };

                _context.UserQuizzes.Add(userQuiz);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, quizId = quiz.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.ToString() });
            }

        }

        [HttpPut("update-quiz/{id}")]
        public async Task<IActionResult> UpdateQuiz(int id, [FromBody] EditQuizDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest("Quiz ID mismatch.");
                }

                var quiz = await _context.Quizzes.FindAsync(id);
                if (quiz == null)
                {
                    return NotFound("Quiz not found.");
                }

                // Update fields
                quiz.Name = dto.Name;
                quiz.Description = dto.Description;
                quiz.SubjectId = dto.SubjectId;

                await _context.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.ToString() });
            }

            
        }


        [HttpPost("publish/{quizId}")]
        public async Task<IActionResult> PublishQuiz(int quizId)
        {
            var quiz = await _context.Quizzes.FindAsync(quizId);
            if (quiz == null)
                return BadRequest("Quiz not found.");

            quiz.IsPublished = true;

            try
            {
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch
            {
                return BadRequest("Unable to publish quiz.");
            }
        }


    }
}
