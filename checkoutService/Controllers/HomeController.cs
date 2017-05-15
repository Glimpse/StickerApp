using Microsoft.AspNetCore.Mvc;

namespace CheckoutService.Controllers
{
    [Route("")]
    public class HomeController : Controller
    {
        //TODO: Add better endpoint that kubernetes can use to determine whether the service is alive and healthy
        [HttpGet]
        public string Get()
        {
            return "Checkout service is up and running!";
        }
    }
}
