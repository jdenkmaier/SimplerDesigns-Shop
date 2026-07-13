using Npgsql;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Text;
using SimplerDesigns.DataService;

namespace SimplerDesigns.DataService
{
    public enum OrderStatus
    {
        Neu = 0,
        Bezahlt = 10,
        Bearbeitung = 20,
        Versandbereit = 30,
        Versendet = 40,
        Zugestellt = 50,
        Abgeschlossen = 60,
        Storniert = 70,
        Abgebrochen = 80,
        Retoure = 90,
        Erstattet = 99
    }

    public class Order : DataObject
    {
        //===========================================================================================================
        #region private things

        // "order" ist ein reserviertes Wort in PostgreSQL → muss gequotet werden
        private const string TABLE = @"data.""order""";
        private const string COLUMNS = "order_id, order_number, order_time, o_user_id, price_articles, articles, price_shipping, status, paymethod";

        #endregion

        //===========================================================================================================
        #region static methods

        public static List<Order> GetList()
        {
            List<Order> list = new();

            NpgsqlConnection connection = DataConnection.GetConnection();
            connection.Open();
            NpgsqlCommand cmd = connection.CreateCommand();
            cmd.CommandText = $@"select {COLUMNS}, u.name || ' ' || u.surname as customer_name from {TABLE} o left join data.""user"" u on u.user_id = o.o_user_id order by order_time desc";
            NpgsqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read()) list.Add(new Order(reader));
            reader.Close();
            connection.Close();

            return list;
        }

        public static AccountingSummary GetAccounting(int year, int? month)
        {
            string monthFilter = month.HasValue ? " AND EXTRACT(MONTH FROM order_time) = :month" : "";

            NpgsqlConnection connection = DataConnection.GetConnection();
            connection.Open();
            NpgsqlCommand cmd = connection.CreateCommand();

            //Alle Bestellungen & Einnahmen eines Jahres / Monats, je nach Status gefiltert
            cmd.CommandText = $@"
                SELECT EXTRACT(MONTH FROM order_time) AS monat,
                       SUM(price_articles + price_shipping) AS einnahmen,
                       COUNT(*) AS anzahl
                FROM {TABLE}
                WHERE status NOT IN (70, 80, 90, 99)
                  AND EXTRACT(YEAR FROM order_time) = :year
                  {monthFilter}
                GROUP BY monat
                ORDER BY monat";

            cmd.Parameters.AddWithValue("year", year);
            if (month.HasValue) cmd.Parameters.AddWithValue("month", month.Value);

            var summary = new AccountingSummary { Year = year, Month = month };

            NpgsqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var entry = new AccountingEntry
                {
                    Month      = Convert.ToInt32(reader.GetDouble(0)),
                    Revenue    = reader.IsDBNull(1) ? 0 : Convert.ToDouble(reader.GetDecimal(1)),
                    OrderCount = Convert.ToInt32(reader.GetInt64(2))
                };
                summary.Entries.Add(entry);
                summary.TotalRevenue += entry.Revenue;
                summary.TotalOrders  += entry.OrderCount;
            }
            reader.Close();
            connection.Close();

