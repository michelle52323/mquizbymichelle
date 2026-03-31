using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Data;
using PlatformAPI.Models.Quizzes;

namespace PlatformAPI.Controllers.QuizBuilder
{
    #region DTO
    public class AnswerChoiceListItemDto
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public int SortOrder { get; set; }
        public bool IsCorrect { get; set; }

        public Guid ClientId { get; set; }
    }

    public class InsertAnswerChoiceRequestDTO
    {
        public int QuestionId { get; set; }
        public string Description { get; set; }
        public int SortOrder { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class InsertAnswerChoiceResponseDTO
    {
        public int AnswerChoiceId { get; set; }
    }

    public class UpdateAnswerChoiceRequestDTO
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public int SortOrder { get; set; }
        public bool IsCorrect { get; set; }
        public bool IsActive { get; set; }
    }
    #endregion


    [ApiController]
    [Route("api/[controller]")]
    public class AnswerChoicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnswerChoicesController(AppDbContext context)
        {
            _context = context;
        }

        #region Get Functions
        // GET: api/AnswerChoices/{questionId}
        [HttpGet("{questionId}")]
        public async Task<ActionResult<IEnumerable<AnswerChoiceListItemDto>>> GetAnswerChoicesByQuestionId(int questionId)
        {
            var choices = await _context.AnswerChoices
                .Where(ac => ac.IsActive &&
                             _context.QuestionAnswers
                                 .Any(qa => qa.QuestionId == questionId &&
                                            qa.AnswerChoiceId == ac.Id))
                .OrderBy(ac => ac.SortOrder)
                .ToListAsync();

            if (choices == null || !choices.Any())
                return Ok(new List<AnswerChoiceListItemDto>());

            var dto = choices.Select(ac => new AnswerChoiceListItemDto
            {
                Id = ac.Id,
                Description = ac.Description,
                SortOrder = ac.SortOrder,
                IsCorrect = ac.IsCorrect,
                ClientId = Guid.NewGuid()
            }).ToList();

            return Ok(dto);
        }

        #endregion

        #region Insert/Update Functions



        [HttpPost("create-answer-choice")]
        public async Task<ActionResult<InsertAnswerChoiceResponseDTO>> CreateAnswerChoice([FromBody] InsertAnswerChoiceRequestDTO dto)
        {
            // Create AnswerChoice
            var answerChoice = new AnswerChoice
            {
                Description = dto.Description,
                SortOrder = dto.SortOrder,
                IsCorrect = dto.IsCorrect,
                IsActive = true
            };

            _context.AnswerChoices.Add(answerChoice);
            await _context.SaveChangesAsync();

            // Create QuestionAnswer link
            var questionAnswer = new QuestionAnswer
            {
                QuestionId = dto.QuestionId,
                AnswerChoiceId = answerChoice.Id
            };

            _context.QuestionAnswers.Add(questionAnswer);
            await _context.SaveChangesAsync();

            return new InsertAnswerChoiceResponseDTO
            {
                AnswerChoiceId = answerChoice.Id
            };
        }

        [HttpPost("update-answer-choice")]
        public async Task<IActionResult> UpdateAnswerChoice([FromBody] UpdateAnswerChoiceRequestDTO dto)
        {
            try
            {
                var answerChoice = await _context.AnswerChoices
                    .FirstOrDefaultAsync(ac => ac.Id == dto.Id);

                if (answerChoice == null)
                {
                    return BadRequest(new { success = false, error = "Answer choice not found." });
                }

                // Update fields
                answerChoice.Description = dto.Description;
                answerChoice.SortOrder = dto.SortOrder;
                answerChoice.IsCorrect = dto.IsCorrect;
                answerChoice.IsActive = dto.IsActive;

                await _context.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
        #endregion

        #region Delete Functions
        [HttpDelete("answerChoices/{id}")]
        public async Task<IActionResult> SoftDeleteAnswerChoice(int id)
        {
            var choice = await _context.AnswerChoices
                .Include(c => c.QuestionAnswer)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (choice == null)
                return NotFound();

            // Capture BEFORE modifying
            var questionId = choice.QuestionAnswer.QuestionId;
            var deletedSortOrder = choice.SortOrder;

            // Soft delete
            choice.IsActive = false;

            // Normalize remaining active choices
            var choicesToShift = await _context.AnswerChoices
                .Include(c => c.QuestionAnswer)
                .Where(c =>
                    c.QuestionAnswer.QuestionId == questionId &&
                    c.IsActive == true &&                 // still active
                    c.SortOrder > deletedSortOrder)       // after the deleted one
                .ToListAsync();

            foreach (var c in choicesToShift)
            {
                c.SortOrder -= 1;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Answer choice deleted." });
        }


        #endregion
    }
}
