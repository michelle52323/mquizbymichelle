using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using PlatformAPI.Models.Users;
using System.Security.Claims;

namespace PlatformAPI.Services
{
    public class AuthService
    {
        private readonly ILogger<AuthService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthService(ILogger<AuthService> logger, IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task SignInUserAsync(User user)
        {
            if (user != null)
            {
                // Build claims
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim("UserId", user.Id.ToString()),
                    new Claim("ThemeId", user.ThemeId.ToString()),
                    new Claim("FirstName", user.FirstName.ToString()),

                    //new Claim(ClaimTypes.Gender, genderValue),

                    new Claim(ClaimTypes.Role, user.UserType.Description ?? "User"),

                    new Claim("HasStarterKit", user.HasStarterKit.ToString()),
                    new Claim("StarterKitCreated", user.StarterKitCreated?.ToString() ?? string.Empty)

                };

                if (user.Gender != null)
                {
                    claims.Add(new Claim(ClaimTypes.Gender, user.Gender.Description));
                }

                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var principal = new ClaimsPrincipal(identity);
                await _httpContextAccessor.HttpContext.SignInAsync(
                   CookieAuthenticationDefaults.AuthenticationScheme,
                   principal,
                   new AuthenticationProperties
                   {
                       IsPersistent = true,
                       ExpiresUtc = DateTime.UtcNow.AddHours(1)
                   });

                _logger.LogInformation("SignInUserAsync invoked for user: {Username}", user.Username);
                _logger.LogInformation("HttpContext is null? {IsNull}", _httpContextAccessor.HttpContext == null);
                _logger.LogInformation("Claims count: {Count}", claims.Count);
                _logger.LogInformation("Cookie issuance attempted at: {Timestamp}", DateTime.UtcNow);

                //await _httpContextAccessor.HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            }
        }

        public ClaimsPrincipal GetMockClaimsPrincipal()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, "michelle.52323"),
                new Claim("UserId", "1"),
                new Claim("ThemeId", "5"),
                new Claim("FirstName", "Michelle"),
                new Claim(ClaimTypes.Gender, "Female"),
                new Claim(ClaimTypes.Role, "Instructor")
            };

                    var identity = new ClaimsIdentity(claims, "MockAuthentication");
                    return new ClaimsPrincipal(identity);
        }
    }
}