            return summary;
        }

        public static Order Get(int id)
        {
            Order order = null;
            NpgsqlConnection connection = DataConnection.GetConnection();
            connection.Open();
            NpgsqlCommand cmd = connection.CreateCommand();
            cmd.CommandText = $@"select {COLUMNS}, u.name || ' ' || u.surname as customer_name from {TABLE} o left join data.""user"" u on u.user_id = o.o_user_id  where order_id = :id";

            cmd.Parameters.AddWithValue("id", id);
            NpgsqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read()) order = new Order(reader);
            reader.Close();
            connection.Close();
            return order;
        }

        public static List<Order> GetByUser(int userId, int limit = 10)
        {
            List<Order> list = [];
            NpgsqlConnection connection = DataConnection.GetConnection();
            connection.Open();
            NpgsqlCommand cmd = connection.CreateCommand();
            string limitClause = limit > 0 ? "limit :lim" : "";
            cmd.CommandText = $@"select {COLUMNS}, u.name || ' ' || u.surname as customer_name from {TABLE} o left join data.""user"" u on u.user_id = o.o_user_id where o.o_user_id = :uid order by order_time desc {limitClause}";
            cmd.Parameters.AddWithValue("uid", userId);
            //wenn Limit -> wird als Parameter übergeben, sonst kein Limit-Parameter hinzufügen, da er sonst zu einem Fehler führt
            if (limit > 0) cmd.Parameters.AddWithValue("lim", limit);
            NpgsqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read()) list.Add(new Order(reader));
            reader.Close();
            connection.Close();
            return list;
        }

        #endregion

        //===========================================================================================================
        #region constructors

        public Order() : base() { }

        public Order(NpgsqlDataReader reader) : base()
        {
            this.OrderId       = reader.IsDBNull(0) ? null : Convert.ToInt32(reader.GetDecimal(0));
            this.OrderNumber   = reader.IsDBNull(1) ? null : reader.GetString(1);
            this.OrderTime     = reader.IsDBNull(2) ? null : reader.GetDateTime(2);
            this.OUserId       = reader.IsDBNull(3) ? null : reader.GetInt32(3);
            this.PriceArticles = reader.IsDBNull(4) ? null : Convert.ToDouble(reader.GetDecimal(4));
            this.Articles      = reader.IsDBNull(5) ? null : reader.GetString(5);
            this.PriceShipping = reader.IsDBNull(6) ? null : Convert.ToDouble(reader.GetDecimal(6));
            this.Status        = reader.IsDBNull(7) ? null : (OrderStatus?)Convert.ToInt32(reader.GetDecimal(7));
            this.Paymethod     = reader.IsDBNull(8) ? null : reader.GetString(8);

            this.CustomerName = reader.IsDBNull(9) ? null : reader.GetString(9);
        }

        #endregion

        //===========================================================================================================
        #region properties

        public int? OrderId { get; set; }
        public string? OrderNumber { get; set; }
        public DateTime? OrderTime { get; set; }
        public int? OUserId { get; set; }
        public double? PriceArticles { get; set; }
        public string Articles { get; set; }
        public double? PriceShipping { get; set; }
        public OrderStatus? Status { get; set; }
        public string Paymethod { get; set; }

        public string? CustomerName { get; set; }

        #endregion

        //===========================================================================================================
        #region public methods

        public int Save()
        {
            int result = 0;

            if (!this.OrderId.HasValue)
            {
                this.OrderId = SequenceNextval($"data.order_seq");
                this.OrderTime ??= DateTime.UtcNow;
                this.OrderNumber = $"ORD-{this.OrderId.Value:D4}-{this.OrderTime.Value:ddMMyy}";

                result = ExecuteCommand(
                    $"insert into {TABLE} ({COLUMNS}) values (:oid, :onumber, :otime, :ouid, :particles, cast(:articles as json), :pshipping, :status, :paymethod)",
                    new KeyValuePair<string, object>("oid",       this.OrderId.Value),
                    new KeyValuePair<string, object>("onumber",   (object?)this.OrderNumber  ?? DBNull.Value),
                    new KeyValuePair<string, object>("otime",     this.OrderTime.Value),
                    new KeyValuePair<string, object>("ouid",      this.OUserId.HasValue       ? (object)this.OUserId.Value       : DBNull.Value),
                    new KeyValuePair<string, object>("particles", this.PriceArticles.HasValue ? (object)this.PriceArticles.Value : DBNull.Value),
                    new KeyValuePair<string, object>("articles",  (object)this.Articles       ?? DBNull.Value),
                    new KeyValuePair<string, object>("pshipping", this.PriceShipping.HasValue ? (object)this.PriceShipping.Value : DBNull.Value),
                    new KeyValuePair<string, object>("status",    this.Status.HasValue        ? (object)(int)this.Status.Value   : DBNull.Value),
                    new KeyValuePair<string, object>("paymethod", (object)this.Paymethod      ?? DBNull.Value)
                );
            }
            else
            {
                result = ExecuteCommand(
                    $"update {TABLE} set order_number = :onumber, o_user_id = :ouid, price_articles = :particles, articles = cast(:articles as json), price_shipping = :pshipping, status = :status, paymethod = :paymethod where order_id = :oid",
                    new KeyValuePair<string, object>("oid",       this.OrderId.Value),
                    new KeyValuePair<string, object>("onumber",   (object?)this.OrderNumber  ?? DBNull.Value),
                    new KeyValuePair<string, object>("ouid",      this.OUserId.HasValue       ? (object)this.OUserId.Value       : DBNull.Value),
                    new KeyValuePair<string, object>("particles", this.PriceArticles.HasValue ? (object)this.PriceArticles.Value : DBNull.Value),
                    new KeyValuePair<string, object>("articles",  (object)this.Articles       ?? DBNull.Value),
                    new KeyValuePair<string, object>("pshipping", this.PriceShipping.HasValue ? (object)this.PriceShipping.Value : DBNull.Value),
                    new KeyValuePair<string, object>("status",    this.Status.HasValue        ? (object)(int)this.Status.Value   : DBNull.Value),
                    new KeyValuePair<string, object>("paymethod", (object)this.Paymethod      ?? DBNull.Value)
                );
            }

            return result;
        }

        public int Delete() => this.OrderId.HasValue
            ? ExecuteCommand($"delete from {TABLE} where order_id = :oid", new KeyValuePair<string, object>("oid", this.OrderId))
            : 0;

        #endregion
    }
}
