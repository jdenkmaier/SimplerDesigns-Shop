using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SimplerDesigns.DataService;
using UserEntity = SimplerDesigns.DataService.User;

namespace SimplerDesigns.DataService.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class CategoryController : ControllerBase
	{

		[HttpGet()]
		public IActionResult Select()
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else result = Ok(Category.GetList());
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

		[HttpGet("{catId}/article")]
		public IActionResult SelectArticle(int catId)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else
				{
					Category category = Category.Get(catId);
                    result = Ok(Article.GetListByCategoryOrSubcategory(category));
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
		public IActionResult Insert([FromBody] Category category)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else
				{
					if (category.Save() == 1) result = Ok(new ActionResult(true, "ok"));
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
		public IActionResult Update(int id, [FromBody] Category category)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else
				{
					Category dbCategory = Category.Get(id);
					if (dbCategory == null) result = NotFound();
					else
					{
						if (category.Save() == 1) result = Ok(new ActionResult(true, "ok"));
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
					Category dbCategory = Category.Get(id);
					if (dbCategory == null) result = NotFound();
					else
					{
						if (dbCategory.Delete() == 1) result = Ok(new ActionResult(true, "ok"));
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


		private User CheckUser(UserRole role)
		{
			User user = null;
			if (!String.IsNullOrEmpty(this.Request.Cookies["lagerverwaltunglogincode"])) user = UserEntity.Get(this.Request.Cookies["lagerverwaltunglogincode"], UserField.LoginCode);
			if (user != null && user.Role >= role) return user;
			else return null;
		}

	}
}
