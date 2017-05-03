
using System;
using MongoDB.Driver;
using CheckoutService.Models;
using Microsoft.Extensions.Options;

public class MongoDbService : IMongoDbService
{
    IMongoDatabase db = null;
    IMongoCollection<Feedback> feedbackCollection = null;
    IMongoCollection<Order> orderCollection = null;

    public MongoDbService(IOptions<DatabaseSettings> dbSettings)
    {
        var _dbSettings = dbSettings.Value;

        var client = new MongoClient(_dbSettings.ConnectionUri);
        if (client != null) 
        {
            db = client.GetDatabase(_dbSettings.DbName);

            if (db != null)
            {
                feedbackCollection = db.GetCollection<Feedback>(_dbSettings.FeedbackCollectionName);
                orderCollection = db.GetCollection<Order>(_dbSettings.OrderCollectionName);
            }
        }
    }

    public IMongoDatabase GetConnection()
    {
        if (db == null)
        {
            throw new InvalidOperationException("Unable to connect to database.");
        }

        return db;
    }

    public IMongoCollection<Feedback> GetFeedbackCollection()
    {
        if (feedbackCollection == null)
        {
            throw new InvalidOperationException("Unable to get Feedback collection.");
        }

        return feedbackCollection;
    }

    public IMongoCollection<Order> GetOrderCollection()
    {
        if (orderCollection == null)
        {
            throw new InvalidOperationException("Unable to get Order collection.");
        }

        return orderCollection;
    }
}