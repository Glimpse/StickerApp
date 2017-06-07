using MongoDB.Driver;
using CheckoutService.Models;

namespace CheckoutService
{
    public interface IMongoDbService
    {
        IMongoDatabase GetConnection();

        IMongoCollection<Feedback> GetFeedbackCollection();

        IMongoCollection<Order> GetOrderCollection();
    }
}