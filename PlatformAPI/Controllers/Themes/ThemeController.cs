using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Controllers.Users;
using PlatformAPI.Data;
using PlatformAPI.Models.Themes;
using PlatformAPI.Services;
using PlatformAPI.Helpers;
using Microsoft.AspNetCore.Hosting;

public class ThemeDto
{
    public int Id { get; set; }
    public string Description { get; set; }
    public int? SortOrder { get; set; }
}



[ApiController]
[Route("api/[controller]")]
public class ThemeController : ControllerBase
{
    private readonly AppDbContext _context;

    private readonly AuthService _authService;

    private readonly ILogger<SignInController> _logger;

    private readonly IWebHostEnvironment _env;

    public ThemeController(AppDbContext context, AuthService authService, ILogger<SignInController> logger, IWebHostEnvironment env)
    {
        _context = context;
        _authService = authService;
        _logger = logger;
        _env = env;
    }

    #region Get Functions 

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveThemes()
    {
        var themes = await _context.Set<Theme>()
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .Select(t => new ThemeDto
            {
                Id = t.Id,
                Description = t.Description,
                SortOrder = t.SortOrder
            })
            .ToListAsync();

        if (themes == null || themes.Count == 0)
            return NotFound("No active themes found.");

        return Ok(themes);
    }


    [HttpGet("{themeId}/variables")]
    public async Task<IActionResult> GetThemeVariablesColors(int themeId)
    {
        var data = await _context.Set<ThemeVariableColor>()
            .Include(tvc => tvc.ThemeVariable)
            .Where(tvc => tvc.ThemeId == themeId)
            .Select(tvc => new {
                ThemeVariableId = tvc.ThemeVariableId,
                Description = tvc.ThemeVariable.Description,
                Color = tvc.Color
            })
            .ToListAsync();

        if (data == null || data.Count == 0)
            return NotFound($"No ThemeVariableColors found for themeId {themeId}");

        return Ok(data);
    }

    #endregion

    #region Insert / Update Functions

    [Authorize]
    [HttpPut("user-theme")]
    public async Task<IActionResult> UpdateUserTheme([FromBody] int themeId)
    {

        try
        {
            // Get user ID from claims
            var userId = int.Parse(User.FindFirst("UserId").Value);

            // Validate theme exists
            var theme = await _context.Themes
                .FirstOrDefaultAsync(t => t.Id == themeId);

            if (theme == null)
                return BadRequest("Invalid theme ID.");

            // Load user
            var user = await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.Gender)
                .FirstOrDefaultAsync(u => u.Id == userId);


            if (user == null)
                return Unauthorized();

            // Update and save
            user.ThemeId = themeId;
            await _context.SaveChangesAsync();

            await _authService.SignInUserAsync(user);
            CookieHelper.SetOrReplaceCookie(Request, Response, "themeCookie", user.ThemeId.ToString(), 365, _env.IsProduction());

            return Ok(new
            {
                success = true,
                themeId = themeId
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        
    }


    #endregion
}