using BCrypt.Net;

namespace PlatformAPI.Security
{
    public static class PasswordHasher
    {
        // Adjustable cost factor for bcrypt hashing
        private const int WorkFactor = 12;

        /// <summary>
        /// Hashes a plaintext password using bcrypt with the configured work factor.
        /// </summary>
        public static string Hash(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: WorkFactor);
        }

        /// <summary>
        /// Verifies a plaintext password against a stored bcrypt hash.
        /// </summary>
        public static bool Verify(string inputPassword, string storedHash)
        {
            return BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
        }

        /// <summary>
        /// Determines whether a stored hash needs rehashing due to outdated work factor.
        /// </summary>
        public static bool NeedsRehash(string storedHash)
        {
            return BCrypt.Net.BCrypt.EnhancedHashPassword("dummy", WorkFactor) != storedHash;
        }
    }
}