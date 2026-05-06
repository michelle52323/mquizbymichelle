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

    #region DTO
    public class ValidateResetTokenRequest
    {
        public string Token { get; set; }
    }

    public class ValidateResetTokenResponse
    {
        public bool Valid { get; set; }
        public int? UserId { get; set; }
    }

    public class ResetPasswordSaveRequest
    {
        public Guid Token { get; set; }
        public int UserId { get; set; }
        public string NewPassword { get; set; }
    }

    public class ResetPasswordSaveResponse
    {
        public bool Success { get; set; }
        public string Error { get; set; }
    }
    #endregion


    [ApiController]
    [Route("api/[controller]")]
    public class ResetPasswordController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly ILogger<SignInController> _logger;


        public ResetPasswordController(AppDbContext context, AuthService authService,
            ILogger<SignInController> logger, IWebHostEnvironment env, LoginAttemptAnalyzerService loginAttemptAnalyzerService)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("validate")]
        public async Task<ActionResult<ValidateResetTokenResponse>> ValidateResetToken(
            [FromBody] ValidateResetTokenRequest request)
        {
            // 1. Null or empty token → invalid
            if (string.IsNullOrWhiteSpace(request.Token))
            {
                return Ok(new ValidateResetTokenResponse
                {
                    Valid = false,
                    UserId = null
                });
            }

            // 2. Token must be a GUID
            if (!Guid.TryParse(request.Token, out Guid tokenGuid))
            {
                return Ok(new ValidateResetTokenResponse
                {
                    Valid = false,
                    UserId = null
                });
            }

            // 3. Look up ForgotPasswordRequest by token
            var record = await _context.ForgotPasswordRequests
                .FirstOrDefaultAsync(r => r.Token == tokenGuid);

            if (record == null)
            {
                return Ok(new ValidateResetTokenResponse
                {
                    Valid = false,
                    UserId = null
                });
            }

            // 4. Expired?
            if (record.ExpiresAt < DateTime.UtcNow)
            {
                return Ok(new ValidateResetTokenResponse
                {
                    Valid = false,
                    UserId = null
                });
            }

            // 5. Already used?
            if (record.Updated)
            {
                return Ok(new ValidateResetTokenResponse
                {
                    Valid = false,
                    UserId = null
                });
            }

            // 6. Valid token → return userId
            return Ok(new ValidateResetTokenResponse
            {
                Valid = true,
                UserId = record.UserId
            });
        }

        [HttpPost("save")]
        public async Task<ActionResult<ResetPasswordSaveResponse>> SaveNewPassword(
        [FromBody] ResetPasswordSaveRequest dto)
        {
            try
            {
                // -----------------------------
                // 1. Validate token format
                // -----------------------------
                if (dto.Token == Guid.Empty)
                {
                    return Ok(new ResetPasswordSaveResponse
                    {
                        Success = false,
                        Error = "Invalid token."
                    });
                }

                // -----------------------------
                // 2. Look up ForgotPasswordRequest
                // -----------------------------
                var record = await _context.ForgotPasswordRequests
                    .FirstOrDefaultAsync(r => r.Token == dto.Token);

                if (record == null)
                {
                    return Ok(new ResetPasswordSaveResponse
                    {
                        Success = false,
                        Error = "Invalid token."
                    });
                }

                // -----------------------------
                // 3. Validate token state
                // -----------------------------
                if (record.ExpiresAt < DateTime.UtcNow)
                {
                    return Ok(new ResetPasswordSaveResponse
                    {
                        Success = false,
                        Error = "Token expired."
                    });
                }

                if (record.Updated)
                {
                    return Ok(new ResetPasswordSaveResponse
                    {
                        Success = false,
                        Error = "Token already used."
                    });
                }

                // -----------------------------
                // 4. Validate userId matches record
                // -----------------------------
                if (record.UserId != dto.UserId)
                {
                    return Ok(new ResetPasswordSaveResponse
                    {
                        Success = false,
                        Error = "User mismatch."
                    });
                }

                // -----------------------------
                // 5. Load user
                // -----------------------------
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == dto.UserId);

                if (user == null)
                {
                    return Ok(new ResetPasswordSaveResponse
                    {
                        Success = false,
                        Error = "User not found."
                    });
                }

                // -----------------------------
                // 6. Hash the new password
                // -----------------------------
                string newHash = PasswordHasher.Hash(dto.NewPassword);

                // -----------------------------
                // 7. Update user password
                // -----------------------------
                user.Password = newHash;

                // -----------------------------
                // 8. Mark token as used
                // -----------------------------
                record.Updated = true;

                await _context.SaveChangesAsync();

                return Ok(new ResetPasswordSaveResponse
                {
                    Success = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving reset password.");

                return BadRequest(new ResetPasswordSaveResponse
                {
                    Success = false,
                    Error = "Unexpected server error."
                });
            }
        }



    }
}
