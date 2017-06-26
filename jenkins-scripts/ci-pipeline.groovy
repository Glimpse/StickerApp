node {
    
   // Azure container docker registry where the images are pushed\pulled from, e.g. <containername>.azurecr.io
   env.ACR_NAME = ''
   
   // DNS name of the kafka broker with port, e.g. "kafka-broker-kf:9092"
   env.KAFKA_BROKER = ''
   
   // DNS name of a zookeeper instance with port, e.g. "kafka-zookeeper-zk:2181"
   env.ZK_CONNECT = ''
   
   // IP address of nginx ingress controller
   env.INGRESS_IP = ''
   
   // Release name for the production version of the app
   env.PROD_RELEASE = ''
   
   // Release name for the test version of the app
   env.TEST_RELEASE = ''
   
   // Name of the AAD tenant used for the app's B2C authentication, e.g. <tenantname>.onmicrosoft.com
   env.AAD_TENANT = ''
   
   // URL for the internal API Gateway service that the integration tests run against
   env.TEST_APP_URL = "http://localhost:8001/api/v1/proxy/namespaces/default/services/$TEST_RELEASE-apigateway"
   
   stage('Preparation') { 
    
      // Get some code from a GitHub repository
      git 'https://github.com/nicolehaugen79/StickerApp.git'
      
      // Ensure helm is intialized for the Jenkins user
      sh '''helm init'''
      
      // Ensure Jenkins has access to the azure container registry
      withCredentials([usernamePassword(credentialsId: 'ACR', passwordVariable: 'ACR_PASSWORD', usernameVariable: 'ACR_USER')]) {
        sh '''docker login $ACR_NAME -u $ACR_USER -p $ACR_PASSWORD'''}
   }
   stage('Build') {

       // Build the client
       sh '''docker-compose -f docker-compose.build-client.yml up'''
       
       // Build and push the image for the api gateway which serves as the public endpoint
       sh '''cd apigateway
       docker build -t $ACR_NAME/stickerapp/apigateway:$BUILD_NUMBER .
       docker push $ACR_NAME/stickerapp/apigateway:$BUILD_NUMBER'''
        
        // Build and push the image for the checkout microservice    
        sh '''cd checkoutService
        docker build -t $ACR_NAME/stickerapp/checkout:$BUILD_NUMBER .
        docker push $ACR_NAME/stickerapp/checkout:$BUILD_NUMBER'''
    
        // Build and push the image for the session microservice
        sh '''cd sessionService
        docker build -t $ACR_NAME/stickerapp/session:$BUILD_NUMBER .
        docker push $ACR_NAME/stickerapp/session:$BUILD_NUMBER'''
        
        // Build and push the image for the stickers microservice
        sh '''cd stickerService
        docker build -t $ACR_NAME/stickerapp/stickers:$BUILD_NUMBER .
        docker push $ACR_NAME/stickerapp/stickers:$BUILD_NUMBER'''

        // Get the dependencies
        sh '''cd k8s
        helm dependency update stickerapp'''
   }
   stage('Test') {
       
        // Commands require both AAD and Docker creds   
        withCredentials([usernamePassword(credentialsId: 'AAD', passwordVariable: 'AAD_SECRET', usernameVariable: 'AAD_CLIENTID'), string(credentialsId: 'DOCKER', variable: 'DOCKER_SECRET')]) {
         
            // Install the test version of the app; if already deployed, upgrade
            sh '''cd k8s
            if (helm ls $TEST_RELEASE | grep -q 'DEPLOYED'); then
                helm upgrade $TEST_RELEASE stickerapp --wait --reuse-values --set useIngress="false" --set azureActiveDirectory.clientId="$AAD_CLIENTID" --set azureActiveDirectory.clientSecret="$AAD_SECRET" --set azureActiveDirectory.destroySessionUrl="https://login.microsoftonline.com/$AAD_TENANT/oauth2/v2.0/logout?p=B2C_1_SignIn&post_logout_redirect_uri=https://$INGRESS_IP" --set azureActiveDirectory.redirectUrl="https://$INGRESS_IP/users/auth/return" --set azureActiveDirectory.tenant="$AAD_TENANT" --set registry="$ACR_NAME" --set dockercfg="$DOCKER_SECRET" --set imageTag="$BUILD_NUMBER" --set kafkaBroker="$KAFKA_BROKER" --set zookeeperConnect="$ZK_CONNECT"
            else
                helm install stickerapp --name $TEST_RELEASE --wait --set useIngress="false" --set azureActiveDirectory.clientId="$AAD_CLIENTID" --set azureActiveDirectory.clientSecret="$AAD_SECRET" --set azureActiveDirectory.destroySessionUrl="https://login.microsoftonline.com/$AAD_TENANT/oauth2/v2.0/logout?p=B2C_1_SignIn&post_logout_redirect_uri=https://$INGRESS_IP" --set azureActiveDirectory.redirectUrl="https://$INGRESS_IP/users/auth/return" --set azureActiveDirectory.tenant="$AAD_TENANT" --set registry="$ACR_NAME" --set dockercfg="$DOCKER_SECRET" --set imageTag="$BUILD_NUMBER" --set kafkaBroker="$KAFKA_BROKER" --set zookeeperConnect="$ZK_CONNECT"
            fi'''
            
            // Helm's --wait command isn't sufficient to determine if deployment is ready, so check to see if the Session's deployment is available before running tests
            env.TEST_SESSION_NAME = env.TEST_RELEASE + "-session"
            sh '''
            for i in {1 2 3 4 5 6 7 8 9 10 11 12 13 14 15}
            do
                if (kubectl get deployments $TEST_SESSION_NAME | grep -q '0')
                then
                    echo "Checking if deployment is ready.  Attempt:$i"
                    sleep 15s
                else
                    break
                fi
            done'''
        }
       
        // Run integration tests
        nodejs(nodeJSInstallationName: 'Mocha') {
            sh '''npm install should
            npm install supertest
            npm install supertest-as-promised
            BUILD_ID=dontKillMe kubectl proxy & mocha tests'''
        } 
  }
  stage('Deploy') {

     // Commands require both AAD and Docker creds  
     withCredentials([usernamePassword(credentialsId: 'AAD', passwordVariable: 'AAD_SECRET', usernameVariable: 'AAD_CLIENTID'), string(credentialsId: 'DOCKER', variable: 'DOCKER_SECRET')]) {
         
          // Install the production version of the app; if already deployed, upgrade
            sh '''cd k8s
            if (helm ls $PROD_RELEASE | grep -q 'DEPLOYED'); then
                helm upgrade $PROD_RELEASE stickerapp --set azureActiveDirectory.clientId="$AAD_CLIENTID" --set azureActiveDirectory.clientSecret="$AAD_SECRET" --set azureActiveDirectory.destroySessionUrl="https://login.microsoftonline.com/$AAD_TENANT/oauth2/v2.0/logout?p=B2C_1_SignIn&post_logout_redirect_uri=https://$INGRESS_IP" --set azureActiveDirectory.redirectUrl="https://$INGRESS_IP/users/auth/return" --set azureActiveDirectory.tenant="$AAD_TENANT" --set registry="$ACR_NAME" --set dockercfg="$DOCKER_SECRET" --set imageTag="$BUILD_NUMBER" --set kafkaBroker="$KAFKA_BROKER" --set zookeeperConnect="$ZK_CONNECT"
            else
                helm install stickerapp --name $PROD_RELEASE --set azureActiveDirectory.clientId="$AAD_CLIENTID" --set azureActiveDirectory.clientSecret="$AAD_SECRET" --set azureActiveDirectory.destroySessionUrl="https://login.microsoftonline.com/$AAD_TENANT/oauth2/v2.0/logout?p=B2C_1_SignIn&post_logout_redirect_uri=https://$INGRESS_IP" --set azureActiveDirectory.redirectUrl="https://$INGRESS_IP/users/auth/return" --set azureActiveDirectory.tenant="$AAD_TENANT" --set registry="$ACR_NAME" --set dockercfg="$DOCKER_SECRET" --set imageTag="$BUILD_NUMBER" --set kafkaBroker="$KAFKA_BROKER" --set zookeeperConnect="$ZK_CONNECT"
            fi'''
      } 
   }
}