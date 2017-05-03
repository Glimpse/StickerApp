using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace CheckoutService.Models
{
    public class Order
    {
        [Required]
        public string Id {get; set;}

        [Required]
        public string UserId {get; set;}

        [Required]
        public string UserFirstName {get; set;}

        [Required]
        public string UserLastName {get; set;}

        public string UserEmail {get; set;}

        public IList<OrderItem> Items {get; set;}
    }
}