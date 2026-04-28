using PlatformAPI.Models.Subjects;

namespace PlatformAPI.Tests.MockData.Subjects
{
    public static class SubjectFactory
    {
        public static Subject Create(
            int id = 10,
            string description = "Test Subject",
            int sortOrder = 1,
            bool isActive = true)
        {
            return new Subject
            {
                Id = id,
                Description = description,
                SortOrder = sortOrder,
                IsActive = isActive
            };
        }

        public static List<Subject> CreateList()
        {
            return new List<Subject>
            {
                // The default subject used by your Quizzes
                SubjectFactory.Create(id: 10, description: "Math", sortOrder: 1),
        
                // An additional subject for testing filtering/sorting
                SubjectFactory.Create(id: 11, description: "Science", sortOrder: 2),
        
                // An inactive subject to test "hidden" logic
                SubjectFactory.Create(id: 12, description: "Old Curriculum", sortOrder: 3, isActive: false)
            };
        }

    }
}
