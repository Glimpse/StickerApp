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
        [HttpGet]
        public async Task<IEnumerable<Feedback>> Get()
        {
            return await MongoDBContext.GetContext().FeedbackEntries.Find(f => true).ToListAsync();
        }

        [HttpPost]
        public async Task Post([FromBody] Feedback feedback)
        {
            await MongoDBContext.GetContext().FeedbackEntries.InsertOneAsync(feedback);
        }

        [HttpDelete]
        public async Task Delete()
        {
            await MongoDBContext.GetContext().FeedbackEntries.DeleteManyAsync(f => true);
        }
    }
}
