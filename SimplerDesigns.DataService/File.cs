using Npgsql;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using DataFile = SimplerDesigns.DataService.File;

namespace SimplerDesigns.DataService
{
	public class File : DataObject
	{
		//===========================================================================================================
		#region private things

		private const string TABLE = "data.file";
		private const string COLUMNS = "file_id, article_id, name, content, thumbnail, media_type";
		#endregion

		//===========================================================================================================
		#region static methods
		public static List<File> GetList(Article article)
		{
			List<File> list = new();

			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();
			cmd.CommandText = $"select {COLUMNS} from {TABLE} where article_id = :aid order by name";
			cmd.Parameters.AddWithValue("aid", article.ArticleId);
			NpgsqlDataReader reader = cmd.ExecuteReader();
			while (reader.Read())	list.Add(new File(reader));
			reader.Close();
			connection.Close();

			return list;
		}

		public static File Get(int id)
		{
			File file = null;
			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();
			cmd.CommandText = $"select {COLUMNS} from {TABLE} where file_id = :id";
			cmd.Parameters.AddWithValue("id", id);
			NpgsqlDataReader reader = cmd.ExecuteReader();
			if (reader.Read()) file = new File(reader);	
			reader.Close();
			connection.Close();
			return file;

		}

		#endregion

		//===========================================================================================================
		#region constructors
		public File() : base()
		{
				
		}

		public File(NpgsqlDataReader reader) : base()
		{
			this.FileId = reader.IsDBNull(0) ? null : Convert.ToInt32(reader.GetDecimal(0));
			this.ArticleId = reader.IsDBNull(1) ? null : Convert.ToInt32(reader.GetDecimal(1));
			this.Name = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
			this.Content = reader.IsDBNull(3) ? null : (byte[])reader.GetValue(3);
            this.Thumbnail = reader.IsDBNull(4) ? false : reader.GetBoolean(4);
            this.MediaType = reader.IsDBNull(5) ? string.Empty : reader.GetString(5);
        }
        #endregion

        //===========================================================================================================
        #region properties
        public int? FileId { get; set; }
		public int? ArticleId { get; set; }
		public string Name { get; set; }
		public string MediaType { get; set; }
        public bool Thumbnail { get; set; }


        [JsonIgnore()]
		public byte[] Content { get; set; }

		[JsonPropertyName("content")]
		public string InhaltStr
		{
			get
			{
				if (this.Content != null) return $"data:{this.MediaType};base64,{Convert.ToBase64String(this.Content)}";
				else return null;
			}
			set
			{
				string x = value;
			}
		}

		#endregion

		//===========================================================================================================
		#region public methods

		public int Save()
		{
			int result = 0;
			if (!this.FileId.HasValue)
			{
				this.FileId = SequenceNextval($"{TABLE}_seq");
				result = ExecuteCommand($"insert into {TABLE} ({COLUMNS}) values (:fid, :aid, :name, :content, :thumbnail, :mt)",
						new KeyValuePair<string, object>("fid", this.FileId.Value),
						new KeyValuePair<string, object>("aid", this.ArticleId.Value),
						new KeyValuePair<string, object>("name", String.IsNullOrEmpty(this.Name) ? DBNull.Value : this.Name),
						new KeyValuePair<string, object>("content", this.Content == null ? DBNull.Value : this.Content),
                        new KeyValuePair<string, object>("thumbnail", this.Thumbnail),
                        new KeyValuePair<string, object>("mt", String.IsNullOrEmpty(this.MediaType) ? DBNull.Value : this.MediaType));

			}
			else
			{
				result = ExecuteCommand($"update {TABLE} set article_id = :aid, name = :name, content = :content, thumbnail = :thumbnail, media_type = :mt where file_id = :fid",
						new KeyValuePair<string, object>("fid", this.FileId.Value),
						new KeyValuePair<string, object>("aid", this.ArticleId.Value),
						new KeyValuePair<string, object>("name", String.IsNullOrEmpty(this.Name) ? DBNull.Value : this.Name),
						new KeyValuePair<string, object>("content", this.Content == null ? DBNull.Value : this.Content),
                        new KeyValuePair<string, object>("thumbnail", this.Thumbnail),
                        new KeyValuePair<string, object>("mt", String.IsNullOrEmpty(this.MediaType) ? DBNull.Value : this.MediaType));
			}
			return result;

		}

		public int Delete() => this.FileId.HasValue
			? ExecuteCommand($"delete from {TABLE} where file_id = :fid", new KeyValuePair<string, object>("fid", this.FileId))
			: 0;
		#endregion
	}
}
