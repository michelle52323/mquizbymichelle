using PlatformAPI.Repositories;
using PlatformAPI.Repositories.Interfaces;

namespace PlatformAPI.Services
{

    public enum LoginAttemptStatus
    {
        Success,
        CaptchaRequired,
        Blocked
    }

    public class LoginAttemptResult
    {
        public LoginAttemptStatus Status { get; set; }
        public string? Message { get; set; }
        public double? MinutesRemaining { get; set; }
    }

    public class LoginAttemptThreshold
    {
        public int MaxAttempts { get; set; }
        public int MaxAttemptsCaptcha { get; set; }
        public bool UseCaptcha { get; set; }
        public TimeSpan Window { get; set; }
        public string Scope { get; set; }
    }
    public class LoginAttemptAnalyzerService
    {

        private readonly ILoginAttemptRepository _repository;

        private readonly LoginAttemptThreshold _usernameThreshold = new LoginAttemptThreshold
        {
            MaxAttempts = 3,
            MaxAttemptsCaptcha = 2,
            UseCaptcha = true,
            Window = TimeSpan.FromMinutes(15),
            Scope = "username"
        };

        private readonly LoginAttemptThreshold _ipThreshold = new LoginAttemptThreshold
        {
            MaxAttempts = 10,
            MaxAttemptsCaptcha = 8,
            UseCaptcha = true,
            Window = TimeSpan.FromMinutes(15),
            Scope = "ip"
        };

        public LoginAttemptAnalyzerService(ILoginAttemptRepository repository)
        {
            _repository = repository;
        }

        public async Task<LoginAttemptResult> CheckLoginAttemptsByUsernameAsync(string username)
        {
            var cutoff = DateTime.UtcNow - _usernameThreshold.Window;

            LoginAttemptResult result = new LoginAttemptResult();

            // Await the async repository call
            var attempts = await _repository.GetAttemptsByUsernameAsync(username, cutoff);

            int consecutiveFailures = 0;
            DateTime? streakStartTimestamp = null;

            foreach (var attempt in attempts.OrderBy(a => a.Timestamp))
            {
                if (attempt.WasSuccessful)
                {
                    // Streak breaks on success
                    consecutiveFailures = 0;
                    streakStartTimestamp = null;
                    continue;
                }

                consecutiveFailures++;

                if (streakStartTimestamp == null)
                    streakStartTimestamp = attempt.Timestamp;

                if (consecutiveFailures >= _usernameThreshold.MaxAttempts)
                {
                    var expiresAt = streakStartTimestamp.Value + _usernameThreshold.Window;
                    var minutesRemaining = (expiresAt - DateTime.UtcNow).TotalMinutes;
                    minutesRemaining = Math.Max(0, minutesRemaining);

                    result.Status = LoginAttemptStatus.Blocked;
                    result.MinutesRemaining = Math.Ceiling(minutesRemaining);
                    result.Message = $"Please wait {Math.Ceiling(minutesRemaining)} minute(s) to sign in.";
                    return result;
                }
            }

            // If we reach here, the user is not blocked
            result.Status = LoginAttemptStatus.Success;
            return result;
        }

        public async Task<LoginAttemptResult> CheckLoginAttemptsByIpAsync(string ipAddress)
        {
            var cutoff = DateTime.UtcNow - _ipThreshold.Window;

            LoginAttemptResult result = new LoginAttemptResult();

            // Await the async repository call
            var attempts = await _repository.GetAttemptsByIpAsync(ipAddress, cutoff);

            int consecutiveFailures = 0;
            DateTime? streakStartTimestamp = null;

            foreach (var attempt in attempts.OrderBy(a => a.Timestamp))
            {
                if (attempt.WasSuccessful)
                {
                    // Streak breaks on success
                    consecutiveFailures = 0;
                    streakStartTimestamp = null;
                    continue;
                }

                consecutiveFailures++;

                if (streakStartTimestamp == null)
                    streakStartTimestamp = attempt.Timestamp;

                if (consecutiveFailures >= _ipThreshold.MaxAttempts)
                {
                    var expiresAt = streakStartTimestamp.Value + _ipThreshold.Window;
                    var minutesRemaining = (expiresAt - DateTime.UtcNow).TotalMinutes;
                    minutesRemaining = Math.Max(0, minutesRemaining);

                    result.Status = LoginAttemptStatus.Blocked;
                    result.MinutesRemaining = Math.Ceiling(minutesRemaining);
                    result.Message = $"Please wait {Math.Ceiling(minutesRemaining)} minute(s) to sign in.";
                    return result;
                }
            }

            result.Status = LoginAttemptStatus.Success;
            return result;
        }

    }
}
