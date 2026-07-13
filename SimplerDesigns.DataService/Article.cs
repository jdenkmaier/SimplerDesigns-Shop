using Npgsql;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Text;
using SimplerDesigns.DataService;

namespace SimplerDesigns.DataService
{
	public enum ArticleColor
    {
		Default = 0,
		White = 5,
        Black = 10,
		Special = 20
    }

    public enum ArticleBrand
    {
        Default = 0,
        Feuerschwanz = 100,
        SaltatioMortis = 105,
		AmonAmarth = 110,
		Dynazty = 115,
		DArtagnan = 120,
		DarkSouls = 500,
		EldenRing = 505,
		NieR = 510,
		Witcher = 515,
		ClaireObscur = 520,
		Bloodborne = 525,
		Berserk = 800,
		LordoftheRings = 805
    }

    public class Article : DataObject
	{
		//===========================================================================================================
		#region private things

		private const string TABLE = "data.article";
		private const string COLUMNS = "article_id, number, color, name, description, price, highlight, inventory, a_category_id, article_uid, hide, brand";

		#endregion

		//===========================================================================================================
		#region static methods
		public static List<Article> GetList()
		{
			List<Article> list = new();

			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();
			cmd.CommandText = $"select {COLUMNS} from {TABLE} order by name";
			NpgsqlDataReader reader = cmd.ExecuteReader();
			while (reader.Read())	list.Add(new Article(reader));
			reader.Close();
			connection.Close();

			return list;
		}

		public static List<Article> GetHighlighted()
		{
			List<Article> list = new();

			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();
			cmd.CommandText = $"select {COLUMNS} from {TABLE} where highlight = true and hide = false order by name";
			NpgsqlDataReader reader = cmd.ExecuteReader();
			while (reader.Read()) list.Add(new Article(reader));
			reader.Close();
			connection.Close();

			return list;
		}

		public static Article Get(int id)
		{
			Article article = null;
			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();
			cmd.CommandText = $"select {COLUMNS} from {TABLE} where article_id = :id";
			cmd.Parameters.AddWithValue("id", id);
			NpgsqlDataReader reader = cmd.ExecuteReader();
			if (reader.Read()) article = new Article(reader);	
			reader.Close();
			connection.Close();
			return article;
		}

		public static Article Get(string id)
		{
			Article article = null;
			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();
			cmd.CommandText = $"select {COLUMNS} from {TABLE} where article_uid = :id";
			cmd.Parameters.AddWithValue("id", id);
			NpgsqlDataReader reader = cmd.ExecuteReader();
			if (reader.Read()) article = new Article(reader);
			reader.Close();
			connection.Close();
			return article;

		}

        #endregion

        //===========================================================================================================
        #region constructors
        public Article() : base()
		{
				
		}


        public Article(NpgsqlDataReader reader) : base()
		{
			this.ArticleId = reader.IsDBNull(0) ? null : Convert.ToInt32(reader.GetDecimal(0));
			this.Number = reader.IsDBNull(1) ? null : reader.GetString(1);
			this.Color = reader.IsDBNull(2) ? null : (ArticleColor?)Convert.ToInt32(reader.GetDecimal(2));
			this.Name = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
			this.Description = reader.IsDBNull(4) ? string.Empty : reader.GetString(4);
			this.Price = reader.IsDBNull(5) ? null : Convert.ToDouble(reader.GetDecimal(5));
			this.Highlight = reader.IsDBNull(6) ? false : reader.GetBoolean(6);
			this.Inventory = reader.IsDBNull(7) ? null : Convert.ToInt32(reader.GetDecimal(7));
			this.A_CategoryId = reader.IsDBNull(8) ? null : Convert.ToInt32(reader.GetDecimal(8));
			this.ArticleUid = reader.IsDBNull(9) ? string.Empty : reader.GetString(9);
			this.Hide = reader.IsDBNull(10) ? false : reader.GetBoolean(10);
			this.Brand = reader.IsDBNull(11) ? null : (ArticleBrand?)Convert.ToInt32(reader.GetDecimal(11));
        }
        #endregion

        //===========================================================================================================
        #region properties
        public int? ArticleId { get; set; }
		public string Number { get; set; }
        public ArticleColor? Color { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
		public double? Price { get; set; }
		public bool Highlight { get; set; }
        public int? Inventory { get; set; }
        public int? A_CategoryId { get; set; }
        public string? ArticleUid { get; set; }
        public bool Hide { get; set; }
        public ArticleBrand? Brand { get; set; }


        #endregion

        //===========================================================================================================
        #region public methods

        // Add to Article class
        public static List<Article> GetList(Category category)
        {
            if (category == null || !category.CategoryId.HasValue) return new List<Article>();

            List<Article> list = new();

            NpgsqlConnection connection = DataConnection.GetConnection();
            connection.Open();
            NpgsqlCommand cmd = connection.CreateCommand();
            cmd.CommandText = $"select {COLUMNS} from {TABLE} where a_category_id = :cid order by name";
            cmd.Parameters.AddWithValue("cid", category.CategoryId.Value);
            NpgsqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read()) list.Add(new Article(reader));
            reader.Close();
            connection.Close();

            return list;
        }

