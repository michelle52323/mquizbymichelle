using Microsoft.Extensions.Options;

namespace PlatformAPI.Configuration
{
    public class AppBehaviorSettings
    {
        public bool IsLive { get; set; }
        public bool UseMockLogin { get; set; }
        public string DatabaseConnection { get; set; }
    }

    public class AppBehaviorContext
    {
        private readonly AppBehaviorSettings _settings;
        private readonly IConfiguration _config;

        public AppBehaviorContext(IOptions<AppBehaviorSettings> settings, IConfiguration config)
        {
            _settings = settings.Value;
            _config = config;
        }

        public bool UseMockLogin() => _settings.UseMockLogin;

        public bool IsLive() => _settings.IsLive;

        public string GetActiveConnectionString()
        {
            return _config.GetConnectionString(_settings.DatabaseConnection);
        }

        public string GetConnectionName() => _settings.DatabaseConnection;
    }
}
