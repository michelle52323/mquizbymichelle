using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Models.Users;
using PlatformAPI.Data;

namespace PlatformAPI.Controllers.Users
{

    #region DTOs
    public class GenderDto
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string Code { get; set; }
    }

    #endregion


    [ApiController]
    [Route("api/[controller]")]
    public class GendersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GendersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GenderDto>>> GetGenders()
        {
            var genders = await _context.Genders
                .Select(g => new GenderDto
                {
                    Id = g.Id,
                    Description = g.Description,
                    Code = g.Code
                })
                .ToListAsync();

            return Ok(genders);
        }
    }
}
