using Npgsql;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Text;
using SimplerDesigns.DataService;
using System.Text.Json.Serialization;

namespace SimplerDesigns.DataService
{

    public class ArticleOverview : DataObject
	{
		//===========================================================================================================
		#region private things

		private const string TABLE = "data.article";

        #endregion

        //===========================================================================================================
        #region static methods


        public static List<ArticleOverview> GetOverview(int catId)
        {
            var list = new List<ArticleOverview>();
            using var connection = DataConnection.GetConnection();
            connection.Open();
            using var cmd = connection.CreateCommand();

            cmd.CommandText = $"select a.article_id, color, a.name, price, highlight, inventory, a.a_category_id, hide, brand, content, media_type from {TABLE} a " +
                $"inner join data.category c on c.category_id = a.a_category_id " +
                $"left join data.file f on f.article_id = a.article_id " +
                $"where (a.a_category_id = :id or c.category_ref_id = :id) and f.thumbnail IS TRUE " +
                $"order by a.name;";

            cmd.Parameters.AddWithValue("id", catId);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new ArticleOverview(reader));
            }

            return list;
        }

        #endregion

        //===========================================================================================================

        #region constructors
        public ArticleOverview() : base()
        {

        }

        public ArticleOverview(NpgsqlDataReader reader) : base()
        {
            this.ArticleId = reader.IsDBNull(0) ? null : Convert.ToInt32(reader.GetDecimal(0));
            this.Color = reader.IsDBNull(1) ? null : (ArticleColor?)Convert.ToInt32(reader.GetDecimal(1));
            this.Name = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
            this.Price = reader.IsDBNull(3) ? null : Convert.ToDouble(reader.GetDecimal(3));
            this.Highlight = reader.IsDBNull(4) ? false : reader.GetBoolean(4);
            this.Inventory = reader.IsDBNull(5) ? null : Convert.ToInt32(reader.GetDecimal(5));
            this.A_CategoryId = reader.IsDBNull(6) ? null : Convert.ToInt32(reader.GetDecimal(6));
            this.Hide = reader.IsDBNull(7) ? false : reader.GetBoolean(7);
            this.Brand = reader.IsDBNull(8) ? null : (ArticleBrand?)Convert.ToInt32(reader.GetDecimal(8));
            this.Content = reader.IsDBNull(9) ? null : (byte[])reader.GetValue(9);
            this.MediaType = reader.IsDBNull(10) ? string.Empty : reader.GetString(10);
        }

        #endregion

        //===========================================================================================================
        #region properties
        public int? ArticleId { get; set; }
        public ArticleColor? Color { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
		public double? Price { get; set; }
		public bool Highlight { get; set; }
        public int? Inventory { get; set; }
        public int? A_CategoryId { get; set; }
        public bool Hide { get; set; }
        public ArticleBrand? Brand { get; set; }

        public string MediaType { get; set; }

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
	}
}
