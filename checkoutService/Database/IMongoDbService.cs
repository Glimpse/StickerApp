using MongoDB.Driver;
using CheckoutService.Models;

public interface IMongoDbService
{
    IMongoDatabase GetConnection();

    IMongoCollection<Feedback> GetFeedbackCollection();

    IMongoCollection<Order> GetOrderCollection();
}