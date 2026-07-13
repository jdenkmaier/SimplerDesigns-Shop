using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SimplerDesigns.DataService;
using UserEntity = SimplerDesigns.DataService.User;

namespace SimplerDesigns.DataService.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class PageController : ControllerBase
	{

		[HttpGet()]
		public IActionResult Init()
		{
			IActionResult result = null;
			try
			{
				if (String.IsNullOrEmpty(this.Request.Cookies["lagerverwaltunglogincode"]))
				{
					result = Ok(new ActionResult(false, "Nicht angemeldet!"));
				}
				else
				{
					string loginCode = this.Request.Cookies["lagerverwaltunglogincode"];
					User user = UserEntity.Get(loginCode, UserField.LoginCode);
					result = Ok(new ActionResult(true, "ok") { data = user });
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
}
