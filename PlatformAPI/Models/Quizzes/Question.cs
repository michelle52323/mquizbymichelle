using System.ComponentModel.DataAnnotations;

namespace PlatformAPI.Models.Quizzes
{
    public class Question
    {
        public int Id { get; set; }

        public string Description { get; set; }

        public int QuestionTypeId { get; set; }

        public QuestionType QuestionType { get; set; }

        public int SortOrder { get; set; }

        public bool IsActive { get; set; }

        public bool IsPublished { get; set; }

        public QuizQuestion QuizQuestion { get; set; }
    }
}
