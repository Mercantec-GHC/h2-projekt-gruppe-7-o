using System.Net;
using System.Net.Mail;

namespace API.Features.Mail.Services;

public class MailService
{
    private readonly IConfiguration _configuration;
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public MailService(IConfiguration configuration)
    {
        _configuration = configuration;

        _smtpServer = configuration["MailSettings:SmtpServer"] ?? throw new ArgumentNullException("Smtp:Server not configured.");
        _smtpPort = int.Parse(configuration["MailSettings:SmtpPort"] ?? throw new ArgumentNullException("Smtp:Port not configured."));
        _smtpUsername = configuration["MailSettings:SmtpUsername"] ?? throw new ArgumentNullException("Smtp:Username not configured.");
        _smtpPassword = configuration["MailSettings:SmtpPassword"] ?? throw new ArgumentNullException("Smtp:Password not configured.");
        _fromEmail = configuration["MailSettings:FromEmail"] ?? throw new ArgumentNullException("Smtp:FromEmail not configured.");
        _fromName = configuration["MailSettings:FromName"] ?? throw new ArgumentNullException("Smtp:FromName not configured.");
    }

    private async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            using var smtpClient = new SmtpClient(_smtpServer, _smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                UseDefaultCredentials = false
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
            return true;
        }
        catch (Exception ex)
        {
            
            Console.WriteLine($"Failed to send email: {ex.Message}");
            return false;
        }
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string userName)
    {
        var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Features", "Mail", "Templates", "welcome-email.html");
        var body = await System.IO.File.ReadAllTextAsync(templatePath);
        body = body.Replace("{username}", userName);

        await SendEmailAsync(toEmail, "Velkommen til KabdiKhan!", body);
    }

    public async Task SendBookingConfirmationEmailAsync(
        string toEmail, 
        string userName, 
        string roomNumber, 
        string hotelName, 
        DateTime startDate, 
        DateTime endDate, 
        short numberOfGuests,
        int nights,
        decimal totalPrice, 
        Guid bookingId)
    {
        var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Features", "Mail", "Templates", "booking-confirmation.html");
        var body = await System.IO.File.ReadAllTextAsync(templatePath);

        body = body.Replace("{username}", userName);
        body = body.Replace("{roomNumber}", roomNumber);
        body = body.Replace("{hotelName}", hotelName);
        body = body.Replace("{startDate}", startDate.ToShortDateString());
        body = body.Replace("{endDate}", endDate.ToShortDateString());
        body = body.Replace("{numberOfGuests}", numberOfGuests.ToString());
        body = body.Replace("{nights}", nights.ToString());
        body = body.Replace("{totalPrice:C}", totalPrice.ToString("C", new System.Globalization.CultureInfo("da-DK")));
        body = body.Replace("{bookingId}", bookingId.ToString());

        await SendEmailAsync(toEmail, "Din booking er bekræftet!", body);
    }
}
