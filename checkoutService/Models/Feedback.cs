using System.ComponentModel.DataAnnotations;

namespace CheckoutService.Models
{
    public class Feedback
    {
        [Required]
        public string Id {get; set;}

        [Required]
        public string UserId {get; set;}

        [Required]
        public string Entry {get; set;}
    }
}