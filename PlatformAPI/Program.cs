using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using PlatformAPI.Configuration;
using PlatformAPI.Data;
using PlatformAPI.Repositories.Quizzes;
using PlatformAPI.Services;
using Microsoft.Extensions.Options;
using Serilog;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Authentication;
using PlatformAPI.Repositories.Interfaces;
using PlatformAPI.Repositories;
//using PlatformAPI.MockAuth;


var builder = WebApplication.CreateBuilder(args);

// -------------------------
// Logging (Serilog)
// -------------------------
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File(
        "logs/log-.txt",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7,
        rollOnFileSizeLimit: true
    )
    .CreateLogger();

builder.Host.UseSerilog();

// -------------------------
// Configuration
// -------------------------
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Bind AppBehaviorSettings
builder.Services.Configure<AppBehaviorSettings>(builder.Configuration);
var appBehavior = builder.Configuration.Get<AppBehaviorSettings>();

// Bind OrganizationSettings
builder.Services.Configure<OrganizationSettings>(
    builder.Configuration.GetSection("OrganizationSettings")
);
//builder.Services.AddSingleton<EmailService>();

// -------------------------
// Services
// -------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<OrganizationContext>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<IQuestionsRepository, QuestionsRepository>();

builder.Services.AddScoped<ILoginAttemptRepository, LoginAttemptRepository>();
builder.Services.AddScoped<LoginAttemptAnalyzerService>();

// -------------------------
// Data Protection
// -------------------------
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(@"C:\QuizAppKeys"))
        .SetApplicationName("QuizApp");
}
else
{
    //builder.Services.AddDataProtection()
    //    .PersistKeysToAzureBlobStorage(new Uri(builder.Configuration["DataProtection:BlobUri"]))
    //    .SetApplicationName("QuizApp");
}


// -------------------------
// Database
// -------------------------
//var connectionKey = builder.Configuration["DatabaseConnection"];
if (builder.Environment.EnvironmentName != "Testing")
{
    var connectionKey = builder.Configuration["DatabaseConnection"];
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString(connectionKey)));
}


//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString(connectionKey)));

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    // ONLY register SQL Server if the test hasn't already provided InMemory
    if (!options.IsConfigured)
    {
        var connectionKey = builder.Configuration["DatabaseConnection"];
        options.UseSqlServer(builder.Configuration.GetConnectionString(connectionKey));
    }
});


// -------------------------
// Authentication
// -------------------------
if (builder.Environment.IsDevelopment())
{

    builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/signin";
        options.AccessDeniedPath = "/denied";
        options.ExpireTimeSpan = TimeSpan.FromHours(1);
        options.SlidingExpiration = true;
        options.Cookie.Name = "AuthCookie";
        options.Cookie.Path = "/";
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        //options.Cookie.SameSite = SameSiteMode.Lax;
        //options.Cookie.SecurePolicy = CookieSecurePolicy.None;
        //options.Cookie.Domain = null; // important: do NOT set a domain in dev


        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    });
}
else
{

    builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/signin";
        options.AccessDeniedPath = "/denied";
        options.ExpireTimeSpan = TimeSpan.FromHours(1);
        options.SlidingExpiration = true;
        options.Cookie.Name = "AuthCookie";
        options.Cookie.Path = "/";
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        //options.Cookie.Domain = "websitesbymichelle.com";
        options.Cookie.Domain = ".mquizbymichelle.com";

        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    });
}


// -------------------------
// CORS (SERVICE REGISTRATION)
// -------------------------
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowReactFrontEnd", policy =>
        {
            policy.WithOrigins(
                "https://www.websitesbymichelle.com",
                "https://websitesbymichelle.com",
                "https://www.mquizbymichelle.com",
                "https://.mquizbymichelle.com",
                "https://localhost:5173",
                "http://localhost:5173",
                "https://localhost",
                "http://192.168.1.12:5173",
                "https://192.168.1.12:5173",
                "http://127.0.0.1:5173"
            )
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
        });
        //options.AddPolicy("AllowReactFrontEnd", policy =>
        //{
        //    policy.WithOrigins(
        //        "http://localhost:5173",
        //        "http://localhost"
        //    )
        //    .AllowCredentials()
        //    .AllowAnyHeader()
        //    .AllowAnyMethod();

        //});
    });
}
else
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowSpecificOrigins", policy =>
        {
            policy.WithOrigins(
                "https://localhost:5173",
                "http://localhost:5173",
                "https://192.168.1.10:5173",
                "https://www.mquizbymichelle.com",
                "https://mquizbymichelle.com",
                "https://www.websitesbymichelle.com"
            )
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
        });
    });
}


// -------------------------
// Build App
// -------------------------
var app = builder.Build();


// -------------------------
// Middleware
// -------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

// CORS MUST be here — before auth
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowReactFrontEnd");
}
else
{
    app.UseCors("AllowSpecificOrigins");
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }

