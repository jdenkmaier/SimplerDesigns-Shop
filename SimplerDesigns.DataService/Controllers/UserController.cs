using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data.Common;
using SimplerDesigns.DataService.DTO;
using SimplerDesigns.DataService;
using UserEntity = SimplerDesigns.DataService.User;

namespace SimplerDesigns.DataService.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class UserController : ControllerBase
	{

		[HttpGet()]
		public IActionResult Select()
		{
			IActionResult result = null;
			try
			{
				if (CheckBenutzer(UserRole.Admin) == null) result = Unauthorized(); 
				else result = Ok(UserEntity.GetList());
			}
			catch (Exception ex)
			{
#if DEBUG
				result = StatusCode(500, ex.Message);
#else
				result = StatusCode(500);
#endif
			}
			return result;
		}

		// POST -> zum anlegen eines neuen Objekts
		[HttpPost()]
		public IActionResult Insert([FromBody] UserEntity user)
		{
			IActionResult result = null;
			try
			{
				if (CheckBenutzer(UserRole.Admin) == null) result = Unauthorized();
				else
				{
					if (user.Save() == 1) result = Ok(new ActionResult(true, "Daten erfolgreich gespeichert"));
					else result = Ok(new ActionResult(false, "Daten nicht gespeichert"));
				}
			}
			catch (Exception ex)
			{
#if DEBUG
				result = StatusCode(500, ex.Message);
#else
				result = StatusCode(500);
#endif
			}
			return result;

		}

		// PUT -> ändern eines vorhandenen Objekts, daher muß die ID in der url mitgegeben werden um das Objekt aus der DB auszulesen!
		[HttpPut("{id}")]
		public IActionResult Update(string id, [FromBody] UserEntity user)
		{
			IActionResult result = null;
			try
			{
				if (CheckBenutzer(UserRole.Admin) == null) result = Unauthorized();
				else
				{
					UserEntity dbUser = UserEntity.Get(id, UserField.Id);
					if (dbUser == null) result = NotFound();
					else
					{
						dbUser.Name = user.Name;
						dbUser.Surname = user.Surname;
						dbUser.LoginName = user.LoginName;
						dbUser.Number = user.Number;
						dbUser.JoinDate = user.JoinDate;
						dbUser.Role = user.Role;
						dbUser.Mail = user.Mail;
                        dbUser.DeliveryAdress = user.DeliveryAdress;

                        if (dbUser.Save() == 1) result = Ok(new ActionResult(true, "Daten erfolgreich gespeichert"));
						else result = Ok(new ActionResult(false, "Daten nicht gespeichert"));
					}
				}
			}
			catch (Exception ex)
			{
#if DEBUG
				result = StatusCode(500, ex.Message);
#else
				result = StatusCode(500);
#endif
			}
			return result;

		}

		[HttpDelete("{id}")]
		public IActionResult Delete(string id)
		{
			IActionResult result = null;
			try
			{
				if (CheckBenutzer(UserRole.Admin) == null) result = Unauthorized();
				else
				{
					UserEntity dbUser = UserEntity.Get(id, UserField.Id);
					if (dbUser == null) result = NotFound();
					else
					{
						if (dbUser.Delete() == 1) result = Ok(new ActionResult(true, "Daten erfolgreich gelöscht"));
						else result = Ok(new ActionResult(false, "Daten nicht gelöscht"));
					}
				}
			}
			catch (Exception ex)
			{
#if DEBUG
				result = StatusCode(500, ex.Message);
#else
				result = StatusCode(500);
#endif
			}
			return result;
		}

		// Profil bearbeiten (eingeloggter Kunde)
		[HttpPost("edit")]
		public IActionResult Edit([FromBody] EditProfileData data)
		{
			IActionResult result = null;
			try
			{
				UserEntity dbUser = CheckBenutzer(UserRole.Customer);
				if (dbUser == null) return Unauthorized();

				dbUser.Name          = data.Name;
				dbUser.Surname       = data.Surname;
				dbUser.Mail          = data.Mail;
				dbUser.LoginName     = data.LoginName;
				dbUser.Adress        = data.Adress;
				dbUser.City          = data.City;
				dbUser.Country       = data.Country;
				dbUser.Newsletter    = data.Newsletter;
				dbUser.DeliveryAdress = data.DeliveryAdress;

				// Passwort nur aktualisieren wenn eines mitgeschickt wurde
				if (!string.IsNullOrWhiteSpace(data.Password))
					dbUser.Password = dbUser.PwdHash(data.Password);

				if (dbUser.Save() == 1) result = Ok(new ActionResult(true, "Daten erfolgreich gespeichert."));
				else result = Ok(new ActionResult(false, "Daten nicht gespeichert."));
			}
			catch (Exception ex)
			{
#if DEBUG
				result = StatusCode(500, ex.Message);
#else
				result = StatusCode(500);
#endif
			}
			return result;
		}

		// Registrierung für Kunden
		[HttpPost("register")]
		public IActionResult Register([FromBody] RegisterData data)
		{
			IActionResult result = null;
			try
			{
				if (string.IsNullOrWhiteSpace(data.LoginName) || string.IsNullOrWhiteSpace(data.Password))
					return Ok(new ActionResult(false, "Nutzername und Passwort sind Pflichtfelder."));

				if (UserEntity.Get(data.LoginName, UserField.LoginName) != null)
					return Ok(new ActionResult(false, "Nutzername bereits vergeben.") { errorCode = 3 });

				UserEntity user = new UserEntity();
				user.Name          = data.Name;
				user.Surname       = data.Surname;
				user.Mail          = data.Mail;
				user.LoginName     = data.LoginName;
				user.Adress        = data.Adress;
				user.City          = data.City;
				user.Country       = data.Country;
				user.Newsletter    = data.Newsletter;
				user.DeliveryAdress = data.DeliveryAdress;
				user.Role          = UserRole.Customer;
				user.Password      = user.PwdHash(data.Password);

				if (user.Save() == 1) result = Ok(new ActionResult(true, "Registrierung erfolgreich."));
				else result = Ok(new ActionResult(false, "Registrierung fehlgeschlagen."));
			}
			catch (Exception ex)
			{
#if DEBUG
				result = StatusCode(500, ex.Message);
#else
				result = StatusCode(500);
#endif
			}
			return result;
		}

		// neue route für login
		// http://localhost:8080/User/login
		[HttpPost("login")]
		public IActionResult UserLogin([FromBody] LoginData loginData)
		{
			IActionResult result = null;
			try
			{
				UserEntity loginUser = UserEntity.Get(loginData.LoginName, UserField.LoginName);

				if (loginUser == null) result = Ok(new ActionResult(false, "LoginName/Passwort nicht gefunden!") { errorCode = 1 });
				else
				{
					if (String.IsNullOrEmpty(loginUser.Password))
					{
						result = Ok(new ActionResult(false, "Passwort festlegen") { data = loginUser, errorCode = 2 });
					}
					else if (loginUser.Password == loginUser.PwdHash(loginData.Password))
					{
						loginUser.LastLogin = DateTime.Now;
						loginUser.LoginCode = Guid.NewGuid().ToString("N");
						loginUser.Save();

						this.Response.Cookies.Append("lagerverwaltunglogincode", loginUser.LoginCode, new CookieOptions()
						{
							Expires = DateTimeOffset.Now.AddHours(1),
							SameSite = this.Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
							Secure = this.Request.IsHttps,
							HttpOnly = false,
							Path = "/"
						});
						result = Ok(new ActionResult(true, "ok") { data = loginUser });
					}
					else result = Ok(new ActionResult(false, "LoginName/Passwort nicht gefunden.") { errorCode = 1 });
				}
			}
			catch (Exception ex)
			{
#if DEBUG
				result = StatusCode(500, ex.Message);
#else
				result = StatusCode(500);
#endif
			}
			return result;
		}


		[HttpPost("pwd")]
		public IActionResult UserPwd([FromBody] UserPwd userPwd)
		{
			if (CheckBenutzer(UserRole.Admin) == null) return Unauthorized();

			else
			{
				IActionResult result = null;
				try
				{
					UserEntity user = UserEntity.Get(userPwd.UserUid, UserField.Id);
					if (user == null) result = NotFound();
					else
					{
						if (String.IsNullOrEmpty(userPwd.Password))
						{
							user.Password = string.Empty;
						}
						else user.Password = user.PwdHash(userPwd.Password);
						if (user.Save() == 1) result = Ok(new ActionResult(true, "ok"));
						else result = Ok(new ActionResult(false, "Daten nicht gespeichert!"));
					}
				}

                catch (Exception ex)
                {
#if DEBUG
                    result = StatusCode(500, ex.Message);
#else
				result = StatusCode(500);
#endif
                }

                return result;
            }
		}



		private UserEntity CheckBenutzer(UserRole role)
		{
			UserEntity user = null;
			if (!String.IsNullOrEmpty(this.Request.Cookies["lagerverwaltunglogincode"])) user = UserEntity.Get(this.Request.Cookies["lagerverwaltunglogincode"], UserField.LoginCode);

			if (user == null) return null;
			if (!user.Role.HasValue && role == UserRole.Standard) return user;
			if (user.Role.HasValue && user.Role >= role) return user;
			return null;
		}



	}
}
