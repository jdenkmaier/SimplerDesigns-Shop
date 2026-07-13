using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SimplerDesigns.DataService;
using UserEntity = SimplerDesigns.DataService.User;
using DataFile = SimplerDesigns.DataService.File;

namespace SimplerDesigns.DataService.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class ArticleController : ControllerBase
	{

		[HttpGet("{id}")]
		public IActionResult Select1(string id)
		{
			IActionResult result = null;
			try
			{
				Article article = Article.Get(id);
				if (article == null) result = NotFound();
				else result = Ok(article);
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

		[HttpGet("{id}/category")]
		public IActionResult SelectCategory(string id)
		{
			try
			{
				if (CheckUser(UserRole.Standard) == null) return Unauthorized();
				
				Article article = Article.Get(id);
				if (article == null) return NotFound();
				
				return Ok(new { categoryId = article.A_CategoryId });
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

        [HttpGet()]
        public IActionResult SelectAll()
        {
            try
            {
                if (CheckUser(UserRole.Standard) == null) return Unauthorized();
                return Ok(Article.GetList());
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

		[HttpGet("{id}/thumbnail")]
		public IActionResult SelectThumbnail(int id)
		{
			try
			{
				if (CheckUser(UserRole.Standard) == null) return Unauthorized();
				Article article = Article.Get(id);
				if (article == null) return NotFound();
				DataFile thumbnail = DataFile.GetList(article).FirstOrDefault(file => file.Thumbnail == true);
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

        [HttpPost()]
		public IActionResult Insert([FromBody]Article article)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Admin) == null) result = Unauthorized();
				else
				{
					if (article.Save() == 1) result = Ok(new ActionResult(true, "Daten erfolgreich gespeichert.") { data = article });
					else result = Ok(new ActionResult(false, "Daten nicht gespeichert."));
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
		public IActionResult Update(int id, [FromBody] Article article)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Admin) == null) result = Unauthorized();
				else
				{
					Article dbArticle = Article.Get(id);
					if (dbArticle == null) result = NotFound();
					else
					{
						if (article.Save() == 1) result = Ok(new ActionResult(true, "Daten erfolgreich gelöscht"));
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

		[HttpDelete("{id}")]
		public IActionResult Delete(int id)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Admin) == null) result = Unauthorized();
				else
				{
					Article dbArticle = Article.Get(id);
					if (dbArticle == null) result = NotFound();
					else
					//Alle dazugehörigen Dateien löschen, bevor der Artikel gelöscht wird -> sonst Foreign Key Constraint Error
					{
						foreach (var file in DataFile.GetList(dbArticle))
							file.Delete();
						if (dbArticle.Delete() == 1) result = Ok(new ActionResult(true, "Daten erfolgreich gelöscht"));
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

		[HttpPut("{id}/category")]
		public IActionResult UpdateCategory(string id, [FromBody] dynamic data)
		{
			try
			{
				if (CheckUser(UserRole.Admin) == null) return Unauthorized();
				
				Article article = Article.Get(id);
				if (article == null) return NotFound();
				
				article.A_CategoryId = (int?)data.categoryId;
				if (article.Save() == 1) 
					return Ok(new ActionResult(true, "Kategorie erfolgreich aktualisiert"));
				else 
					return Ok(new ActionResult(false, "Kategorie konnte nicht aktualisiert werden"));
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


		[HttpGet("{id}/file")]
		public IActionResult SelectFile(string id)
		{
			try
			{
				if (CheckUser(UserRole.Standard) == null) return Unauthorized();
				
				Article article = Article.Get(id);
				if (article == null) return NotFound();
				
				List<DataFile> fileList = DataFile.GetList(article);
				return Ok(fileList);
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

		[HttpPost("{id}/file")]
		[RequestFormLimits(MultipartBodyLengthLimit = 78643200)]
		public IActionResult InsertFile(string id)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else
				{
					Article article = Article.Get(id);
					if (article == null) result = NotFound();
					else
					{
						MemoryStream memoryStream = null;
                        DataFile file = null;
						int saveCount = 0;
						List<DataFile> existingFiles = DataFile.GetList(article);
						bool hasThumbnail = existingFiles.Any(f => f.Thumbnail);

						if (this.Request.Form.Files.Count > 0)
						{
							foreach (IFormFile formFile in this.Request.Form.Files)
							{
								memoryStream = new();
                                formFile.CopyTo(memoryStream);
								file = new()
								{
									ArticleId = article.ArticleId,
									Name = formFile.FileName,
									MediaType = formFile.ContentType,
									Content = memoryStream.GetBuffer(),
									Thumbnail = !hasThumbnail
								};
								saveCount += file.Save();
								hasThumbnail = true;
							}

							if (saveCount == this.Request.Form.Files.Count) result = Ok(new ActionResult(true, $"{saveCount} Datei(en) erfolgreich gespeichert!"));
							else result = Ok(new ActionResult(false, $"{saveCount} / {this.Request.Form.Files.Count} Datei(en) gespeichert!"));
						}
						else result = NoContent();
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
