using Microsoft.AspNetCore.Cors.Infrastructure;

namespace SimplerDesigns.DataService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("myLocalPolicy", pb =>
                {
                    pb.WithOrigins("http://localhost:5500", "http://localhost:5501", "http://localhost:8080")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();

                });
            });

            //Einstellung, dass sowohl camelCase und PascalCase funktioniert
            builder.Services.AddControllers().AddJsonOptions(options => {
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                options.JsonSerializerOptions.UnmappedMemberHandling = System.Text.Json.Serialization.JsonUnmappedMemberHandling.Skip;
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseCors("myLocalPolicy");
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}