using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using PlatformAPI.Data;
//using PlatformAPI.MockAuth;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // FORCE the environment to something other than Development/Production
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // 1. Remove BOTH the Context and its Options
            var contextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(AppDbContext));
            if (contextDescriptor != null) services.Remove(contextDescriptor);

            var optionsDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (optionsDescriptor != null) services.Remove(optionsDescriptor);

            // 2. THE CRITICAL PART: Remove the EF Internal Service Provider
            // This is what usually causes the "Multiple Providers" crash
            var internalEfDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IServiceProvider) && d.ImplementationType?.Name == "EntityFrameworkServicesBuilder");
            if (internalEfDescriptor != null) services.Remove(internalEfDescriptor);

            // 3. Re-add the Context with a fresh Internal Service Provider
            services.AddEntityFrameworkInMemoryDatabase(); // Forces a fresh start

            services.AddDbContext<AppDbContext>((sp, options) =>
            {
                options.UseInMemoryDatabase("TestDb");
                options.UseInternalServiceProvider(sp); // Tells it to use THIS provider ONLY
            });

            // 4. Re-add Mock Auth
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, MockAuthHandler>("Test", options => { });
        });
    }
}