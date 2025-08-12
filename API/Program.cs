using System.Reflection;
using System.Text;
using API.Data;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

namespace API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();

        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddSwaggerGen(c =>
        {
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath)) c.IncludeXmlComments(xmlPath);
        });

        // Tilføj CORS for specifikke Blazor WASM domæner
        builder.Services.AddCors(options =>
        {
            options.AddPolicy(
                "AllowSpecificOrigins",
                builder =>
                {
                    builder
                        .WithOrigins(
                            "http://localhost:5085",
                            "http://localhost:8052",
                            "https://h2.mercantec.tech"
                        )
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .WithExposedHeaders("Content-Disposition");
                }
            );
        });

        // Tilføj basic health checks
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

        //TODO: Add Autherization services builder.Services.AddAuthorization();
        //TODO: Specify authentication using JWT Bearer tokens, and specify how the token should be validated
        // builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).....


        // Add database
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                               Environment.GetEnvironmentVariable("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString)) throw new Exception("Missing connection string for database");

        // Adding the database including enum mappings, see DBContextRegistrationExtensions.cs
        builder.Services.AddAppDbContext(connectionString);


        var app = builder.Build();

        // Brug CORS - skal være før anden middleware
        app.UseCors("AllowSpecificOrigins");

        // Map health checks
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new HealthCheckOptions
        {
            Predicate = r => r.Tags.Contains("live")
        });

        app.MapOpenApi();

        // Scalar Middleware for OpenAPI
        app.MapScalarApiReference(options =>
        {
            options
                .WithTitle("MAGSLearn")
                .WithTheme(ScalarTheme.Mars)
                .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
        });

        // Map the Swagger UI
        app.UseSwagger();
        app.UseSwaggerUI(options => { options.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1"); });

        //TODO: Add Authentication middleware - app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}