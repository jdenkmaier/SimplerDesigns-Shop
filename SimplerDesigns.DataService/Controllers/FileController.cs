using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SimplerDesigns.DataService;
using UserEntity = SimplerDesigns.DataService.User;
using FileEntity = SimplerDesigns.DataService.File;

namespace SimplerDesigns.DataService.Controllers
{
	[Route("[controller]")]
	[ApiController]
	public class FileController : ControllerBase
	{

		[HttpDelete("{id}")]
		public IActionResult Delete(int id)
		{
			IActionResult result = null;
			try
			{
				if (CheckUser(UserRole.Standard) == null) result = Unauthorized();
				else
				{
					FileEntity dbFile = FileEntity.Get(id);
					if (dbFile == null) result = NotFound();
					else
					{
						if (dbFile.Delete() == 1) result = Ok(new ActionResult(true, "Daten erfolgreich gelöscht"));
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
		private User CheckUser(UserRole rolle)
		{
			User user = null;
			if (!String.IsNullOrEmpty(this.Request.Cookies["lagerverwaltunglogincode"])) user = UserEntity.Get(this.Request.Cookies["lagerverwaltunglogincode"], UserField.LoginCode);
			if (user != null && user.Role >= rolle) return user;
			else return null;
		}

		public class ThumbnailDto { public bool Thumbnail { get; set; } }

		[HttpPut("{id}/thumbnail")]
		public IActionResult SetThumbnail(int id, [FromBody] ThumbnailDto dto)
		{
			try
			{
				if (CheckUser(UserRole.Standard) == null) return Unauthorized();

				var file = FileEntity.Get(id);
				if (file == null) return NotFound();

				// wenn true -> alle anderen für den Artikel zurücksetzen
				if (dto != null && dto.Thumbnail)
				{
					using var conn = DataConnection.GetConnection();
					conn.Open();
					using var cmd = conn.CreateCommand();
					cmd.CommandText = "update data.file set thumbnail = false where article_id = :aid";
					cmd.Parameters.AddWithValue("aid", file.ArticleId);
					cmd.ExecuteNonQuery();
					conn.Close();
				}

				file.Thumbnail = dto?.Thumbnail ?? false;
				file.Save();

				return Ok(new ActionResult(true, "Thumbnail gesetzt"));
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
