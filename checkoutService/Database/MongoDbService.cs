using CheckoutService.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;

namespace CheckoutService
{
    public class MongoDbService : IMongoDbService
    {
        private IMongoDatabase _db;
        private IMongoCollection<Feedback> _feedbackCollection;
        private IMongoCollection<Order> _orderCollection;

        public MongoDbService(IOptions<MongoDbSettings> dbSettings)
        {
            var _dbSettings = dbSettings.Value;

            var client = new MongoClient(_dbSettings.ConnectionString);
            _db = client?.GetDatabase(_dbSettings.DbName);
            _feedbackCollection = _db?.GetCollection<Feedback>(_dbSettings.FeedbackCollectionName);
            _orderCollection = _db?.GetCollection<Order>(_dbSettings.OrderCollectionName);
        }

        public IMongoDatabase GetConnection()
        {
            if (_db == null)
            {
                throw new InvalidOperationException("Unable to connect to database.");
            }

            return _db;
        }

        public IMongoCollection<Feedback> GetFeedbackCollection()
        {
            if (_feedbackCollection == null)
            {
                throw new InvalidOperationException("Unable to get Feedback collection.");
            }

            return _feedbackCollection;
        }

        public IMongoCollection<Order> GetOrderCollection()
        {
            if (_orderCollection == null)
            {
                throw new InvalidOperationException("Unable to get Order collection.");
            }

            return _orderCollection;
        }
    }
}