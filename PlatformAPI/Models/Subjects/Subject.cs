using System.ComponentModel.DataAnnotations;

namespace PlatformAPI.Models.Subjects
{
    public class Subject
    {
        public int Id { get; set; }

        public string Description { get; set; }

        public int SortOrder { get; set; }

        public bool IsActive { get; set; }
    }
}
