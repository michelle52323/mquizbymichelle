using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using PlatformAPI.Models.Users;


namespace PlatformAPI.Controllers.Users
{

    [ApiController]
    [Route("api/[controller]")]
    public class CheckAuthorization : ControllerBase
    {
        [Authorize]
        [HttpGet("check-auth")]
        public IActionResult CheckAuth()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(); // front-end handles redirect
            }

            var claims = User.Claims.ToDictionary(c => c.Type, c => c.Value);

            return Ok(new
            {
                authenticated = true,
                username = User.Identity?.Name,
                claims
            });

        }

    }
}
