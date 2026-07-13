using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimplerDesigns.DataService
{
	public static class DataConnection
	{
		private static readonly string connectionString;

		static DataConnection()
		{
			var builder = new ConfigurationBuilder()
				.SetBasePath(Directory.GetCurrentDirectory())
				.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
			IConfigurationRoot configuration = builder.Build();
			connectionString = configuration["ConnectionString"];
		}

		public static NpgsqlConnection GetConnection()
		{
			if (String.IsNullOrEmpty(connectionString)) return null;
			return new NpgsqlConnection(connectionString);
		}

	}
}
