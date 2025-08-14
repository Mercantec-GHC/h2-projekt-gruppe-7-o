using API.Data;
using API.Database.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OpenXmlPowerTools;
using Scalar.AspNetCore;
using System.Reflection;
using System.Text;

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

            // Add JWT Bearer support to Swagger
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = @"JWT Authorization header using the Bearer scheme. 
                                Enter 'Bearer' [space] and then your token in the text input below.",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement()
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header,
                    },
                    new List<string>()
                }
            });
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


        // Registrer JWT Service
        builder.Services.AddScoped<JwtService>();

        // Konfigurer JWT Authentication
       
      

        // With these lines:
        var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
            ?? Environment.GetEnvironmentVariable("Jwt:SecretKey");

        var jwtIssuer = builder.Configuration["Jwt:Issuer"]
            ?? Environment.GetEnvironmentVariable("Jwt:Issuer");

        var jwtAudience = builder.Configuration["Jwt:Audience"]
            ?? Environment.GetEnvironmentVariable("Jwt:Audience");



        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
      Encoding.ASCII.GetBytes(jwtSecretKey)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateLifetime = true,
                };
            });

        builder.Services.AddAuthorization();

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
                .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
                .OpenApiRoutePattern = "/swagger/v1/swagger.json";
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