using System.ComponentModel.DataAnnotations;

namespace CheckoutService.Models
{
    public class OrderItem
    {
        [Required]
        public string Id {get; set;}

        [Required]
        public string ItemId {get; set;}

        [Required]
        public int Quantity {get; set;}
    }
}