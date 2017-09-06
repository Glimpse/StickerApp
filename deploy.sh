
RESOURCEGROUP=""
LOCATION=""
PLANNAME=""
SITENAME=""
RUNTIME="Node|6.9"

# login supports device login, username/password, and service principals
# see https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest#az_login
az login 
# list all of the available subscriptions
az account list -o table
# set the default subscription for subsequent operations
az account set --subscription MSDN
# create a resource group for your application
az group create --name $RESOURCEGROUP --location $LOCATION
# create an appservice plan (a machine) where your site will run
# in this case we are creating an S1 linux machine 
az appservice plan create --name $PLANNAME --location $LOCATION --is-linux --sku S1 --resource-group $RESOURCEGROUP
# create the web application on the plan
# specify the node version your app requires
az webapp create --name $SITENAME --plan $PLANNAME --runtime $RUNTIME --resource-group $RESOURCEGROUP
az webapp 
# set up deployment from a local git repository
# first, set the username and password (use environment variables!)
USERNAME=""
PASSWORD=""
az webapp deployment user set --user-name $USERNAME --password $PASSWORD 

# now, configure the site for deployment. in this case, we will deploy from the local git repository
# you can also configure your site to be deployed from a remote git repository or set up a CI/CD workflow
az webapp deployment source config-local-git --name $SITENAME --resource-group $RESOURCEGROUP

# the previous command returned the git remote to deploy to
# use this to set up a new remote named 'azure'
git remote add azure "https://$USERNAME@$SITENAME.scm.azurewebsites.net/cdias-appname-site.git"
# push master to deploy the site
git push azure master

# browse to the site
az webapp browse --name $SITENAME --resource-group $RESOURCEGROUP


az account list -o table
az appservice plan create --resource-group 



az account list -o table
az account set --subscription MSDN
az group create --name john-papa-rg --location westus
az appservice plan create --name fix-walkthrough-plan --sku F1 --resource-group john-papa-rg --location westus
az webapp create --name fix-walkthrough-site --plan fix-walkthrough-plan --resource-group john-papa-rg 
az webapp deployment list-publishing-profiles --name fix-walkthrough-site --resource-group john-papa-rg
az webapp deployment source config-local-git --name fix-walkthrough-site --resource-group john-papa-rg
az webapp config set --name fix-walkthrough-site --resource-group fix-walkthrough-rg --node-version 8.1.0




az group create --name test-acr-rg --location westus
az acr create --name myACRRegistry --sku Basic --location westus --resource-group test-acr-rg 
az group create --name test-saw-rg --location westus
az configure --defaults group=sa-rg2 location=westus
az appservice plan create --name test-saw-plan --resource-group test-saw-rg --is-linux --sku S1
az webapp create --name cdias-stickerapp2 --plan sa-plan2 
az webapp config appsettings set --name cdias-stickerapp2 --settings PORT=3000 MONGODB_URL=mongodb://sa-mongodb:qMQClbKx1lbd1xTcbImBVYR0ZKRWIqwCrl2U2iT64avcjhRARWtHynSQmNiayviiTWuCgXSfTHvz3uPKqmsZaw==@sa-mongodb.documents.azure.com:10255/?ssl=true&replicaSet=globaldb
az webapp config container set --name cdias-stickerapp2 --docker-custom-image-name chrisdias/stickerapp:mhart-alpine-node-latest 
az webapp browse --name cdias-stickerapp2
az group delete --name sa-rg2 --yes



az cosmosdb create --name sa-mongodb --kind MongoDB
az cosmosdb list-connection-strings --name sa-mongodb 


az webapp deployment user set --user-name chrisdias --password
az webapp deployment source config-local-git --name cdias-stickerapp2 --resource-group sa-rg 
git remote add azure https://chrisdias@cdias-stickerapp2.scm.azurewebsites.net/cdias-stickerapp2.git


az webapp delete --name cdias-stickerapp2 
az appservice plan delete --name sa-plan2 --yes