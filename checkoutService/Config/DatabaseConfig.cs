using System;

public class DatabaseConfig
{
    public static int Port = 27017;
    public static string MongoDBName = "CheckoutDB";
    public static string ConnectionString = String.Format("mongodb://localhost:{0}/{1}", Port, MongoDBName);
    public static string OrderCollectionName = "orders";
    public static string FeedbackCollectionName = "feedbackEntries";
}