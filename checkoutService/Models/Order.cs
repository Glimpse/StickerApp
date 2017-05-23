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

        // the client will send an empty name when none is provided
        // in the user's profile, which is possible because a name
        // needn't be provided at signup
        [Required(AllowEmptyStrings = true)]
        public string FullName {get; set;}

        [Required]
        [DataType(DataType.EmailAddress)]
        public string Email {get; set;}

        [Required]
        public IList<OrderItem> Items {get; set;}
    }
}