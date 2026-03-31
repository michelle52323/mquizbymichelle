using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Data;
using PlatformAPI.Models.Users;
using PlatformAPI.Services;
using PlatformAPI.Security;
using PlatformAPI.Helpers;
using Microsoft.AspNetCore.Hosting;

namespace PlatformAPI.Controllers.Users
{
    public class LoginRequestDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class LoginResponseDto
    {
        public bool Success { get; set; }
        public string? FailureReason { get; set; }
        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string? UserType { get; set; }
        public int? ThemeId { get; set; }

        public bool? HasStarterKit { get; set; }

        public DateTime? StarterKitCreated { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class SignInController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly AuthService _authService;

        private readonly ILogger<SignInController> _logger;

        private readonly IWebHostEnvironment _env;

        public SignInController(AppDbContext context, AuthService authService, ILogger<SignInController> logger, IWebHostEnvironment env)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
            _env = env;
        }




        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn([FromBody] LoginRequestDto dto)
        {
            var user = await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.Gender)
                .FirstOrDefaultAsync(u => u.Username == dto.Username);

            var loginAttempt = new LoginAttempt
            {
                UserName = dto.Username,
                Email = user?.Email,
                IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                Timestamp = DateTime.UtcNow,
                UserId = user?.Id
            };

            if (user == null)
            {
                loginAttempt.WasSuccessful = false;
                loginAttempt.FailureReason = "User not found";
                _context.LoginAttempts.Add(loginAttempt);
                await _context.SaveChangesAsync();

                return Unauthorized(new LoginResponseDto
                {
                    Success = false,
                    FailureReason = "Invalid username or password"
                });
            }

            bool isValid = PasswordHasher.Verify(dto.Password, user.Password);

            loginAttempt.WasSuccessful = isValid;
            loginAttempt.FailureReason = isValid ? null : "Invalid password";
            _context.LoginAttempts.Add(loginAttempt);
            await _context.SaveChangesAsync();

            if (!isValid)
            {
                return Unauthorized(new LoginResponseDto
                {
                    Success = false,
                    FailureReason = "Invalid username or password"
                });
            }

            await _authService.SignInUserAsync(user);
            CookieHelper.SetOrReplaceCookie(Request, Response, "themeCookie", user.ThemeId.ToString(), 365, _env.IsProduction());

            return Ok(new LoginResponseDto
            {
                Success = true,
                UserId = user.Id,
                Username = user.Username,
                UserType = user.UserType.Code,
                ThemeId = user.ThemeId,
                HasStarterKit = user.HasStarterKit,
                StarterKitCreated = user.StarterKitCreated
            });
        }
    }
}