using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace CheckoutService.Models
{
    public class OrderItem
    {
        [BsonId]
        [JsonProperty("id")]
        [Required]
        public string Id {get; set;}

        [Required]
        [JsonProperty("quantity")]
        public int Quantity {get; set;}
    }
}