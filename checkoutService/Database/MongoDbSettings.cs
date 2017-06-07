namespace CheckoutService
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; }
        public string DbName { get; set; }
        public string FeedbackCollectionName { get; set; }
        public string OrderCollectionName { get; set; }
    }
}