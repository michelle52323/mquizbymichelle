using PlatformAPI.Models.Quizzes;

namespace PlatformAPI.Tests.MockData.UserQuizzes
{
    public static class UserQuizFactory
    {
        public static UserQuiz Create(
            int userId = 123,
            int quizId = 1)
        {
            return new UserQuiz
            {
                UserId = userId,
                QuizId = quizId
            };
        }

        public static List<UserQuiz> CreateList()
        {
            return new List<UserQuiz>
            {
                // Links for User 123
                UserQuizFactory.Create(userId: 123, quizId: 1),
                UserQuizFactory.Create(userId: 123, quizId: 2),
                UserQuizFactory.Create(userId: 123, quizId: 3),
                UserQuizFactory.Create(userId: 123, quizId: 5),

                // Link for User 999
                UserQuizFactory.Create(userId: 999, quizId: 4)
            };
        }

    }
}
