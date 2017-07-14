# Sticker E-Commerce Demo App
The Sticker App allows end users to browse images from Flickr, add them to a cart, and print them as laptop stickers.  The app also shows trending stickers which reflects the most popular stickers viewed\printed by users and allows users to provide feedback on the app after they have selected to print their stickers.

The Sticker App is composed of 4 different microservices, most of which are implemented in Node.JS, with the exception of one that is implemented using ASP .NET Core. 
1.  API Gateway (Node.JS): 
* Ensures the user is authenticated prior to calling into each of the microservices; is the primary entry point into the server
* Stores User\Profile data in MySQL
* Implements email and facebook authentication using Passport and Azure AAD B2C
2.  Sticker Service (Node.JS):
* Uses Kafka to track checkout and item view events; these events are used to calculate trending stickers
* Uses Redis to store sticker popularity scores
* Trending sticker live updates are implemented using Websocket.io
* Integrates with Flickr API for retrieving sticker images
* Uses MongoDB for storing initial viewed sticker data
3.  Session Service (Node.JS):
* Uses Redis for storing cart and viewed sticker data
* Uses MongoDB for updating initial viewed sticker data
4. Checkout Service (ASP.NET Core):
* Stores sticker order\item and feedback data in MongoDB

In addition to the technologies mentioned above, this app also uses:
1.  React
2.  Express
3.  App Insights

## Deployment Options
You have 3 options for deploying this app:

1.  Deploy locally using Docker Compose; each microservice and their required storage resources (e.g. MongoDB, MySQL, and Kafka) will run in its own Docker container on your local developer machine.

