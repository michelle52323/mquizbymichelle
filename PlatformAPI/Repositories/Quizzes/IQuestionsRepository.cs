using PlatformAPI.Models.Quizzes;
using PlatformAPI.DTO.Questions;
using PlatformAPI.Controllers.QuizBuilder;


namespace PlatformAPI.Repositories.Quizzes
{
    public interface IQuestionsRepository
    {

        Task<List<Question>> GetQuestionsByQuizIdAsync(int quizId);

        Task<Question?> GetQuestionByIdAsync(int questionId);

        Task<QuestionPositionDto?> GetQuestionPositionAsync(int questionId);

        Task<int> GetQuizIdByQuestionIdAsync(int questionId);

        Task<int> GetActiveQuestionCountAsync(int quizId);

        Task<int?> GetLastActiveQuestionIdAsync(int quizId);

        Task<int?> GetNextQuestionIdAsync(int quizId, int currentQuestionId);

        Task<int?> GetPreviousQuestionIdAsync(int quizId, int currentQuestionId);

        Task<int?> CreateQuestionAsync(CreateQuestionRequestDto dto);

        Task<bool> UpdateQuestionSortOrderAsync(int quizId, List<QuestionsSortOrderDto> updates);

        Task<bool> UpdateQuestionAsync(int questionId, string description, int questionTypeId, bool IsPublished);

        Task<bool> DeleteQuestionAsync(int id);

        
    }
}