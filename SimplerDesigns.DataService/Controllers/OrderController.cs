using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SimplerDesigns.DataService;
using UserEntity = SimplerDesigns.DataService.User;

namespace SimplerDesigns.DataService.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class OrderController : ControllerBase
	{

		[HttpGet("accounting")]
		public IActionResult GetAccounting([FromQuery] int year, [FromQuery] int? month = null)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else result = Ok(Order.GetAccounting(year, month));
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

		[HttpGet()]
		public IActionResult Select()
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else result = Ok(Order.GetList());
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

		[HttpGet("byuser/{userId:int}")]
		public IActionResult SelectByUser(int userId, [FromQuery] int limit = 10)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else result = Ok(Order.GetByUser(userId, limit));
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

		[HttpGet("{ordId:int}")]
		public IActionResult SelectOrder(int ordId)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else
				{
					Order order = Order.Get(ordId);
                    result = Ok(order);
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

        [HttpPost()]
		public IActionResult Insert([FromBody] Order order)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else
				{
					if (order.Save() == 1)
					{
						// Lagerbestand für bestellte Artikel reduzieren
						if (!string.IsNullOrEmpty(order.Articles))
						{
							var items = System.Text.Json.JsonSerializer.Deserialize<List<CartItem>>(order.Articles, CartItem.JsonOptions) ?? new List<CartItem>();
							foreach (var item in items)
							{
								Article.ReduceInventory(item.ArticleId, 1);
							}
						}
						result = Ok(new ActionResult(true, "ok"));
					}
					else result = Ok(new ActionResult(false, "Keine Daten gespeichert!"));
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

		[HttpPut("{id}")]
		public IActionResult Update(int id, [FromBody] Order order)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else
				{
					Order dbOrder = Order.Get(id);
					if (dbOrder == null) result = NotFound();
					else
					{
						if (order.Save() == 1) result = Ok(new ActionResult(true, "ok"));
						else result = Ok(new ActionResult(false, "Keine Daten gespeichert!"));
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
		public IActionResult Delete(int id)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else
				{
					Order dbOrder = Order.Get(id);
					if (dbOrder == null) result = NotFound();
					else
					{
						if (dbOrder.Delete() == 1) result = Ok(new ActionResult(true, "ok"));
						else result = Ok(new ActionResult(false, "Keine Daten gelöscht"));
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


		//Hilfsmethode: Prüft, ob ein User mit ausreichender Rolle angemeldet ist (über Cookie) und gibt diesen zurück oder null, wenn kein Zugriff
		private User? CheckUser(UserRole role)
		{
			User user = null;
			if (!String.IsNullOrEmpty(this.Request.Cookies["lagerverwaltunglogincode"])) user = UserEntity.Get(this.Request.Cookies["lagerverwaltunglogincode"], UserField.LoginCode);
			if (user == null) return null;
			if (!user.Role.HasValue && role == UserRole.Standard) return user;
			if (user.Role.HasValue && user.Role >= role) return user;
			return null;
		}

	}

	class CartItem
	{
		public static readonly System.Text.Json.JsonSerializerOptions JsonOptions = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };

		public int ArticleId { get; set; }
	}
}
