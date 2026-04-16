using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Data;
using PlatformAPI.DTO.QuizTaker;
using PlatformAPI.Models;
using PlatformAPI.Models.Quizzes;
using PlatformAPI.Models.StudentQuizzes;
using PlatformAPI.Models.Subjects;


namespace PlatformAPI.Controllers.QuizTaker
{

    public class LoadAnswerSheetRequestDTO
    {
        public int UserId { get; set; }
        public int QuizId { get; set; }
    }

    public class StudentAnswerSheetAnswerUpsertDTO : StudentAnswerSheetAnswerDTO
    {
        public int QuizAttemptId { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")] 
    public class StudentAnswerSheetController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentAnswerSheetController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("load")]
        public async Task<ActionResult<StudentAnswerSheetDTO>> LoadAnswerSheet(LoadAnswerSheetRequestDTO request)
        {
            var assignment = await GetAssignmentAsync(request.UserId, request.QuizId);
            var attempt = await GetOrCreateAttemptAsync(assignment);
            var answers = await GetAnswersForAttemptAsync(attempt.Id);

            var dto = BuildAnswerSheetDTO(assignment, attempt, answers);

            return Ok(dto);
        }

        // ------------------------------------------------------------
        // HELPERS
        // ------------------------------------------------------------

        private async Task<StudentQuizAssignment> GetAssignmentAsync(int userId, int quizId)
        {
            var assignment = await _context.StudentQuizAssignments
                .FirstOrDefaultAsync(a => a.UserId == userId 
                                    && a.QuizId == quizId
                                    && a.IsActive == true);

            if (assignment != null)
                return assignment;

            // Create a new assignment if none exists
            assignment = new StudentQuizAssignment
            {
                UserId = userId,
                QuizId = quizId,
                AllowMultipleAttempts = true,
                IsActive = true
            };

            _context.StudentQuizAssignments.Add(assignment);
            await _context.SaveChangesAsync();

            return assignment;
        }

        private async Task<StudentQuizAttempt> GetOrCreateAttemptAsync(StudentQuizAssignment assignment)
        {
            // Load most recent attempt if it exists
            if (assignment.MostRecentAttemptId.HasValue)
            {
                var existingAttempt = await _context.StudentQuizAttempts
                    .FirstOrDefaultAsync(a => a.Id == assignment.MostRecentAttemptId.Value);

                if (existingAttempt != null)
                    return existingAttempt;
            }

            // Create new attempt
            var attempt = new StudentQuizAttempt
            {
                StudentQuizAssignmentId = assignment.Id,
                DateTaken = DateTime.UtcNow,
                IsCompleted = false,
                Score = null,
                IsActive = true
            };

            _context.StudentQuizAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            // Update assignment pointer
            assignment.MostRecentAttemptId = attempt.Id;
            await _context.SaveChangesAsync();

            return attempt;
        }

        private async Task<List<StudentQuizAnswers>> GetAnswersForAttemptAsync(int attemptId)
        {
            return await _context.StudentQuizAnswers
                .Where(a => a.StudentQuizAttemptId == attemptId)
                .ToListAsync();
        }

        private StudentAnswerSheetDTO BuildAnswerSheetDTO(
            StudentQuizAssignment assignment,
            StudentQuizAttempt attempt,
            List<StudentQuizAnswers> answers)
        {
            return new StudentAnswerSheetDTO
            {
                AssignmentId = assignment.Id,
                UserId = assignment.UserId,
                QuizId = assignment.QuizId,
                AllowMultipleAttempts = assignment.AllowMultipleAttempts,
                MostRecentAttemptId = assignment.MostRecentAttemptId,
                IsActive = assignment.IsActive,

                Attempt = new StudentAnswerSheetAttemptDTO
                {
                    AttemptId = attempt.Id,
                    DateTaken = attempt.DateTaken,
                    IsCompleted = attempt.IsCompleted,
                    Score = attempt.Score,
                    IsActive = attempt.IsActive,

                    Answers = answers.Select(a => new StudentAnswerSheetAnswerDTO
                    {
                        AnswerSheetEntryId = a.Id,
                        QuestionId = a.QuestionId,
                        SelectedAnswerId = a.AnswerId,
                        AnswerText = a.AnswerText,
                        Timestamp = a.Timestamp,
                        IsCorrect = a.IsCorrect,
                        IsActive = a.IsActive
                    }).ToList()
                }
            };
        }


        [HttpPost("save-answer")]
        public async Task<IActionResult> SaveAnswer([FromBody] StudentAnswerSheetAnswerUpsertDTO dto)
        {
            try
            {
                // INSERT CASE — new record
                if (dto.AnswerSheetEntryId == -1)
                {
                    // create new DB entity
                    var newAnswer = new StudentQuizAnswers
                    {
                        QuestionId = dto.QuestionId,
                        AnswerId = dto.SelectedAnswerId,
                        AnswerText = dto.AnswerText,
                        Timestamp = dto.Timestamp,
                        IsCorrect = dto.IsCorrect,
                        IsActive = dto.IsActive,
                        StudentQuizAttemptId = dto.QuizAttemptId
                    };

                    _context.StudentQuizAnswers.Add(newAnswer);
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        success = true,
                        answerSheetEntryId = newAnswer.Id
                    });
                }

                // UPDATE CASE — existing record
                var existing = await _context.StudentQuizAnswers
                    .FirstOrDefaultAsync(a => a.Id == dto.AnswerSheetEntryId);

                if (existing == null)
                {
                    return NotFound(new { success = false, message = "Answer record not found." });
                }

                existing.AnswerId = dto.SelectedAnswerId;
                existing.AnswerText = dto.AnswerText;
                existing.Timestamp = dto.Timestamp;
                existing.IsCorrect = dto.IsCorrect;
                existing.IsActive = dto.IsActive;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, answerSheetEntryId= (int?)null });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.ToString() });
            }
        }
    }

    

 }
