using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PlatformAPI.Models.Subjects;

namespace PlatformAPI.Models.Quizzes
{
    public class Quiz
    {
        public int Id { get; set; }

        public int SubjectId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public int SortOrder { get; set; }

        public bool IsActive { get; set; }

        public bool IsPublished { get; set; }

        public int CreatedByUserId { get; set; }

        public DateTime DateCreated { get; set; }

        public UserQuiz UserQuiz { get; set; }

        public Subject Subject { get; set; }
    }
}
