using PlatformAPI.Models.StudentQuizzes;

namespace PlatformAPI.Tests.MockData.StudentQuizAssignments
{
    public static class StudentQuizAssignmentFactory
    {
        public static StudentQuizAssignment Create(
            int userId = 123,
            int quizId = 1,
            bool isActive = true,
            bool isInstructor = false,
            bool allowMultipleAttempts = false,
            int? mostRecentAttemptId = null)
        {
            return new StudentQuizAssignment
            {
                UserId = userId,
                QuizId = quizId,
                IsActive = isActive,
                IsInstructor = isInstructor,
                AllowMultipleAttempts = allowMultipleAttempts,
                MostRecentAttemptId = mostRecentAttemptId
            };
        }

        public static List<StudentQuizAssignment> CreateList()
        {
            return new List<StudentQuizAssignment>
            {
                // Assignments for User 123
                StudentQuizAssignmentFactory.Create(userId: 123, quizId: 1, isInstructor: true),
                StudentQuizAssignmentFactory.Create(userId: 123, quizId: 2, isInstructor: true),
                StudentQuizAssignmentFactory.Create(userId: 123, quizId: 3, isInstructor: true),

                // Assignment for User 999
                StudentQuizAssignmentFactory.Create(userId: 999, quizId: 4, isInstructor: true)
            };
        }

    }
}
