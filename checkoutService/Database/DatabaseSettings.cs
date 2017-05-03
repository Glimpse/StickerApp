using System;

public class DatabaseSettings
{
    public DatabaseSettings() {}

    public string Port { get; set; }

    public string DbName { get; set; }

    public string Host { get; set; }
    
    public string OrderCollectionName { get; set; }

    public string FeedbackCollectionName { get; set; }

    public string ConnectionUri {
        get
        {
            if (String.IsNullOrEmpty(Port)) {
                throw new InvalidOperationException("Invalid  configuration - Port not found.");
            }

            if (String.IsNullOrEmpty(DbName)) {
                throw new InvalidOperationException("Invalid  configuration - DbName not found.");
            }

            if (String.IsNullOrEmpty(Host)) {
                throw new InvalidOperationException("Invalid  configuration - Host not found.");
            }

            return String.Format("mongodb://{0}:{1}/{2}", Host, Port, DbName); 
        }
    }
}