using Microsoft.Extensions.Options;

namespace PlatformAPI.Configuration
{
    public class OrganizationSettings
    {
        public string OrganizatioName { get; set; } = string.Empty;
        public string OrganizationUrl { get; set; } = string.Empty;

        public string CookieDomain {  get; set; } = string.Empty;
    }

    public class OrganizationContext
    {
        private readonly OrganizationSettings _settings;

        public OrganizationContext(IOptions<OrganizationSettings> settings)
        {
            _settings = settings.Value;
        }

        public string GetDisplayName() => _settings.OrganizatioName;

        public string GetHomepageUrl() => _settings.OrganizationUrl;

        public string GetCookieDomain() => _settings.CookieDomain;

        public string GetBrandedFooter() =>
            $"© {DateTime.Now.Year} {_settings.OrganizatioName} — All rights reserved.";
    }
}