2. Deploy the app to Azure Container Services using Kubernetes and Helm.  Specifically:
* Docker images will be built and pushed to an Azure Container Registry.
* Kubernetes will pull the images from the registry and deploy the Docker containers to the cluster (each microservice and their required storage resources will run in its own Docker container on the cluster's nodes).
* An inginx ingress controller will be deployed to the cluster that exposes the app's public endpoint.

3. Deploy production and test versions of the app using Jenkins' CI\CD Pipeline.  Specifically:
* The CI\CD Pipeline will deploy the app as described in bullet #2 above.
* Mocha integration tests will run against the test version of the app.
* If the tests pass, the production version of the app will be upgraded with no downtime for the end user.

## Deployment Option #1: Running Locally
1. (Optional) Configure App Insights by adding an App Insights resource.  To do this, follow the [Set up an App Insights resource](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-nodejs) section that describes how to create this resource and how to retrieve the Instrumention Key.  Finally, update AI_IKEY setting in the apigateway\debug.env file.  If you choose not to configure this, the app will still function, but there won't be any diagnostic logging collected in Azure.

2. (Optional) Configure AAD which provides the ability for the end user to login and complete the sticker checkout process.  If you
choose NOT to configure this, the app will only be partially functional - the end user will be unable to complete the sticker checkout process when they are using the app.  However, the app will launch fine and still provide the ability to browse and add\view stickers in the cart.

Follow these steps to configure AAD:
a. Refer to the below section, called AAD Setup, to create the required AAD resources and configure the app for email and facebook authentication.
b. In the Azure Portal for the B2C Tenant that you created in the above step, update the Application's Reply URL to: http://localhost:3000/users/auth/return.
c. Set the following values in the apigateway\debug.env file (these are retrieved via the Azure Portal) - specifically, click on the B2C Tenant.  Once this opens, click on the Azure AD B2C Settings square on the main section of the page which will open detailed settings:
* AD_ClIENT_ID (set to the Application ID value for the Application)
* AD_CLIENT_SECRET (set to the generated Key value under the Application's Keys)
* AD_DESTROY_SESSION (update the url to include the name of your tenant)
* AD_TENANT (set to the name of your tenant)

As a result, the end user should now be able to click 'Log In' to sign in\up using email or facebook.  The user should also be able to add stickers to the cart and checkout.  Finally, the user can 'Log Out' of the app.

3. From the root of the Sticker App project, run the following command:
```console
$ docker-compose -f docker-compose.dev.yml up -d
```
Then open your browser to [http://localhost:3000](http://localhost:3000)

## Deployment Option #2: Deploying to Kubernetes with Helm
This repository includes a chart for Helm, the package manager for Kubernetes, to
simplify deploying the application.

#### Prerequisites
* A private Docker registry. Follow the Azure Container Registry [getting started guide](
  https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal)
  to create one.  NOTE: When creating the registry, choose to enable an Admin user; this user name and password will
  be used in a later step to log-in to registry with docker and to generate the docker-registry secret.
* A Kubernetes cluster. Follow the Azure Container Service [walkthrough](
  https://docs.microsoft.com/en-us/azure/container-service/container-service-kubernetes-walkthrough)
  to create one.

#### Preparing your local machine
* Ensure `kubectl` is configured for your cluster, and that the Helm
 client is on your path. See the [Helm quickstart guide](https://docs.helm.sh/using_helm)
 for instructions.

* Build the app's React client. From the repository root:
  ```console
  $ docker-compose -f docker-compose.build-client.yml up
  ```

#### Building and pushing the app's images
The chart expects these
images, where `your-registry.azurecr.io` is your private registry:

image name | source directory
--- | ---
`your-registry.azurecr.io/stickerapp/apigateway:1.0` | apigateway
`your-registry.azurecr.io/stickerapp/checkout:1.0` | checkoutService
`your-registry.azurecr.io/stickerapp/session:1.0` | sessionService
`your-registry.azurecr.io/stickerapp/stickers:1.0` | stickerService

The chart's `imageTag` value is used for these images. It defaults to `1.0` and
 can be overridden. You can build and push the images from the command line, e.g.
 for the sticker service:
```console
$ docker login your-registry.azurecr.io -u adminName -p password
$ cd stickerService
$ docker build -t your-registry.azurecr.io/stickerapp/stickers:1.0 .
$ docker push your-registry.azurecr.io/stickerapp/stickers:1.0
```

The user name and password for your registry can be found by going to the Azure Portal and selecting
the Access keys blade for your registry.

#### Preparing your Kubernetes cluster
* Install Tiller, Helm's server-side component:
  ```console
  $ helm init
  ```
* Deploy an ingress controller, if your cluster doesn't have one already:
  ```console
  $ helm install -f nginx-ingress-values.yaml --namespace kube-system stable/nginx-ingress
  ```
  * `nginx-ingress-values.yaml`, in this repository's `k8s` directory, contains
 settings which override the `nginx-ingress` chart's defaults to disable SSL
 redirecting and use a more recent controller image

* The app requires a Kafka cluster. You can deploy a small one with Helm:
  ```console
  $ helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
  $ helm install -n kafka --set Replicas=1 --set zookeeper.Servers=1 --set zookeeper.Storage="1Gi" incubator/kafka
  ```

#### Installing the chart
1. Open a shell in the `k8s` directory.
2. Generate the docker-registry secret Kubernetes will use to pull the app's
 images. The included script can do this:
    ```console
    $ node generate-dockercfg.js
    ```
3. The app is reachable through the ingress controller's external IP address. To find this, inspect the ingress controller's service in the Kubernetes UI,
 or use `kubectl` - this external IP address will be needed for configuring AAD in the next step. For example, for an ingress controller deployed as described above:
```console
$ kubectl get svc -l app=nginx-ingress --namespace kube-system
NAME                                            CLUSTER-IP     EXTERNAL-IP     PORT(S)                      AGE
awesome-narwhal-nginx-ingress-controller        10.0.190.16    52.173.17.217   80:32493/TCP,443:31437/TCP   40m
```

4. Additional steps are required to configure AAD which provides the ability for the end user to login and complete the sticker checkout process.  If you
choose NOT to configure this, the end user will be unable to complete the sticker checkout process when they are using the app, but the app will launch fine and
provide the ability to browse and add\view stickers in the cart.

Refer to the below section called AAD Setup, to create the required AAD resources and configure the app for email and facebook authentication.

5. Set required values in `values.yaml` (you can provide these on the command
 line with `--set` instead, if you don't mind a very long command line)

    required value | description
    --- | ---
    `azureActiveDirectory.clientId` | client ID for your Azure AD app
    `azureActiveDirectory.clientSecret` | secret for your Azure AD app
    `azureActiveDirectory.destroySessionUrl` | URL used to end AAD session
    `azureActiveDirectory.redirectUrl` | post-login redirect URL
    `azureActiveDirectory.tenant` | Azure AD tenant
    `registry` | Docker registry, e.g. `your-registry.azurecr.io`
    `dockercfg` | docker-registry secret
    `kafkaBroker` | DNS name and port of a Kafka broker
    `zookeeperConnect` | DNS name and port of a ZooKeeper instance

  IMPORTANT:
  * The azureActiveDirectory setting values are retrieved via the Azure Portal after you have configured the B2C Tenant as described in bullet #4 above.  Specifically, click on the B2C Tenant to open it; then click on the Azure AD B2C Settings tile on the main section of the page.
  * In the Azure Portal for the B2C Tenant, update the Application's Reply URL to the external IP address of the cluster's ingress controller to: https://<ingress controller IP>/users/auth/return.

6. Collect the chart's dependencies:
    ```console
    $ helm dependency update stickerapp
    ```

7. Install the chart:
    ```console
    $ helm install stickerapp
    NAME:   honest-deer
    ...
    ```

#### Verifying the deployment
You can inspect the deployment with the Kubernetes UI, `helm`, or `kubectl`:
```console
$ helm status honest-deer
LAST DEPLOYED: Mon Jun  5 15:00:38 2017
NAMESPACE: default
STATUS: DEPLOYED

RESOURCES:
 ...

$ kubectl get all -l release=honest-deer
NAME                                         READY     STATUS    RESTARTS   AGE
po/honest-deer-apigateway-1160103434-9q3vr   1/1       Running   0          7m
po/honest-deer-checkout-545275974-f2rt5      1/1       Running   0          7m
po/honest-deer-session-1173111989-x7x37      1/1       Running   0          7m
 ...
```

#### Modifying the running app
Like any Kubernetes app, you can control this one with `kubectl`. For
example, scaling the `apigateway` deployment to add a second pod:
```
$ kubectl get deploy -l component=apigateway
NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
honest-deer-apigateway   1         1         1            1           9m
$ kubectl scale --replicas=2 deploy/honest-deer-apigateway
deployment "honest-deer-apigateway" scaled
$ kubectl get deploy -l component=apigateway
NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
honest-deer-apigateway   2         2         2            2           10m
```

#### Further reading
* [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
* [Using Helm](https://docs.helm.sh/using_helm/#helm-usage)

## Deployment Option #3: Deploying to Kubernetes with Jenkins CI Pipeline
The steps in this section describe how to use Jenkins to setup a CI pipeline for the Sticker App.  Specifically, each time that the pipeline runs, the following steps will be performed:
1. Docker images are created for each of the app's microservices
2. The Docker images are pushed to the Azure Container Registry
3. The app's microservices are deployed using the images stored in the Azure Container Registry via Kubernetes\Helm
4. A test environment is deployed and mocha integration tests run to verify the app
5. If the integration tests pass, a production environment is deployed

A few additional points to note:
* If the app has never been installed, the pipeline will perform a clean install
* If the app has been installed before, the pipeline performs an upgrade of the app
* The pipeline can be triggered to run with each change that is pushed to the GitHub repo (optionally, the pipeline may be manually triggered to make the pipeline easier to run)

#### Prerequisites
Ensure that these resources have been created (if they haven't already):

1.   Create an Azure VM with Jenkins installed (these instructions assume that the Jenkins server will be installed outside of the Kubernetes cluster).  To create a Jenkins VM, follow the [quick start](https://docs.microsoft.com/en-us/azure/jenkins/install-jenkins-solution-template). 

In the below steps, you will connect to the Jenkins VM using two different mechanisms:
a.) SSH into the machine so that you can run CLI commands; this requires that you specify a public key when you configure the Jenkins VM so that you can connect to it from your local dev box via bash.  This requires that there be an SSH public key that is stored in the ~/.ssh folder on your dev box.
b.) Open the Jenkins dashboard via the browser so that you can setup the pipeline script; this requires that you either forward port 8080 to your local machine or to allow a remote connection to the Jenkins VM using port 8080.  
* To forward the port, follow instructions mentioned in the Jenkins setup above so that you can access the Jenkins' dashboard using http://localhost:8080.  
* Or, to allow a remote connection to the Jenkins VM, add an Inbound Security Rule to the Jenkins Network Security Group that allows HTTP connections using port 8080 - this will allow you to access Jenkins' dashboard using http://<Jenkins_IP_Address>:8080.

2.  A private Docker registry. Follow the Azure Container Registry [getting started guide](
  https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal)
  to create one.

3.  A Kubernetes cluster. 
  
  To create the cluster, ensure that you run the following command (from a bash on your local dev box) so that the public key and user name are configured according to what the these instructions are assuming - this requires that you have a local SSH public key stored in the ~/.ssh folder on your dev box:
  ```
  RESOURCE_GROUP=my-resource-group
  DNS_PREFIX=some-unique-value
  CLUSTER_NAME=any-acs-cluster-name

  az acs create \
  --orchestrator-type=kubernetes \
  --resource-group $RESOURCE_GROUP \
  --name=$CLUSTER_NAME \
  --dns-prefix=$DNS_PREFIX \
  --ssh-key-value ~/.ssh/id_rsa.pub \
  --admin-username=azureuser \
  --master-count=1 \
  --agent-count=5 \
  --agent-vm-size=Standard_D1_v2
  ```

  Refer the Azure Container Service [walkthrough](https://docs.microsoft.com/en-us/azure/container-service/container-service-kubernetes-walkthrough) for further details.  

* Deploy an ingress controller to your cluster:
  ```console
  $ helm install -f nginx-ingress-values.yaml --namespace kube-system stable/nginx-ingress
  ```
  * `nginx-ingress-values.yaml`, in this repository's `k8s` directory, contains
 settings which override the `nginx-ingress` chart's defaults to disable SSL
 redirecting and use a more recent controller image

* The app requires a Kafka cluster. You can deploy a small one with Helm:
  ```console
  $ helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
  $ helm install -n kafka --set Replicas=1 --set zookeeper.Servers=1 --set zookeeper.Storage="1Gi" incubator/kafka
  ```

#### Jenkins VM setup
Complete the following instructions once you have the Jenkins VM setup.

0.  Install Docker and Kubectl
* Docker
  SSH into the Jenkins VM from your local dev machine and follow these instructions: https://docs.docker.com/cs-engine/1.13/#install-on-ubuntu-1404-lts-or-1604-lts
  Then run the folowing commands to configure Docker permissions to allot the Jenkins endpoint to be accessed and to verify that Docker is running properly: 

  ```
  $ sudo chmod 777 /run/docker.sock 
  $ sudo docker info
  ```
* Kubectl
  SSH into the Jenkins VM from your local dev machine and run the following commands:
  ```
  curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
  chmod +x ./kubectl
  sudo mv ./kubectl /usr/local/bin/kubectl
  ```
  Next, from your local dev machine (not on the Jenkins VM), run the folowing commands to copy the 'kubectl' config file to the Jenkins machine so that Jenkins jobs have access to the Kubernetets cluster. 
  ```
  export KUBE_MASTER=<your_cluster_master_fqdn>
  export JENKINS_USER=<your_jenkins_user>
  export JENKINS_SERVER=<your_jenkins_public_ip>
  sudo ssh $JENKINS_USER@$JENKINS_SERVER sudo mkdir -m 777 /home/$JENKINS_USER/.kube/ \
  && sudo ssh $JENKINS_USER@$JENKINS_SERVER sudo mkdir /var/lib/jenkins/.kube/ \
  && sudo scp -3 -i ~/.ssh/id_rsa azureuser@$KUBE_MASTER:.kube/config $JENKINS_USER@$JENKINS_SERVER:~/.kube/config \
  && sudo ssh -i ~/.ssh/id_rsa $JENKINS_USER@$JENKINS_SERVER sudo cp /home/$JENKINS_USER/.kube/config /var/lib/jenkins/.kube/config \
  ```

  * Helm
  SSH into the Jenkins VM from your local dev machine and follow these instructions: https://docs.helm.sh/using_helm/#installing-helm
  that the Helm
 client is on your path. See the [Helm quickstart guide](https://docs.helm.sh/using_helm/)
 for instructions.

 ####Jenkins Pipeline Setup
The below steps require that you navigate to the Jenkins dashboard via the browser.

1. Install required plug-ins if they are not already installed.
* NodeJS (configure this to install both npm and Mocha; go to Jenkins->Global Tool Configuration under the NodeJS installations section)
* GitHub (should be installed by default)

2. Add credentials required by the pipeline script.
Go to Credentials->System, create the following credentials using the IDs outlined below:
* Kind: Username with password, ID: AAD 
  - Stores the AAD client and secret needed by the Sticker App to authenticate users of the app.
* Kind: Username with password, ID: ACR
  - Stores the Azure Container Registry user id and secret needed to deploy images to the registry.
* Kind: Secret text, ID: DOCKER
  - Stores the Docker secret that is needed by Kubernetes to deploy images from the registry.
* Kind: Secret text, ID: AIKEY
  - Stores the App Insights instrumentation key that is needed for logging.

3. Create the pipeline and add the script.
To do this, under New Item, enter a name and choose to create Pipeline.
In the pipeline's configuration, save the following changes:
* In the General section, check the GitHub project and add the url to the Sticker App repo.
* In the Build Triggers section, check the GitHub hook trigger for GITScm polling.
* In the Pipeline section, add the jenkins-script\ci-pipeline.groovy script located within Sticker App repo.  You can either copy and paste the script into Jenkins or configure to load the script from SCM.  
* Modify the env vars used within the script:
  - ACR_NAME (Azure container docker registry where the images are pushed\pulled from, e.g. <containername>.azurecr.io)
  - KAFKA_BROKER (DNS name of the kafka broker with port, e.g. "kafka:9092")
  - ZK_CONNECT (DNS name of a zookeeper instance with port, e.g. "zookeepr:2181")
  - INGRESS_IP (IP address of nginx ingress controller)
  - PROD_RELEASE (Release name for the production version of the app)
  - TEST_RELEASE (Release name for the test version of the app)
  - AAD_TENANT (Name of the AAD tenant used for the app's B2C authentication, e.g. <tenantname>.onmicrosoft.com)

4. Run the pipeline script.
There are 2 ways to trigger the pipeline script to run.
* You can push a change to GitHub.  Note that this requires you to add a webhook to Jenkins within GitHub's settings.
  In GitHub, under the repo's settings, select Integrations & services.  Choose to Add a service and select Jenkins (GitHub plugin).  In the Jenkins hook url field,
  specify the url to your Jenkins VM followed by "/github-webhook".  For example: http://<IP>:8080/github-webhook/.  Ensure that the Active checkbox is checked.
* Or, within Jenkins, you can click the Build Now link.

## AAD Setup
The app's authentication service is implemented as part of the API Gateway and supports both basic email and facebook authentication by using Azure AAD B2C.  

From the end user's perspective, the app provides a login link that when clicked, redirects to Azure's sign in\up page.  This page allows the user to sign in using either an AAD email account or using their Facebook account. Similarly, if the user doesn't have an account, they may choose to sign up.  Lastly, AAD B2C also easily supports resetting passwords as needed.

The API Gateway acts as the primary entry point into the server by providing a wrapper over all calls to the microservices' endpoints.  The advantage of this approach is:

* The gateway is responsible for ensuring that the user is authenticated before it calls into each microservice; this way, none of the microservices themselves need to worry about authenticating the user.

* The microservices' endpoints are not exposed publicly; only the API Gateway is able to access these endpoints which helps make the server more secure.

The auth service is implemented using Passport and Passport-Azure-AD npm packages.

To configure AAD, follow these steps - this is required in order to log in\log out of the app and to complete a sticker order:

1. [Get an Azure AD B2C tenant](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-get-started)

2. [Register the Sticker App with AAD B2C](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-app-registration)
* Note that the Reply URL will also need to be updated; refer to steps described in the above sections for the deployment option that you selected.

3. [Create policies](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-reference-policies#create-a-sign-up-policy)
* Specifically, follow steps to create two policies: (1) "Sign-up or sign in" policy and (2) "Password reset policy"

In addition, refer to the 'Create an application' and 'Create your policies' sections that are included [here](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-devquickstarts-web-node)

4. [Configure Facebook with your AAD tenant](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-setup-fb-app)

## Troubleshooting
1.) To troubleshoot runtime issues:
* Launch the app in Chrome and open Chrome's developer tools; look at errors\messages written to both the Network and Console tabs.

2.) To troubleshoot deployment issues:
* Open the Kubernetes dashboard; specifically, run the "kubectl proxy" command, then in the browser, navigate to "http://localhost:8001/ui"
* Refer to the Pods tab to view the status of pods created; click into each one to view detailed issues and to access console log

3.) Common deployment errors:
a. "Unable to mount volumns for pod...: timeout expired waiting for volumes to attach/mount for pod...Error syncing pod, skipping..."
  * This is especially common when deploying Kafka\Zookeeper; give the pods up to 10 minutes to mount the storage volume and spin up the container
b. "Failed to pull image <your image path>...image <your image path> not found"  
  Ensure you have completed the following steps properly:
  * The registry parameter in the values.yaml is set to valid value for the container register that you specified when building\pushing images
  * The imageTag parameter in the values.yaml is set to a valid value for an image that you built
  * Ensure that you have generated the docker-registry secret that Kubernetes will use to pull the app's; verify that the dockercfg paremeter in the values.yaml is set to ths value
c. "Failed to acquire lease while creating disk '<vhd name>.vhd' using blob with URI https://...vhd. Blob is already in use."
  * Run: kubectl delete pv,pvc --all
d. If you get into a bad state where you need to start over from scratch, you can delete all related deployment resources by running this command: kubectl delete po,deploy,svc,statefulset --all 