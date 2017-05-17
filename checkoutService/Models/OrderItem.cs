using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;

namespace CheckoutService.Models
{
    public class OrderItem
    {
        [BsonId]
        [Required]
        public string Id {get; set;}

        [Required]
        public int Quantity {get; set;}
    }
}