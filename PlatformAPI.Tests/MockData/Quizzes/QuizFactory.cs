using System;
using PlatformAPI.Models.Quizzes;

namespace PlatformAPI.Tests.MockData.Quizzes
{
    public static class QuizFactory
    {
        public static Quiz Create(
            int id = 1,
            int subjectId = 10,
            int createdByUserId = 123,
            string name = "Algebra Basics",
            string description = "intro quiz",
            bool isActive = true,
            bool isPublished = true,
            int sortOrder = 1)
        {
            return new Quiz
            {
                Id = id,
                SubjectId = subjectId,
                Name = name,
                Description = description,
                IsActive = isActive,
                IsPublished = isPublished,
                CreatedByUserId = createdByUserId,
                DateCreated = DateTime.UtcNow,
                SortOrder = sortOrder
            };
        }

        public static List<Quiz> CreateList()
        {
            return new List<Quiz>
            {
                // Two Active
                QuizFactory.Create(id: 1, name: "Active Quiz 1", isActive: true, createdByUserId: 123, sortOrder: 3),
                QuizFactory.Create(id: 2, name: "Active Quiz 2", isActive: true, createdByUserId: 123, sortOrder: 2),
                QuizFactory.Create(id: 5, name: "Active Quiz 3", isActive: true, createdByUserId: 123, sortOrder: 5, isPublished: false),
        
                // One Inactive
                QuizFactory.Create(id: 3, name: "Inactive Quiz", isActive: false, createdByUserId: 123),
        
                // One for another user
                QuizFactory.Create(id: 4, name: "Someone Else's Quiz", isActive: true, createdByUserId: 999)
            };
        }

    }
}
