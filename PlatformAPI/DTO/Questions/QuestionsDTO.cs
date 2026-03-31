namespace PlatformAPI.DTO.Questions
{
    public class QuestionsSortOrderDto
    {
        public int Id { get; set; }          // QuestionId
        public int SortOrder { get; set; }
    }

    public class QuestionPositionDto
    {
        public int QuizId { get; set; }
        public int TotalQuestions { get; set; }
        public int CurrentQuestionNumber { get; set; }
    }
}
