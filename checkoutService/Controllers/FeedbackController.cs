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
    public class FeedbackController : Controller
    {
        IMongoDbService _database;

        public FeedbackController(IMongoDbService database)
        {
            _database = database;
        }

        [HttpGet]
        public async Task<IEnumerable<Feedback>> GetAll()
        {
            return await _database.GetFeedbackCollection().Find(f => true).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var feedbackEntry = await _database.GetFeedbackCollection().Find(f => f.Id == id).ToListAsync();
            if (feedbackEntry.Count > 0)
            {
                return new ObjectResult(feedbackEntry[0]);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Feedback feedback)
        {
            if (feedback == null)
            {
                return BadRequest();
            }

            await _database.GetFeedbackCollection().InsertOneAsync(feedback);
            return Created(feedback.Id, feedback);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAll()
        {
            await _database.GetFeedbackCollection().DeleteManyAsync(f => true);
            return new NoContentResult();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteById(string id)
        {
            await _database.GetFeedbackCollection().FindOneAndDeleteAsync(f => f.Id == id);
            return new NoContentResult();
        }
    }
}
