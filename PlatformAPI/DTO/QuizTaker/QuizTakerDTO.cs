namespace PlatformAPI.DTO.QuizTaker
{
    public class QuizTakerDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int SortOrder { get; set; }
        public bool IsPublished { get; set; }

        public string SubjectName {  get; set; }

        public List<QuizTakerQuestionDTO> Questions { get; set; }
    }

    public class QuizTakerQuestionDTO
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public int SortOrder { get; set; }
        public bool IsPublished { get; set; }

        // QuestionType is an integer per your rule
        public int QuestionTypeId { get; set; }

        public List<QuizTakerAnswerChoiceDTO> AnswerChoices { get; set; }
    }

    public class QuizTakerAnswerChoiceDTO
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public int SortOrder { get; set; }
    }
}
