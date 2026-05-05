using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Data;
using PlatformAPI.Models.Users;
using PlatformAPI.Security;
using PlatformAPI.Services;

namespace PlatformAPI.Controllers.Users
{
    #region DTOs

    public class PasswordUpdateDto
    {
        public string Username { get; set; }
        public string NewPassword { get; set; }
    }

    public class CreateUserDto
    {
        public string Username { get; set; }
        public string Password { get; set; }

        public string? FirstName { get; set; }
        //public string? MiddleName { get; set; }
        //public string? LastName { get; set; }

        public string? Email { get; set; }

        //public int GenderId { get; set; }

        public int ThemeId { get; set; }
        public int UserTypeId { get; set; }
    }

    public class AvailabilityResponse
    {
        public bool Available { get; set; }
    }

    public class UserProfileDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string Email { get; set; }
        public string? Pronouns { get; set; }
        public int? GenderId { get; set; }
    }

    public class VerifyPasswordRequest
    {
        public string CurrentPassword { get; set; }
    }

    public class SavePasswordRequest
    {
        public string NewPassword { get; set; }
    }



    #endregion




    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {

        private readonly AppDbContext _context;

        private readonly AuthService _authService;

        private readonly ILogger<SignInController> _logger;

        public UsersController(AppDbContext context, AuthService authService, ILogger<SignInController> logger)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
        }

        #region Get Functions

        [HttpGet("GetUserProfile")]
        [Authorize]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                // Extract claims
                var claims = User.Claims.ToDictionary(c => c.Type, c => c.Value);

                if (!claims.TryGetValue("UserId", out var userIdString) ||
                    !int.TryParse(userIdString, out var userId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "User ID claim missing or invalid."
                    });
                }

                // Load user
                var user = await _context.Users
                    .Where(u => u.Id == userId)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "User not found."
                    });
                }

                // Build DTO
                var dto = new UserProfileDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    MiddleName = user.MiddleName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Pronouns = user.Pronouns,
                    GenderId = user.GenderId
                };

                // Return success
                return Ok(new
                {
                    success = true,
                    user = dto
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }


        [HttpPost("verify-password")]
        [Authorize]
        public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordRequest dto)
        {
            try
            {
                // -----------------------------
                // 1. Extract UserId from claims
                // -----------------------------
                var claims = User.Claims.ToDictionary(c => c.Type, c => c.Value);

                if (!claims.TryGetValue("UserId", out var userIdString) ||
                    !int.TryParse(userIdString, out var userId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "User ID claim missing or invalid."
                    });
                }

                // -----------------------------
                // 2. Load user with LINQ pattern
                // -----------------------------
                var user = await _context.Users
                    .Include(u => u.UserType)
                    .Include(u => u.Gender)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "User not found."
                    });
                }

                // -----------------------------
                // 3. Verify password using bcrypt
                // -----------------------------
                bool isMatch = PasswordHasher.Verify(dto.CurrentPassword, user.Password);

                if (!isMatch)
                {
                    return Ok(new
                    {
                        success = false,
                        error = "Incorrect password."
                    });
                }

                // -----------------------------
                // 4. Success
                // -----------------------------
                return Ok(new
                {
                    success = true
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }


        #endregion

        #region Check Uniqueness Functions

        [HttpGet("check-email")]
        public async Task<ActionResult<AvailabilityResponse>> CheckEmail(string email)
        {
            var exists = await _context.Users.AnyAsync(u => u.Email == email);
            return new AvailabilityResponse { Available = !exists };
        }

        [HttpGet("check-username")]
        public async Task<ActionResult<AvailabilityResponse>> CheckUsername(string username)
        {
            var exists = await _context.Users.AnyAsync(u => u.Username == username);
            return new AvailabilityResponse { Available = !exists };
        }

        [HttpGet("check-email-profile")]
        public async Task<ActionResult<AvailabilityResponse>> CheckEmailForProfile(string email)
        {
            // Get authenticated user ID from claims
            var claims = User.Claims.ToDictionary(c => c.Type, c => c.Value);

            if (!claims.TryGetValue("UserId", out var userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            // Find any user with this email
            var userWithEmail = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            // CASE 1: No user has this email → available
            if (userWithEmail == null)
            {
                return new AvailabilityResponse { Available = true };
            }

            // CASE 2: Email belongs to the current user → available
            if (userWithEmail.Id == userId)
            {
                return new AvailabilityResponse { Available = true };
            }

            // CASE 3: Email belongs to someone else → taken
            return new AvailabilityResponse { Available = false };
        }



        #endregion

        #region Insert / Update Functions

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserDto dto)
        {
            // Check for duplicate username
            var existing = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (existing != null)
                return BadRequest(new { success = false, message = "Username already exists" });

            var user = new User
            {
                Username = dto.Username,
                Password = PasswordHasher.Hash(dto.Password),
                FirstName = dto.FirstName,
                Email = dto.Email,
                ThemeId = dto.ThemeId,
                UserTypeId = dto.UserTypeId,

            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }


        [HttpPut("update-password")]
        public async Task<IActionResult> UpdatePassword([FromBody] PasswordUpdateDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null)
                return NotFound("User not found");

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Password updated successfully");
        }

        [HttpPost("save-password")]
        [Authorize]
        public async Task<IActionResult> SavePassword([FromBody] SavePasswordRequest dto)
        {
            try
            {
                // -----------------------------
                // 1. Extract UserId from claims
                // -----------------------------
                var claims = User.Claims.ToDictionary(c => c.Type, c => c.Value);

                if (!claims.TryGetValue("UserId", out var userIdString) ||
                    !int.TryParse(userIdString, out var userId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "User ID claim missing or invalid."
                    });
                }

                // -----------------------------
                // 2. Load user with your LINQ pattern
                // -----------------------------
                var user = await _context.Users
                    .Include(u => u.UserType)
                    .Include(u => u.Gender)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "User not found."
                    });
                }

                // -----------------------------
                // 3. Hash the new password
                // -----------------------------
                string newHash = PasswordHasher.Hash(dto.NewPassword);

                // -----------------------------
                // 4. Save to database
                // -----------------------------
                user.Password = newHash;

                await _context.SaveChangesAsync();

                // -----------------------------
                // 5. Success response
                // -----------------------------
                return Ok(new
                {
                    success = true
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }


        [Authorize]
        [HttpPut("set-starter-kit")]
        public async Task<IActionResult> SetStarterKit()
        {
            // Get authenticated user ID from claims
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            // Load user
            var user = await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.Gender)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound("User not found.");

            // Update flag
            user.HasStarterKit = true;
            user.StarterKitCreated = DateTime.Now;
            await _context.SaveChangesAsync();

            await _authService.SignInUserAsync(user);

            return Ok(new { success = true });
        }

        [HttpPost("UpdateUserProfile")]
        [Authorize]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UserProfileDto dto)
        {
            try
            {
                // Validate DTO Id matches authenticated user
                var claims = User.Claims.ToDictionary(c => c.Type, c => c.Value);

                if (!claims.TryGetValue("UserId", out var userIdString) ||
                    !int.TryParse(userIdString, out var userId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "User ID claim missing or invalid."
                    });
                }

                if (dto.Id != userId)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "User ID mismatch."
                    });
                }

                // Load user
                var user = await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.Gender)
                .FirstOrDefaultAsync(u => u.Id == userId);


                if (user == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "User not found."
                    });
                }

                // Update fields
                user.FirstName = dto.FirstName;
                user.MiddleName = dto.MiddleName;
                user.LastName = dto.LastName;
                user.Email = dto.Email;
                user.Pronouns = dto.Pronouns;
                user.GenderId = dto.GenderId;

                // Save
                await _context.SaveChangesAsync();

                // Refresh authentication cookie so claims update immediately
                await _authService.SignInUserAsync(user);

                return Ok(new
                {
                    success = true
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }


        #endregion


    }
}
