namespace PlatformAPI.Controllers.Test
{
    using Microsoft.AspNetCore.Mvc;

    public class TestDto
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string Color { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet("colors")]
        public ActionResult<IEnumerable<TestDto>> GetVintageChristmasColors()
        {
            var colors = new List<TestDto>
            {
                new TestDto
                {
                    Id = 1,
                    Description = "Green",
                    Color = "#0B6E4F"   // deep vintage green
                },
                new TestDto
                {
                    Id = 2,
                    Description = "Orange",
                    Color = "#C75B12"   // warm amber-orange bulb tone
                },
                new TestDto
                {
                    Id = 3,
                    Description = "Red",
                    Color = "#8B1A1A"   // deep ruby red, classic C9 style
                },
                new TestDto
                {
                    Id = 4,
                    Description = "Blue",
                    Color = "#1A3D8F"   // rich cobalt blue, warm vintage glow
                }
            };

            return Ok(colors);
        }
    }
}
