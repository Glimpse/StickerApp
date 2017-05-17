using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using MongoDB.Bson.Serialization.Attributes;

namespace CheckoutService.Models
{
    public class Order
    {
        [BsonId]
        [Required]
        public string Id {get; set;}

        [Required]
        public string UserId {get; set;}

        [Required]
        public string FullName {get; set;}

        [Required]
        public string Email {get; set;}

        public IList<OrderItem> Items {get; set;}
    }
}