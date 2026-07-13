using Npgsql;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using SimplerDesigns.DataService;

namespace SimplerDesigns.DataService
{
	public enum UserRole
	{
		Standard = 0,
		Admin = 1,
		Customer = 5,
		Editor = 10
	}

	public enum UserField
	{
		Id,
		LoginName,
		LoginCode
	}


	public class User : DataObject
	{
		//===========================================================================================================
		#region private things

		private const string TABLE = "data.user";
		private const string COLUMNS = "user_id, user_number, join_date, newsletter, role, country, adress, city, login_name, password, e_mail, name, surname, last_login, login_code, delivery_adress";
		#endregion

		//===========================================================================================================
		#region static methods
		public static List<User> GetList()
		{
			List<User> list = new();

			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();

            Console.WriteLine(connection.Database);

            NpgsqlCommand cmd = connection.CreateCommand();
			cmd.CommandText = $"select {COLUMNS} from {TABLE} order by surname, name";
			NpgsqlDataReader reader = cmd.ExecuteReader();
			while (reader.Read())	list.Add(new User(reader));
			reader.Close();
			connection.Close();

			return list;
		}

		public static User Get(string value, UserField feld)
		{
            User user = null;
			NpgsqlConnection connection = DataConnection.GetConnection();
			connection.Open();
			NpgsqlCommand cmd = connection.CreateCommand();

			switch (feld)
			{
				case UserField.Id:
					cmd.CommandText = $"select {COLUMNS} from {TABLE} where user_id = :puid";
					cmd.Parameters.AddWithValue("puid", int.Parse(value));
					break;
				case UserField.LoginName:
					cmd.CommandText = $"select {COLUMNS} from {TABLE} where lower(login_name) = :ln";
					cmd.Parameters.AddWithValue("ln", value.ToLower());
					break;
				case UserField.LoginCode:
					cmd.CommandText = $"select {COLUMNS} from {TABLE} where login_code = :ln";
					cmd.Parameters.AddWithValue("ln", value);
					break;
				default:
					break;
			}

			NpgsqlDataReader reader = cmd.ExecuteReader();
			if (reader.Read()) user = new User(reader);	
			reader.Close();
			connection.Close();
			return user;
		}

		// Beispiel: durch SQL String Interpolation ist SQL Injection Angriff möglich!!!!
		//public static bool Get(string loginName, string passwort)
		//{
		//	bool result = false;
		//	NpgsqlConnection connection = DataConnection.GetConnection();
		//	connection.Open();
		//	NpgsqlCommand cmd = connection.CreateCommand();
		//	cmd.CommandText = $"select count(*) from {TABLE} where lower(login_name) = '{loginName.ToLower()}' and passwort = '{passwort}'";
		//	if ((long)cmd.ExecuteScalar() > 0) result = true;
		//	connection.Close();
		//	return result;

		//}


		#endregion

		//===========================================================================================================
		#region constructors
		public User() : base()
		{
				
		}

		public User(NpgsqlDataReader reader) : base()
		{
			this.UserId = reader.GetInt32(0);
			this.Number = reader.IsDBNull(1) ? null : reader.GetInt32(1);
			this.JoinDate = reader.IsDBNull(2) ? null : reader.GetDateTime(2);
			this.Newsletter = reader.GetBoolean(3);
			this.Role = reader.IsDBNull(4) ? null : (UserRole)reader.GetInt32(4);
			this.Country = reader.IsDBNull(5) ? string.Empty : reader.GetString(5);
			this.Adress = reader.IsDBNull(6) ? string.Empty : reader.GetString(6);
			this.City = reader.IsDBNull(7) ? string.Empty : reader.GetString(7);
            this.LoginName = reader.IsDBNull(8) ? string.Empty : reader.GetString(8);
            this.Password = reader.IsDBNull(9) ? string.Empty : reader.GetString(9);
            this.Mail = reader.IsDBNull(10) ? string.Empty : reader.GetString(10);
            this.Name = reader.IsDBNull(11) ? string.Empty : reader.GetString(11);
            this.Surname = reader.IsDBNull(12) ? string.Empty : reader.GetString(12);
            this.LastLogin = reader.IsDBNull(13) ? null : reader.GetDateTime(13);
            this.LoginCode = reader.IsDBNull(14) ? string.Empty : reader.GetString(14);
            this.DeliveryAdress = reader.IsDBNull(15) ? null : reader.GetString(15);

        }

        #endregion

