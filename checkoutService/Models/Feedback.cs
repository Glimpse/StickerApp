using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;

namespace CheckoutService.Models
{
    public class Feedback
    {
       [BsonId]
       [Required]
        public string Id {get; set;}

        [Required]
        public string UserId {get; set;}

        [Required]
        public string Entry {get; set;}
    }
}