        public static List<Article> GetListByCategoryOrSubcategory(Category category)
        {
            if (category == null || !category.CategoryId.HasValue) return new List<Article>();

            List<Article> list = new();

            NpgsqlConnection connection = DataConnection.GetConnection();
            connection.Open();
            NpgsqlCommand cmd = connection.CreateCommand();
            cmd.CommandText = $"select a.article_id, a.number, a.color, a.name, a.description, a.price, a.highlight, a.inventory, a.a_category_id, a.article_uid, a.hide, a.brand from {TABLE} a left join data.category c on c.category_id = a.a_category_id where a.a_category_id = :cid or c.category_ref_id = :cid order by a.name";
            cmd.Parameters.AddWithValue("cid", category.CategoryId.Value);
            NpgsqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read()) list.Add(new Article(reader));
            reader.Close();
            connection.Close();

            return list;
        }

        public int Save()
		{
			int result = 0;
			if (!this.ArticleId.HasValue)
			{
				this.ArticleId = SequenceNextval($"{TABLE}_seq");
				this.ArticleUid = Guid.NewGuid().ToString("N");
				result = ExecuteCommand($"insert into {TABLE} ({COLUMNS}) values (:aid, :number, :color, :name, :description, :price, :highlight, :inventory, :acatid, :auid, :hide, :brand)",
						new KeyValuePair<string, object>("aid", this.ArticleId.Value),
						new KeyValuePair<string, object>("number", String.IsNullOrEmpty(this.Number) ? DBNull.Value : this.Number),
                        new KeyValuePair<string, object>("color", Color.HasValue ? (int)this.Color : DBNull.Value),
                        new KeyValuePair<string, object>("name", String.IsNullOrEmpty(this.Name) ? DBNull.Value : this.Name),
						new KeyValuePair<string, object>("description", String.IsNullOrEmpty(this.Description) ? DBNull.Value : this.Description),
                        new KeyValuePair<string, object>("price", this.Price.HasValue ? this.Price.Value : DBNull.Value),
                        new KeyValuePair<string, object>("highlight", this.Highlight),
                        new KeyValuePair<string, object>("inventory", this.Inventory.HasValue ? this.Inventory.Value : DBNull.Value),
                        new KeyValuePair<string, object>("acatid", this.A_CategoryId.HasValue ? this.A_CategoryId.Value : DBNull.Value),
                        new KeyValuePair<string, object>("hide", this.Hide),
					    new KeyValuePair<string, object>("brand", Brand.HasValue ? (int)this.Brand : DBNull.Value),
                        new KeyValuePair<string, object>("auid", String.IsNullOrEmpty(this.ArticleUid) ? DBNull.Value : this.ArticleUid));

			}
            else
			{
				result = ExecuteCommand($"update {TABLE} set number = :number, color = :color, name = :name, description = :description, price = :price, highlight = :highlight, inventory = :inventory,  a_category_id = :acatid, article_uid = :auid, hide = :hide, brand = :brand where article_id = :aid",
						new KeyValuePair<string, object>("aid", this.ArticleId.Value),
						new KeyValuePair<string, object>("number", String.IsNullOrEmpty(this.Number) ? DBNull.Value : this.Number),
						new KeyValuePair<string, object>("color", Color.HasValue ? (int)this.Color : DBNull.Value),
						new KeyValuePair<string, object>("name", String.IsNullOrEmpty(this.Name) ? DBNull.Value : this.Name),
						new KeyValuePair<string, object>("description", String.IsNullOrEmpty(this.Description) ? DBNull.Value : this.Description),
						new KeyValuePair<string, object>("price", this.Price.HasValue ? this.Price.Value : DBNull.Value),
                        new KeyValuePair<string, object>("highlight", this.Highlight),
                        new KeyValuePair<string, object>("inventory", this.Inventory.HasValue ? this.Inventory.Value : DBNull.Value),
						new KeyValuePair<string, object>("acatid", this.A_CategoryId.HasValue ? this.A_CategoryId.Value : DBNull.Value),
                        new KeyValuePair<string, object>("hide", this.Hide),
						new KeyValuePair<string, object>("brand", Brand.HasValue ? (int)this.Brand : DBNull.Value),
                        new KeyValuePair<string, object>("auid", String.IsNullOrEmpty(this.ArticleUid) ? DBNull.Value : this.ArticleUid));

			}
            return result;

		}

		public int Delete() => this.ArticleId.HasValue
			? ExecuteCommand($"delete from {TABLE} where article_id = :aid", new KeyValuePair<string, object>("aid", this.ArticleId))
			: 0;

		public static void ReduceInventory(int articleId, int amount)
		{
			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();
			//Inventar um die bestellte Menge reduzieren
			cmd.CommandText = $"update {TABLE} set inventory = inventory - :amount where article_id = :id";
			cmd.Parameters.AddWithValue("amount", amount);
			cmd.Parameters.AddWithValue("id", articleId);
			cmd.ExecuteNonQuery();
			connection.Close();
		}

		#endregion
	}
}
