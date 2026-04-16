using System.ComponentModel.DataAnnotations;

namespace PlatformAPI.Models.StudentQuizzes
{
    public class StudentQuizAttempt
    {
        [Key]
        public int Id { get; set; }

        public int StudentQuizAssignmentId { get; set; }

        public DateTime DateTaken { get; set; }

        public bool IsCompleted { get; set; }

        public int? Score { get; set; }      //Number of correct answers

        public bool IsActive { get; set; }

        // Navigation
        public ICollection<StudentQuizAnswers> Answers { get; set; }

    }

}
