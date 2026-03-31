using Microsoft.AspNetCore.Mvc;
using PlatformAPI.Data;

namespace PlatformAPI.Controllers.Subjects
{

    public class SubjectDropdownDto
    {
        public int Id { get; set; }
        public string Desc { get; set; }
    }
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubjectsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dropdown")]
        public ActionResult<IEnumerable<SubjectDropdownDto>> GetActiveSubjectsForDropdown()
        {
            var subjects = _context.Subjects
                .Where(s => s.IsActive)
                .OrderBy(s => s.SortOrder)
                .Select(s => new SubjectDropdownDto
                {
                    Id = s.Id,
                    Desc = s.Description
                })
                .ToList();

            return Ok(subjects);
        }
    }
}
