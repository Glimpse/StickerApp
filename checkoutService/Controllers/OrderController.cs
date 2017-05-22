using CheckoutService.Models;
using Confluent.Kafka;
using Confluent.Kafka.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace CheckoutService.Controllers
{
    [Route("api/[controller]")]
    public class OrderController : Controller
    {
        IMongoDbService _database;
        Producer<Null, string> _producer;
        string _topic;

        public OrderController(IMongoDbService database, IOptions<KafkaSettings> kafkaSettings)
        {
            _database = database;

            var config = new Dictionary<string, object> {
                { "bootstrap.servers", kafkaSettings.Value.Broker }
            };
            _producer = new Producer<Null, string>(config, null, new StringSerializer(Encoding.UTF8));
            _topic = kafkaSettings.Value.Topic;
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
            StringValues userId = String.Empty;
            if (order == null || !this.Request.Headers.TryGetValue("stickerUserId", out userId))
            {
                return BadRequest($"Invalid order values. Order:{order} UserId:{userId}");
            }

            //When an Order is created, the service assumes that any Items that should be added to the order will be sent
            //in the same POST request.  If no items are specified, an empty list of Items will be created by default.
            if (order.Items == null)
            {
                order.Items = new List<OrderItem>();
            }

            order.UserId = userId;
            await _database.GetOrderCollection().InsertOneAsync(order);

            // produce a Kafka record so the sticker service can update popularity scores
            var recordJson = JsonConvert.SerializeObject(order.Items);
            var deliveryReport = await _producer.ProduceAsync(_topic, null, recordJson);

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
