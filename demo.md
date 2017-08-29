
# Recommendation System

- Azure CLI is being recommended to me because I have the az cli installed
- mv /usr/local/bin/heroku.save /usr/local/bin/heroku
- Install Azure CLI extension, reload
- See that we are now recommending a Heroku extension and when the App Service extension ships we'll recommend App Service

# Azure CLI

- Leverages the Azure CLI meta-data, starts a small Python based language service
- A better interactive mode
- Create a scrapbook of commands
- Author shell scripts
- Still a very manual process to create a website (for example)
- This is really all we have today, must be a better way...

# Azure App Service

- Imagine I was prompted to install the App Service extension
- Explorer contribution, but I'm not logged in
- Azure Login experience
- Working on VS Code application
- Persists credentials once I log in... restart VS Code and I don't have to log in again
- Manage subscriptions (work in progress)
- Now I can create a new Azure App Service
- Browse to the site
- TBD: zip file deployment, hopefully in by EOW

# CosmosDB

- If mongod is on the machine, we'll recommend the CosmosDB as well as any relvant Mongo extensions
- Connect to local mongodb
- Scrapbook, rich editing experience
- Execute commands, see results as JSON
- Update documents locally
- Create a cosmosdb in Azure (takes 5 minutes)
- Use an existing account, create a DB
- Get a connection string from the portal, note this will be a command

# Docker

- Update docker-compose.debug.yml to use cosmosdb connection string
- Run locally, see there is no data
- using cosmosdb extension, query local data and then insertMany into cosmos
- compose-up the app, see data
- show explorer contribution
- tag and push image to docker hub through explorer
- Show registries node, show image in docker hub, show Azure CR
- talk to "deploy to ACI or App Service"
