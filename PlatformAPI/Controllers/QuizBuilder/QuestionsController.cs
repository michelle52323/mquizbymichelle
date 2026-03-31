using Microsoft.AspNetCore.Mvc;
using PlatformAPI.Repositories.Quizzes;
using PlatformAPI.DTO.Questions;
using Microsoft.AspNetCore.Authorization;
using PlatformAPI.Models.Quizzes;


namespace PlatformAPI.Controllers.QuizBuilder
{


    #region DTO

    public class QuestionListItemDto
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public int QuestionTypeId { get; set; }

        public QuestionType QuestionType { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }

        public bool IsPublished { get; set; }
    }

    public class UpdateQuestionDto
    {
        public string Latex { get; set; }
        public int QuestionTypeId { get; set; }

        public bool IsPublished { get; set; }
    }

    public class CreateQuestionRequestDto
    {
        public int QuizId { get; set; }
        public string Description { get; set; }
        public int QuestionTypeId { get; set; }

        public bool IsPublished { get; set; }
    }

    public class CreateQuestionResponseDto
    {
        public bool Success { get; set; }
        public int? QuestionId { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class QuestionNeighborsDto
    {
        public int? PreviousQuestionId { get; set; }
        public int? NextQuestionId { get; set; }
    }



    #endregion


    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {

        private readonly IQuestionsRepository _questionsRepository;

        public QuestionsController(IQuestionsRepository questionsRepository)
        {
            _questionsRepository = questionsRepository;
        }

        #region Get Functions

        [HttpGet("{quizId}/questions")]
        public async Task<ActionResult<IEnumerable<QuestionListItemDto>>> GetQuestionsForQuiz(int quizId)
        {
            var questions = await _questionsRepository.GetQuestionsByQuizIdAsync(quizId);

            if (questions == null || !questions.Any())
                return Ok(new List<QuestionListItemDto>());

            var dto = questions.Select(q => new QuestionListItemDto
            {
                Id = q.Id,
                Description = q.Description,
                QuestionTypeId = q.QuestionTypeId,
                QuestionType = q.QuestionType,
                SortOrder = q.SortOrder,
                IsActive = q.IsActive,
                IsPublished = q.IsPublished
            }).ToList();

            return Ok(dto);
        }

        [HttpGet("question/{questionId}")]
        public async Task<ActionResult<QuestionListItemDto>> GetQuestionById(int questionId)
        {
            var q = await _questionsRepository.GetQuestionByIdAsync(questionId);

            if (q == null)
                return NotFound();

            var dto = new QuestionListItemDto
            {
                Id = q.Id,
                Description = q.Description,
                QuestionTypeId = q.QuestionTypeId,
                QuestionType = q.QuestionType,
                SortOrder = q.SortOrder,
                IsActive = q.IsActive,
                IsPublished = q.IsPublished
            };

            return Ok(dto);
        }

        [HttpGet("question/{questionId}/position")]
        public async Task<ActionResult<QuestionPositionDto>> GetQuestionPosition(int questionId)
        {
            var result = await _questionsRepository.GetQuestionPositionAsync(questionId);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("question/{questionId}/quiz")]
        public async Task<ActionResult<int>> GetQuizIdForQuestion(int questionId)
        {
            var quizId = await _questionsRepository.GetQuizIdByQuestionIdAsync(questionId);

            

            return Ok(quizId);
        }

        [HttpGet("questionCount/{quizId}")]
        public async Task<IActionResult> GetActiveQuestionCount(int quizId)
        {
            try
            {
                var count = await _questionsRepository.GetActiveQuestionCountAsync(quizId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                // log it
                return StatusCode(500, "Error retrieving question count");
            }
        }

        [HttpGet("quiz/{quizId}/last-question")]
        public async Task<ActionResult<int?>> GetLastQuestion(int quizId)
        {
            var lastQuestionId = await _questionsRepository.GetLastActiveQuestionIdAsync(quizId);
            return Ok(lastQuestionId);
        }


        [HttpGet("question/{questionId}/neighbors")]
        public async Task<ActionResult<QuestionNeighborsDto>> GetNeighbors(int questionId)
        {
            var quizId = await _questionsRepository.GetQuizIdByQuestionIdAsync(questionId);

            var previous = await _questionsRepository.GetPreviousQuestionIdAsync(quizId, questionId);
            var next = await _questionsRepository.GetNextQuestionIdAsync(quizId, questionId);

            return new QuestionNeighborsDto
            {
                PreviousQuestionId = previous,
                NextQuestionId = next
            };
        }


        #endregion

        #region Insert / Update Functions

        [HttpPost("create-question")]
        public async Task<ActionResult<CreateQuestionResponseDto>> CreateQuestion(
        [FromBody] CreateQuestionRequestDto dto)
        {
            var newId = await _questionsRepository.CreateQuestionAsync(dto);

            return Ok(new CreateQuestionResponseDto
            {
                Success = newId != null,
                QuestionId = newId,
                ErrorMessage = newId == null ? "Failed to create question." : null
            });
        }

        [HttpPost("{quizId}/update-sort-order")]
        [Authorize]
        public async Task<IActionResult> UpdateQuestionSortOrder(
        int quizId,
        [FromBody] List<QuestionsSortOrderDto> updates)
        {
            var success = await _questionsRepository
                    .UpdateQuestionSortOrderAsync(quizId, updates);

            if (success)
                return Ok(new { success = true });

            return BadRequest(new { success = false, message = "Re-sorting failed." });
        }

        [HttpPut("update-question/{questionId}")]
        public async Task<IActionResult> UpdateQuestion(
        int questionId,
        [FromBody] UpdateQuestionDto dto)
        {
            var success = await _questionsRepository.UpdateQuestionAsync(
                questionId,
                dto.Latex,
                dto.QuestionTypeId,
                dto.IsPublished
            );

            if (!success)
                return NotFound(new { success = false, message = "Question not found" });

            return Ok(new { success = true });
        }

        #endregion



        #region Delete Functions

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var deleted = await _questionsRepository.DeleteQuestionAsync(id);

            if (deleted)
                return Ok(new { success = true });

            return BadRequest(new { success = false, message = "Delete failed." });
        }

        #endregion





    }
}
