using Azure;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using PlatformAPI.Models.Users;
using PlatformAPI.Services;
using PlatformAPI.Security;

namespace PlatformAPI.Controllers.Users
{
    [ApiController]
    [Route("api/[controller]")]
    public class SignOutController : ControllerBase
    {

        [HttpPost("signout")]
        public async Task<IActionResult> SignOut()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Signed out successfully" });
        }
    }
}
