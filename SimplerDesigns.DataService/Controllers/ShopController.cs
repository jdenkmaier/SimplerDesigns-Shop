using Microsoft.AspNetCore.Mvc;
using SimplerDesigns.DataService;
using DataFile = SimplerDesigns.DataService.File;

namespace SimplerDesigns.DataService.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ShopController : ControllerBase
    {

        [HttpGet("article/{id}/thumbnail")]
        public IActionResult SelectThumbnail(int id)
        {
            try
            {
                Article article = Article.Get(id);
                if (article == null) return NotFound();

                DataFile thumbnail = DataFile.GetList(article).FirstOrDefault(f => f.Thumbnail == true);
                if (thumbnail == null || thumbnail.Content == null) return NotFound();

                return File(thumbnail.Content, thumbnail.MediaType);
            }
            catch (Exception ex)
            {
#if DEBUG
                return StatusCode(500, ex.Message);
#else
                return StatusCode(500);
#endif
            }
        }

        [HttpGet("category/{catId}/article")]
        public IActionResult SelectArticlesByCategory(int catId)
        {
            try
            {
                Category category = Category.Get(catId);
                if (category == null) return NotFound();

                List<Article> articles = Article.GetListByCategoryOrSubcategory(category)
                    .Where(a => a.Hide == false)
                    .ToList();

                return Ok(articles);
            }
            catch (Exception ex)
            {
#if DEBUG
                return StatusCode(500, ex.Message);
#else
                return StatusCode(500);
#endif
            }
        }

        [HttpGet("article/highlighted")]
        public IActionResult SelectHighlightedArticles()
        {
            try
            {
                List<Article> articles = Article.GetHighlighted();
                return Ok(articles);
            }
            catch (Exception ex)
            {
        #if DEBUG
                return StatusCode(500, ex.Message);
        #else
                return StatusCode(500);
        #endif
            }
        }

    }
}
