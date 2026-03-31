using System.ComponentModel.DataAnnotations;

namespace PlatformAPI.Models.StudentQuizzes
{
    public class StudentQuizAssignment
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public int QuizId { get; set; }

        public bool AllowMultipleAttempts { get; set; }

        public int? MostRecentAttemptId { get; set; }

        public bool IsActive { get; set; }

        // Navigation
        public ICollection<StudentQuizAttempt> Attempts { get; set; }
    }

}
