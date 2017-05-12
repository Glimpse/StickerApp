using System;
using Microsoft.AspNetCore.Mvc;

namespace CheckoutService.Controllers
{
    [Route("")]
    public class HomeController : Controller
    {
        [HttpGet]
        public string Get()
        {
            return "Checkout service is up and running!";
        }
    }
}
