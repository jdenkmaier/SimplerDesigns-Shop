namespace SimplerDesigns.DataService.DTO
{
    public class EditProfileData
    {
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string Mail { get; set; }
        public required string LoginName { get; set; }
        public string? Password { get; set; }
        public string? Adress { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public bool Newsletter { get; set; }
        public string? DeliveryAdress { get; set; }
    }
}
