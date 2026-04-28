using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Controllers.Users;
using PlatformAPI.Data;
using PlatformAPI.Models.Users;
using PlatformAPI.Services;
using System.Security.Claims;

namespace PlatformAPI.Controllers.QuizBuilder

{

    public class QuizListDto
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }
        public object Subject { get; set; }   // or SubjectDto if you have one
        public string Name { get; set; }
        public string Description { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public bool IsPublished { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime DateCreated { get; set; }

        // ⭐ New field
        public bool CanTake { get; set; }
    }


    [ApiController]
    [Route("api/[controller]")]
    public class MyQuizzesController : ControllerBase
    {

        private readonly AppDbContext _context;

        private readonly AuthService _authService;

        private readonly ILogger<SignInController> _logger;

        public MyQuizzesController(AppDbContext context, AuthService authService, ILogger<SignInController> logger)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
        }

        //[HttpGet("getQuizzes")]
        //[Authorize]
        //public async Task<IActionResult> GetQuizzesByAuthenticatedUser()
        //{
        //    var userId = int.Parse(User.FindFirst("UserId").Value);

        //    var quizzes = await _context.Quizzes
        //        .Include(q => q.UserQuiz)
        //        .Include(q => q.Subject)
        //        .Where(q => q.IsActive && q.UserQuiz.UserId == userId)
        //        .OrderBy (q => q.SortOrder)
        //        .Select(q => new {
        //            q.Id,
        //            q.SubjectId,
        //            q.Subject,
        //            q.Name,
        //            q.Description,
        //            q.SortOrder,
        //            q.IsActive,
        //            q.IsPublished,
        //            q.CreatedByUserId,
        //            q.DateCreated
        //        })
        //        .ToListAsync();

        //    return Ok(quizzes);
        //}

        [HttpGet("getQuizzes")]
        [Authorize]
        public async Task<IActionResult> GetQuizzesByAuthenticatedUser()
        {
            //var userId = int.Parse(User.FindFirst("UserId").Value);
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null)
            {
                return Unauthorized("User ID claim missing.");
            }
            var userId = int.Parse(userIdClaim.Value);

            var quizzes = await _context.Quizzes
                .Where(q => q.IsActive && q.UserQuiz.UserId == userId)
                .OrderBy(q => q.SortOrder)
                .GroupJoin(
                    _context.StudentQuizAssignments.Where(a => a.UserId == userId && a.IsActive),
                    q => q.Id,
                    a => a.QuizId,
                    (q, assignments) => new { q, assignment = assignments.FirstOrDefault() }
                )
                .Select(x => new QuizListDto
                {
                    Id = x.q.Id,
                    SubjectId = x.q.SubjectId,
                    Subject = x.q.Subject,
                    Name = x.q.Name,
                    Description = x.q.Description,
                    SortOrder = x.q.SortOrder,
                    IsActive = x.q.IsActive,
                    IsPublished = x.q.IsPublished,
                    CreatedByUserId = x.q.CreatedByUserId,
                    DateCreated = x.q.DateCreated,

                    // ⭐ The new field
                    CanTake = x.q.IsPublished
                        && x.assignment != null
                        && x.assignment.IsActive
                })
                .ToListAsync();

            return Ok(quizzes);
        }



        [HttpGet("getQuizzesMock")]
        public async Task<IActionResult> GetQuizzesByMockUser()
        {
            var userId = 1;

            var quizzes = await _context.Quizzes
                .Where(q => q.IsActive && q.UserQuiz.UserId == userId)
                .OrderBy(q => q.SortOrder)
                .GroupJoin(
                    _context.StudentQuizAssignments.Where(a => a.UserId == userId && a.IsActive),
                    q => q.Id,
                    a => a.QuizId,
                    (q, assignments) => new { q, assignment = assignments.FirstOrDefault() }
                )
                .Select(x => new QuizListDto
                {
                    Id = x.q.Id,
                    SubjectId = x.q.SubjectId,
                    Subject = x.q.Subject,
                    Name = x.q.Name,
                    Description = x.q.Description,
                    SortOrder = x.q.SortOrder,
                    IsActive = x.q.IsActive,
                    IsPublished = x.q.IsPublished,
                    CreatedByUserId = x.q.CreatedByUserId,
                    DateCreated = x.q.DateCreated,

                    // ⭐ The new field
                    CanTake = x.q.IsPublished
                        && x.assignment != null
                        && x.assignment.IsActive
                })
                .ToListAsync();

            return Ok(quizzes);
        }

        #region Update Sort Order

        public class QuizSortOrderDto
        {
            public int Id { get; set; }
            public int SortOrder { get; set; }
        }

        [HttpPost("updateSortOrder")]
        [Authorize]
        public async Task<IActionResult> UpdateSortOrder([FromBody] List<QuizSortOrderDto> updates)
        {

            try
            {
                var userId = int.Parse(User.FindFirst("UserId").Value);

                var quizIds = updates.Select(q => q.Id).ToList();

                var quizzes = await _context.Quizzes
                    .Where(q => quizIds.Contains(q.Id) && q.IsActive && q.UserQuiz.UserId == userId)
                    .ToListAsync();

                foreach (var quiz in quizzes)
                {
                    var update = updates.FirstOrDefault(u => u.Id == quiz.Id);
                    if (update != null)
                    {
                        quiz.SortOrder = update.SortOrder;
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new {success = true});
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.ToString() });
            }
        }

        #endregion

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            try
            {
                var quiz = await _context.Quizzes.FindAsync(id);
                if (quiz == null)
                {
                    return NotFound();
                }

                quiz.IsActive = false;
                await _context.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.ToString() });
            }
            
        }


    }


}
