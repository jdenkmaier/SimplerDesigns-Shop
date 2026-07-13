using Npgsql;
using System.Reflection.Metadata.Ecma335;
using System.Text.Json.Serialization;

namespace SimplerDesigns.DataService
{

	public abstract class DataObject
	{
		protected DataObject()
		{
		}


        // NpgsqlConnection und NpgsqlTransaction müssen nullable (?) sein, damit ASP.NET Model Validation diese Felder nicht als Pflichtfelder behandelt.
        [JsonIgnore(Condition = JsonIgnoreCondition.Always)]
        public NpgsqlConnection? Connection { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.Always)]
        public NpgsqlTransaction? Transaction { get; set; }

        protected int SequenceNextval(string sequenceName)
		{
			OpenConnection();
			NpgsqlCommand cmd = this.Connection.CreateCommand();
			cmd.CommandText = $"select nextval('{sequenceName}')";
			int val = (int)(long)cmd.ExecuteScalar();
			this.Connection.Close();
			return val;
		}

		protected object ExecuteScalar(string command, params KeyValuePair<string, object>[] parameters)
		{
			object result = 0;
			try
			{
				OpenConnection();
				NpgsqlCommand cmd = this.Connection.CreateCommand();
				cmd.CommandText = command;
				if (parameters != null && parameters.Length > 0)
				{
					foreach (KeyValuePair<string, object> p in parameters)
					{
						cmd.Parameters.AddWithValue(p.Key, p.Value);
					}
				}
				result = cmd.ExecuteScalar();
			}
			catch (Exception)
			{
				throw;
			}
			finally
			{
				this.Connection.Close();
			}
			return result;

		}

		protected int ExecuteCommand(string command, params KeyValuePair<string, object>[] parameters)
		{
			int result = 0;
			try
			{
				OpenConnection();
				NpgsqlCommand cmd = this.Connection.CreateCommand();
				cmd.CommandText = command;
				if (parameters != null && parameters.Length > 0)
				{
					foreach (KeyValuePair<string, object> p in parameters)
					{
						cmd.Parameters.AddWithValue(p.Key, p.Value);
					}
				}
				result = cmd.ExecuteNonQuery();
			}
			catch (Exception)
			{
				throw;
			}
			finally
			{
				this.Connection.Close(); 
			}
			return result;
		}

		private void OpenConnection()
		{
            this.Connection ??= DataConnection.GetConnection();
            if (this.Connection.State != System.Data.ConnectionState.Open)
                this.Connection.Open();
        }



	}
}
