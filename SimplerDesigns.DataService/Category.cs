using Npgsql;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace SimplerDesigns.DataService
{
	public class Category : DataObject
    {
		//===========================================================================================================
		#region private things

		private const string TABLE = "data.category";
		private const string COLUMNS = "category_id, name, category_ref_id";
		#endregion

		//===========================================================================================================
		#region static methods
		public static List<Category> GetList()
		{
			List<Category> list = new();

			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();
			cmd.CommandText = $"select {COLUMNS} from {TABLE} order by name";
			NpgsqlDataReader reader = cmd.ExecuteReader();
			while (reader.Read())	list.Add(new Category(reader));
			reader.Close();
			connection.Close();

			return list;
		}

		public static Category Get(int id)
		{
			Category category = null;
			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();
			cmd.CommandText = $"select {COLUMNS} from {TABLE} where category_id = :id order by name";
			cmd.Parameters.AddWithValue("id", id);
			NpgsqlDataReader reader = cmd.ExecuteReader();
			if (reader.Read()) category = new Category(reader);
			reader.Close();
			connection.Close();

			return category;
		}

		#endregion

		//===========================================================================================================
		#region constructors
		public Category() : base()
		{
				
		}

		public Category(NpgsqlDataReader reader) : base()
		{
			this.CategoryId = reader.IsDBNull(0) ? null : Convert.ToInt32(reader.GetDecimal(0));
			this.Name = reader.IsDBNull(1) ? string.Empty : reader.GetString(1);
			this.CategoryRefId = reader.IsDBNull(2) ? null : Convert.ToInt32(reader.GetDecimal(2));	
		}
		#endregion

		//===========================================================================================================
		#region properties
		public int? CategoryId { get; set; }
		public string Name { get; set; }
        public int? CategoryRefId { get; set; }

        #endregion

        //===========================================================================================================
        #region public methods

        public int Save()
		{
			int result = 0;
			if (!this.CategoryId.HasValue)
			{
				this.CategoryId = SequenceNextval($"{TABLE}_seq");
				result = ExecuteCommand($"insert into {TABLE} ({COLUMNS}) values (:kid, :name, :refid)",
						new KeyValuePair<string, object>("kid", this.CategoryId.Value),
						new KeyValuePair<string, object>("name", String.IsNullOrEmpty(this.Name) ? DBNull.Value : this.Name),
						new KeyValuePair<string, object>("refid", this.CategoryRefId.HasValue ? this.CategoryRefId.Value : DBNull.Value) );
						
            }
            else
			{
				result = ExecuteCommand($"update {TABLE} set name = :name, category_ref_id = :refid where category_id = :kid",
						new KeyValuePair<string, object>("kid", this.CategoryId.Value),
						new KeyValuePair<string, object>("name", String.IsNullOrEmpty(this.Name) ? DBNull.Value : this.Name),
						new KeyValuePair<string, object>("refid", this.CategoryRefId.HasValue ? this.CategoryRefId.Value : DBNull.Value) );
            }
			return result;

		}

		public int Delete() => this.CategoryId.HasValue
			? ExecuteCommand($"delete from {TABLE} where category_id = :kid", new KeyValuePair<string, object>("kid", this.CategoryId))
			: 0;
		#endregion
	}
}
