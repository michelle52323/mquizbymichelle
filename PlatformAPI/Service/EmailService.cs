using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public string AdminEmail { get; }

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
        AdminEmail = _configuration["EmailSettings:AdminEmail"];
    }

    public string SendEmail(string recipientEmail, string subject, string body)
    {
        var adminPassword = _configuration["EmailSettings:AdminPassword"];
        var smtpServer = _configuration["EmailSettings:Smtp"];
        var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);

        try
        {
            using var mail = new MailMessage
            {
                From = new MailAddress(AdminEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mail.To.Add(recipientEmail);
            mail.ReplyToList.Add(new MailAddress(AdminEmail));

            using var smtp = new SmtpClient(smtpServer, smtpPort)
            {
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(AdminEmail, adminPassword),
                EnableSsl = true
            };

            smtp.Send(mail);

            return string.Empty;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send email: {ex.Message}");
            return ex.Message.ToString();
            // Optionally log or rethrow
        }
    }
}