using System.ComponentModel.DataAnnotations;

namespace PlatformAPI.Models.Users
{
    public class ForgotPasswordRequest
    {
        [Key]
        public int Id { get; set; } // Primary Key

        public int UserId { get; set; } // Foreign key ignored in model logic

        public Guid Token { get; set; } // Unique identifier for reset

        public bool Updated { get; set; } // Indicates if request was acted upon

        public DateTime ExpiresAt { get; set; } // Expiration timestamp
    }
}
