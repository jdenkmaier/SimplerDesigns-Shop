namespace SimplerDesigns.DataService
{
	public class ActionResult
	{
		public ActionResult()
		{
		}
		public ActionResult(bool ok, string message)
		{
			this.ok = ok;
			this.message = message;
		}

		public bool ok { get; set; }
		public string message { get; set; }
		public object data { get; set; }
		public int errorCode { get; set; } = 0;
	}
}