        //===========================================================================================================
        #region properties
        public int? UserId { get; set; }
		public int? Number { get; set; }
		public DateTime? JoinDate { get; set; }
        public bool Newsletter { get; set; }
        public UserRole? Role { get; set; }
        public string? Country { get; set; }
		public string? Adress { get; set; }
		public string? City { get; set; }
        public string LoginName { get; set; }
        public string Mail { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public DateTime? LastLogin { get; set; }

        public string? DeliveryAdress { get; set; }



        [JsonIgnore()]
		public string? Password { get; set; }
		[JsonIgnore()]
		public string? LoginCode { get; set; }
		//[JsonIgnore()]
		//public DateTime? LoginCodeValidUntil { get; set; }

		#endregion

		//===========================================================================================================
		#region public methods

		public int Save()
		{
			int result = 0;
			if (!this.UserId.HasValue)
			{
				this.UserId = SequenceNextval($"{TABLE}_seq");
				this.Number = SequenceNextval($"{TABLE}_number_seq");

                if (!this.LastLogin.HasValue)
                {
                    this.LastLogin = DateTime.Now;
                }

                if (!this.JoinDate.HasValue)
                {
                    this.JoinDate = DateTime.Now;
                }

                result = ExecuteCommand($"insert into {TABLE} ({COLUMNS}) values (:uid, :usernumber, :joindate, :newsletter, :role, :country, :adress, :city, :loginname, :password, :email, :name, :surname, :lastlogin, :login_code, :delivery_adress::json)",
						new KeyValuePair<string, object>("uid", this.UserId.Value),
						new KeyValuePair<string, object>("usernumber", this.Number.HasValue ? this.Number.Value : DBNull.Value),
                        new KeyValuePair<string, object>("joindate", JoinDate.HasValue ? this.JoinDate.Value : DBNull.Value),
                        new KeyValuePair<string, object>("newsletter", this.Newsletter),
						new KeyValuePair<string, object>("role", Role.HasValue ? (int)this.Role : DBNull.Value),
						new KeyValuePair<string, object>("country", String.IsNullOrEmpty(this.Country) ? DBNull.Value : this.Country),
                        new KeyValuePair<string, object>("adress", String.IsNullOrEmpty(this.Adress) ? DBNull.Value : this.Adress),
                        new KeyValuePair<string, object>("city", String.IsNullOrEmpty(this.City) ? DBNull.Value : this.City),
                        new KeyValuePair<string, object>("loginname", String.IsNullOrEmpty(this.LoginName) ? DBNull.Value : this.LoginName),
                        new KeyValuePair<string, object>("password", String.IsNullOrEmpty(this.Password) ? DBNull.Value : this.Password),
                        new KeyValuePair<string, object>("email", String.IsNullOrEmpty(this.Mail) ? DBNull.Value : this.Mail),
                        new KeyValuePair<string, object>("name", String.IsNullOrEmpty(this.Name) ? DBNull.Value : this.Name),
                        new KeyValuePair<string, object>("surname", String.IsNullOrEmpty(this.Surname) ? DBNull.Value : this.Surname),
                        new KeyValuePair<string, object>("lastlogin", LastLogin.HasValue ? this.LastLogin.Value : DBNull.Value),
						new KeyValuePair<string, object>("login_code", String.IsNullOrEmpty(this.LoginCode) ? DBNull.Value : this.LoginCode),
                        new KeyValuePair<string, object>("delivery_adress", String.IsNullOrEmpty(this.DeliveryAdress) ? DBNull.Value : this.DeliveryAdress)

                        //, new KeyValuePair<string, object>("lcvu", this.LoginCodeValidUntil.HasValue ? this.LoginCodeValidUntil.Value : DBNull.Value)
                        );
			}
			else
			{
result = ExecuteCommand($"update {TABLE} set user_number = :usernumber, join_date = :joindate, newsletter = :newsletter, role = :role, country = :country, adress = :adress, city = :city, login_name = :loginname, password = :password, e_mail = :email, name = :name, surname = :surname, last_login = :lastlogin, login_code = :login_code, delivery_adress = :delivery_adress::json where user_id = :uid",
                        new KeyValuePair<string, object>("uid", this.UserId.Value),
                        new KeyValuePair<string, object>("usernumber", this.Number.HasValue ? this.Number.Value : DBNull.Value),
                        new KeyValuePair<string, object>("joindate", JoinDate.HasValue ? this.JoinDate.Value : DBNull.Value),
                        new KeyValuePair<string, object>("newsletter", this.Newsletter),
                        new KeyValuePair<string, object>("role", Role.HasValue ? (int)this.Role : DBNull.Value),
                        new KeyValuePair<string, object>("country", String.IsNullOrEmpty(this.Country) ? DBNull.Value : this.Country),
                        new KeyValuePair<string, object>("adress", String.IsNullOrEmpty(this.Adress) ? DBNull.Value : this.Adress),
                        new KeyValuePair<string, object>("city", String.IsNullOrEmpty(this.City) ? DBNull.Value : this.City),
                        new KeyValuePair<string, object>("loginname", String.IsNullOrEmpty(this.LoginName) ? DBNull.Value : this.LoginName),
                        new KeyValuePair<string, object>("password", String.IsNullOrEmpty(this.Password) ? DBNull.Value : this.Password),
                        new KeyValuePair<string, object>("email", String.IsNullOrEmpty(this.Mail) ? DBNull.Value : this.Mail),
                        new KeyValuePair<string, object>("name", String.IsNullOrEmpty(this.Name) ? DBNull.Value : this.Name),
                        new KeyValuePair<string, object>("surname", String.IsNullOrEmpty(this.Surname) ? DBNull.Value : this.Surname),
                        new KeyValuePair<string, object>("lastlogin", LastLogin.HasValue ? this.LastLogin.Value : DBNull.Value),
                        new KeyValuePair<string, object>("login_code", String.IsNullOrEmpty(this.LoginCode) ? DBNull.Value : this.LoginCode),
                        new KeyValuePair<string, object>("delivery_adress", String.IsNullOrEmpty(this.DeliveryAdress) ? DBNull.Value : this.DeliveryAdress)

                        //, new KeyValuePair<string, object>("lcvu", this.LoginCodeValidUntil.HasValue ? this.LoginCodeValidUntil.Value : DBNull.Value)
                        );
            }
            return result;

		}

		public int Delete() => this.UserId.HasValue
			? ExecuteCommand($"delete from {TABLE} where user_id = :uid", new KeyValuePair<string, object>("uid", this.UserId))
			: 0;

		public string PwdHash(string pwd)
		{
			SHA512 sHA = SHA512.Create();
			return Convert.ToBase64String(sHA.ComputeHash(Encoding.UTF8.GetBytes(pwd)));
		}
		#endregion
	}
}
