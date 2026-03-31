using System.ComponentModel.DataAnnotations;

namespace PlatformAPI.Models.Quizzes
{
    public class QuestionType
    {
        public int Id { get; set; }

        public string Description { get; set; }

        public int SortOrder { get; set; }

        public bool IsActive { get; set; }
    }
}
