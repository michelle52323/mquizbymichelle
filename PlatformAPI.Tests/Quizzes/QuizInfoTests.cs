using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using PlatformAPI.Data;
using PlatformAPI.Models;
using PlatformAPI.DTO;
using PlatformAPI.Models.Quizzes;
using PlatformAPI.Controllers.QuizBuilder;
using Microsoft.Extensions.DependencyInjection;
using PlatformAPI.Tests;
using Microsoft.AspNetCore.Mvc.Testing;
using PlatformAPI.Models.StudentQuizzes;
using PlatformAPI.Models.Subjects;
using PlatformAPI.Tests.MockData.Quizzes;
using PlatformAPI.Tests.MockData.Subjects;
using PlatformAPI.Tests.MockData.UserQuizzes;
using PlatformAPI.Tests.MockData.StudentQuizAssignments;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Text;


namespace UnitTests
{
    public class QuizInfoTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly AppDbContext _db;
        private readonly CustomWebApplicationFactory _factory; // Add this

        public QuizInfoTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
            _db = factory.Services.GetRequiredService<AppDbContext>();

            // 1. Wipe the data from the DB
            _db.Database.EnsureDeleted();
            _db.Database.EnsureCreated();

            // 2. Clear the tracker so EF "forgets" about old IDs (CRITICAL)
            _db.ChangeTracker.Clear();
        }

        [Fact]
        public async Task CreateQuiz_Should_Create_Quiz_And_UserQuiz()
        {
            // Arrange
            var userId = 123;

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("TestScheme");

            // Seed required Subject (because SubjectId must exist)
            _db.Subjects.Add(SubjectFactory.Create(id: 10, description: "Math"));
            await _db.SaveChangesAsync();

            // Build DTO for POST
            var dto = new CreateQuizDto
            {
                SubjectId = "10",
                Name = "Algebra Basics",
                Description = "intro quiz"
            };

            var json = JsonConvert.SerializeObject(dto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/QuizInfo/create-quiz", content);

            // Assert response
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var responseBody = await response.Content.ReadAsStringAsync();
            dynamic result = JsonConvert.DeserializeObject(responseBody);

            ((bool)result.success).Should().BeTrue();
            int returnedQuizId = (int)result.quizId;

            // Assert DB: Quiz exists
            var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.Id == returnedQuizId);
            quiz.Should().NotBeNull();

            quiz.Name.Should().Be("Algebra Basics");
            quiz.Description.Should().Be("intro quiz");
            quiz.SubjectId.Should().Be(10);
            quiz.CreatedByUserId.Should().Be(userId);
            quiz.IsActive.Should().BeTrue();
            quiz.IsPublished.Should().BeFalse();
            quiz.SortOrder.Should().Be(1); // first quiz for this user

            // Assert DB: UserQuiz link created
            var userQuiz = await _db.UserQuizzes
                .FirstOrDefaultAsync(uq => uq.QuizId == returnedQuizId && uq.UserId == userId);

            userQuiz.Should().NotBeNull();
        }

    }

}

    
    