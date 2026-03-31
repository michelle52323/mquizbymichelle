using System.ComponentModel.DataAnnotations;

namespace PlatformAPI.Models.Quizzes
{
    public class AnswerChoice
    {
        public int Id { get; set; }

        public string Description { get; set; }

        public int SortOrder { get; set; }

        public bool IsCorrect { get; set; }

        public bool IsActive { get; set; }

        public QuestionAnswer QuestionAnswer { get; set; }
    }
}

