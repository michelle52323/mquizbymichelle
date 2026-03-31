using PlatformAPI.Models.Users;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlatformAPI.Models.Users
{
    public class LoginAttempt
    {
        public long Id { get; set; } // Use long for bigint compatibility

        public int? UserId { get; set; } // Nullable if attempt is pre-auth

        public string UserName { get; set; }

        public string? Email { get; set; }

        public string IPAddress { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public bool WasSuccessful { get; set; }

        public string? FailureReason { get; set; }

        // Optional: Navigation property if you want to link to User entity
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}