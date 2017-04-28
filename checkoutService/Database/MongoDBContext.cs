
using System;
using MongoDB.Driver;
using CheckoutService.Models;

public class MongoDBContext
{
    private readonly IMongoDatabase _database = null;
    private static MongoDBContext ctx = null;

    public static MongoDBContext GetContext()
    {
        if (ctx == null)
        {
            ctx = new MongoDBContext();
        }

        return ctx;
    }

    private MongoDBContext()
    {
        try {
            var client = new MongoClient(DatabaseConfig.ConnectionString);
            if (client != null)
                _database = client.GetDatabase(DatabaseConfig.MongoDBName);
        }
        catch (Exception e)
        {
            throw new Exception("Unable to connect to MongoDB.", e);
        }
    }

    public IMongoCollection<Feedback> FeedbackEntries
    {
        get
        {
            return _database.GetCollection<Feedback>(DatabaseConfig.FeedbackCollectionName);
        }
    }

      public IMongoCollection<Order> Orders
    {
        get
        {
            return _database.GetCollection<Order>(DatabaseConfig.OrderCollectionName);
        }
    }
}