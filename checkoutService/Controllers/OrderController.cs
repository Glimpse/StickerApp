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
        IMongoDbService _database;

        public OrderController(IMongoDbService database)
        {
            _database = database;
        }

        [HttpGet]
        public async Task<IEnumerable<Order>> GetAll()
        {
            return await _database.GetOrderCollection().Find(o => true).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var order = await _database.GetOrderCollection().Find(o => o.Id == id).FirstOrDefaultAsync();
            if (order != null)
            {
                return new ObjectResult(order);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            if (order == null)
            {
                return BadRequest();
            }

            //When an Order is created, the service assumes that any Items that should be added to the order will be sent
            //in the same POST request.  If no items are specified, an empty list of Items will be created by default.
            if (order.Items == null)
            {
                order.Items = new List<OrderItem>();
            }

            await _database.GetOrderCollection().InsertOneAsync(order);
            return Created(order.Id, order);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAll()
        {
            await _database.GetOrderCollection().DeleteManyAsync(o => true);
            return new NoContentResult();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteById(string id)
        {
            await _database.GetOrderCollection().FindOneAndDeleteAsync(o => o.Id == id);
            return new NoContentResult();
        }
    }
}
