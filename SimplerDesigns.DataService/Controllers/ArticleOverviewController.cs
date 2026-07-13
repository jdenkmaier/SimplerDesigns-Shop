using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SimplerDesigns.DataService;
using UserEntity = SimplerDesigns.DataService.User;
using DataFile = SimplerDesigns.DataService.File;

namespace SimplerDesigns.DataService.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class ArticleOverviewController : ControllerBase
	{

        [HttpGet("{catId}")]
        public IActionResult SelectArticleOverview(int catId)
        {
            IActionResult result = null;
            try
            {

                  List<ArticleOverview> overview = ArticleOverview.GetOverview(catId);
                  result = Ok(overview);
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
