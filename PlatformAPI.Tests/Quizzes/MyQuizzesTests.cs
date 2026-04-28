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


namespace UnitTests
{
    public class MyQuizzesControllerTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly AppDbContext _db;
        private readonly CustomWebApplicationFactory _factory; // Add this

        public MyQuizzesControllerTests(CustomWebApplicationFactory factory)
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
        public async Task GetQuizzes_ReturnsQuizzesForAuthenticatedUser()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("TestScheme");

            // 1. Subject
            _db.Subjects.AddRange(SubjectFactory.CreateList());

            // 2. Quiz
            _db.Quizzes.AddRange(QuizFactory.CreateList());

            // 3. UserQuiz (the key for q.UserQuiz.UserId)
            _db.UserQuizzes.AddRange(UserQuizFactory.CreateList());

            // 4. StudentQuizAssignment (for your GroupJoin logic)
            _db.StudentQuizAssignments.AddRange(StudentQuizAssignmentFactory.CreateList());

            // Save changes
            await _db.SaveChangesAsync();


            // Act — call the API
            var response = await _client.GetAsync("/api/MyQuizzes/getQuizzes");

            // Assert — status code
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Assert — payload
            var quizzes = await response.Content.ReadFromJsonAsync<List<QuizListDto>>();

            quizzes.Should().NotBeNull();
            quizzes.Should().HaveCount(3);

            var quizOutput = quizzes[0];
            //quizzes.Id.Should().Be(1);
            quizzes.Select(q => q.Id).Should().BeEquivalentTo(new[] { 1, 2, 5 });
            quizzes.Should().ContainSingle(q => q.Name == "Active Quiz 1");
            quizzes.Should().ContainSingle(q => q.Name == "Active Quiz 2");
            quizzes.Should().ContainSingle(q => q.Name == "Active Quiz 3");
            //quizzes.Should().AllSatisfy(q => q.CanTake.Should().BeTrue());

            quizzes.Should().BeInAscendingOrder(q => q.SortOrder);

            // 3. Verify specific CanTake values for each item in order
            quizzes.Should().SatisfyRespectively(
                first =>
                {
                    first.Id.Should().Be(2);
                    first.CanTake.Should().BeTrue();
                },
                second =>
                {
                    second.Id.Should().Be(1);
                    second.CanTake.Should().BeTrue();
                },
                third =>
                {
                    third.Id.Should().Be(5);
                    third.CanTake.Should().BeFalse(); // Because isPublished = false
                }
            );
        }

        [Fact]
        public async Task GetQuizzes_WhenQuizzesBelongToOtherUser_ReturnsEmptyList()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("TestScheme");

            // Arrange
            // 1. Only add a quiz that belongs to User 999
            var otherUserQuiz = QuizFactory.Create(id: 99, name: "Other User Quiz", createdByUserId: 999);
            _db.Quizzes.Add(otherUserQuiz);

            // 2. Add the UserQuiz link for User 999
            _db.UserQuizzes.Add(UserQuizFactory.Create(userId: 999, quizId: 99));

            // 3. Add the Assignment for User 999
            _db.StudentQuizAssignments.Add(StudentQuizAssignmentFactory.Create(userId: 999, quizId: 99));

            await _db.SaveChangesAsync();

            // Act 
            // Assuming your _client is authenticated as User 123
            var response = await _client.GetAsync("/api/MyQuizzes/getQuizzes");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var quizzes = await response.Content.ReadFromJsonAsync<List<QuizListDto>>();

            quizzes.Should().NotBeNull();
            quizzes.Should().BeEmpty(); // This confirms the filter worked
        }

        [Fact]
        public async Task GetQuizzes_WhenQuizIsInactive_ReturnsEmptyList()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("TestScheme");

            // Arrange
            // 1. Create a quiz for the auth user (123) but mark it inactive
            var inactiveQuiz = QuizFactory.Create(
                id: 10,
                name: "Old Algebra Quiz",
                isActive: false,
                createdByUserId: 123
            );
            _db.Quizzes.Add(inactiveQuiz);

            // 2. Add the corresponding link and assignment so the record is "valid"
            _db.UserQuizzes.Add(UserQuizFactory.Create(userId: 123, quizId: 10));
            _db.StudentQuizAssignments.Add(StudentQuizAssignmentFactory.Create(userId: 123, quizId: 10));

            await _db.SaveChangesAsync();

            // Act
            var response = await _client.GetAsync("/api/MyQuizzes/getQuizzes");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var quizzes = await response.Content.ReadFromJsonAsync<List<QuizListDto>>();

            quizzes.Should().NotBeNull();
            quizzes.Should().BeEmpty(); // It belongs to the user, but isActive = false should hide it
        }

        [Fact]
        public async Task GetQuizzes_WhenUnauthenticated_Returns401Unauthorized()
        {
            // Arrange
            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Authorization = null; // Handler will now return Fail()

            // Act
            var response = await client.GetAsync("/api/MyQuizzes/getQuizzes");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }





    }
}

