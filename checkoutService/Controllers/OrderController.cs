using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using CheckoutService.Models;

namespace CheckoutService.Controllers
{
    [Route("api/[controller]")]
    public class OrderController : Controller
    {
        [HttpGet]
        public async Task<IEnumerable<Order>> Get()
        {
            return await MongoDBContext.GetContext().Orders.Find(f => true).ToListAsync();
        }

        [HttpPost]
        public async Task Post([FromBody] Order order)
        {
            if (order.Items == null)
            {
                order.Items = new List<OrderItem>();
            }

            await MongoDBContext.GetContext().Orders.InsertOneAsync(order);
        }

        [HttpDelete]
        public async Task Delete()
        {
            await MongoDBContext.GetContext().Orders.DeleteManyAsync(f => true);
        }
    }
}
