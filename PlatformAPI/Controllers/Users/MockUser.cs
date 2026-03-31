using Microsoft.AspNetCore.Mvc;
using PlatformAPI.Data;
using PlatformAPI.Services;
using System.Security.Claims;

namespace PlatformAPI.Controllers.Users
{
    


    [ApiController]
    [Route("api/mock")]
    public class MockController : ControllerBase
    {
        private readonly AuthService _authService;
        public MockController(AuthService authService)
        {

            _authService = authService;

        }

        [HttpGet("claims")]
        public IActionResult GetMockClaims()
        {
            var user = _authService.GetMockClaimsPrincipal();
            var claims = user.Claims.ToDictionary(c => c.Type, c => c.Value);

            var response = new
            {
                authenticated = true,
                username = claims[ClaimTypes.Name],
                claims = claims
            };

            return Ok(response);
        }
    }

    
}
