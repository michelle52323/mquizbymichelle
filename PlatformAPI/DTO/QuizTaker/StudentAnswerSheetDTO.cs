namespace PlatformAPI.DTO.QuizTaker
{
    public class StudentAnswerSheetDTO
    {
        public int AssignmentId { get; set; }
        public int UserId { get; set; }
        public int QuizId { get; set; }
        public bool AllowMultipleAttempts { get; set; }
        public int? MostRecentAttemptId { get; set; }
        public bool IsActive { get; set; }

        public StudentAnswerSheetAttemptDTO Attempt { get; set; }
    }

    public class StudentAnswerSheetAttemptDTO
    {
        public int AttemptId { get; set; }
        public DateTime DateTaken { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsActive { get; set; }

        public List<StudentAnswerSheetAnswerDTO> Answers { get; set; }
    }

    public class StudentAnswerSheetAnswerDTO
    {
        public int AnswerSheetEntryId { get; set; }   // maps to StudentQuizAnswers.Id
        public int QuestionId { get; set; }
        public int? SelectedAnswerId { get; set; }    // maps to AnswerId
        public string? AnswerText { get; set; }
        public DateTime Timestamp { get; set; }
        public bool? IsCorrect { get; set; }
        public bool IsActive { get; set; }
    }

}
