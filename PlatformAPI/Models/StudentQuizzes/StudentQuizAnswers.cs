using System.ComponentModel.DataAnnotations;

namespace PlatformAPI.Models.StudentQuizzes
{
    public class StudentQuizAnswers
    {
        [Key]
        public int Id { get; set; }

        public int StudentQuizAttemptId { get; set; }

        public int QuestionId { get; set; }

        public int? AnswerId { get; set; }

        public string? AnswerText { get; set; }

        public DateTime Timestamp { get; set; }

        public bool? IsCorrect { get; set; }

        public bool IsActive { get; set; }

    }
}
