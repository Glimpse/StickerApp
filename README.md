# Sticker E-Commerce Demo App

The Sticker App is composed of 4 different microservices, most of which are implemented in Node.JS, with the exception of one that is implemented using ASP .NET Core.  This app also uses the following technologies:
1.  React
2.  Express
3.  MongoDB
4.  MySQL
5.  Redis
6.  Kafka
7.  AAD
8.  App Insights

You have 3 options for deploying this app:

1.  Deploy locally Docker Compose; each microservice and their required storage resources (e.g. MongoDB, MySQL, and Kafka) will run in its own Docker container on your local developer machine.

2. Deploy the app to Azure Container Services using Kubernetes and Helm.  Specifically:
* Docker images are built and pushed to an Azure Container Registry.
* Kubernetes pulls the images from the registry and deploys the Docker containers to the cluster (each microservice and their required storage resources will run in its own Docker container on the cluster's nodes).
* An inginx ingress controller is deployed to the cluster exposes the app's public endpoint.

3. Deploy production and test versions of the app using Jenkins CI\CD Pipeline.  Specifically:
* The CI\CD Pipeline deploys the app as described in bullet #2 above.
* Mocha integration tests are run against the test version of the app.
* If the tests pass, the production version of the app is upgraded with no downtime for the end user.

## Running Locally
From the root of the Sticker App project, run the following command:
```console
$ docker-compose -f docker-compose.dev.yml up -d
```
Then open your browser to [http://localhost:3000](http://localhost:3000)

IMPORTANT: Additional steps are required to configure AAD which provides the ability for the end user to login and complete the sticker checkout process.  If you
choose NOT to configure this, the end user will be unable to complete the sticker checkout process when they are using the app, but the app will launch fine and
provide the ability to browse and add\view stickers in the cart.

Follow these steps to configure AAD:
1. Refer to the below section, called AAD Setup, to create the required AAD resources and configure the app for email and facebook authentication.
2. In the Azure Portal for the B2C Tenant that you created in the above step, update the Application's Reply URL to be "http://localhost:3000/users/auth/return".
3. Set the following values in the apigateway\debug.env file - these are retrieved via the Azure Portal.  Specifically, click on the B2C Tenant.  Once this opens, click on the Azure AD B2C Settings square on the main section of the page which will open detailed settings:
* AD_ClIENT_ID (set to the Application ID value for the Application)
* AD_CLIENT_SECRET (set to the generated Key value under the Application's Keys)
* AD_DESTROY_SESSION (update the url to include the name of your tenant)
* AD_TENANT (set to the name of your tenant)
4. Re-run the docker-compose command

As a result, the end user should now be able to click Log In to sign in\up using email or facebook.  The user should also be able to add stickers to the cart and checkout.  Finally, the user can Log Out of the app.

## Deploying to Kubernetes with Helm
This repository includes a chart for Helm, the package manager for Kubernetes, to
simplify deploying the application.

#### Prerequisites
* A private Docker registry. Follow the Azure Container Registry [getting started guide](
  https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal)
  to create one.
* A Kubernetes cluster. Follow the Azure Container Service [walkthrough](
  https://docs.microsoft.com/en-us/azure/container-service/container-service-kubernetes-walkthrough)
  to create one.

#### Preparing your local machine
* Ensure `kubectl` is configured for your cluster, and that the Helm
 client is on your path. See the [Helm quickstart guide](https://docs.helm.sh/using-helm)
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

3. Set required values in `values.yaml` (you can provide these on the command
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

4. Collect the chart's dependencies:
    ```console
    $ helm dependency update stickerapp
    ```

5. Install the chart:
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

The app is reachable through the ingress controller's external IP address. To
 find this, inspect the ingress controller's service in the Kubernetes UI,
 or use `kubectl`. For example, for an ingress controller deployed as described above:
```console
$ kubectl get svc -l app=nginx-ingress --namespace kube-system
NAME                                            CLUSTER-IP     EXTERNAL-IP     PORT(S)                      AGE
awesome-narwhal-nginx-ingress-controller        10.0.190.16    52.173.17.217   80:32493/TCP,443:31437/TCP   40m
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
* [Using Helm](https://docs.helm.sh/using-helm/#helm-usage)

## Deploying to Kubernetes with Jenkins CI Pipeline
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

* A private Docker registry. Follow the Azure Container Registry [getting started guide](
  https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal)
  to create one.

* A Kubernetes cluster. Follow the Azure Container Service [walkthrough](
  https://docs.microsoft.com/en-us/azure/container-service/container-service-kubernetes-walkthrough)
  to create one.

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
* Create an Azure VM with Jenkins installed (these instructions assume that the Jenkins server will be installed outside of the Kubernetes cluster).  To create a Jenkins VM, follow the [quick start](https://docs.microsoft.com/en-us/azure/jenkins/install-jenkins-solution-template).

Connect to the Jenkins VM and install the following:
1.) Docker
2.) Kubectl
3.) Helm

#### Jenkins VM setup
Once you have the Jenkins VM setup, log into the Jenkins web portal and perform the following configuration:

1. Install required plug-ins if they are not already installed.
* NodeJS (configure this to install both npm and Mocha; go to Jenkins->Global Tool Configuration under the NodeJS installations section)
* GitHub (should be installed by default)

2. Add credentials required by the pipeline script.
Go to Credentials->System, create the following credentials using the IDs outlined below:
* Kind: Username with password, ID: AAD 
  - Stores the AAD client and secret needed by the Sticker App to authenticate users of the app.
* Kind: Username with password, ID: DOCKER
  - Stores the Azure Container Registry user id and secret needed to push images to the registry.
* Kind: Secret text, ID: ACR
  - Stores the Docker secret that is needed by Kunernetes to deploy images from the registry.

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

2. [Register the app](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-app-registration)
* Note that the Reply URL will need to include the external IP address of the cluster's ingress controller, e.g. "https://<ingress controller IP>/users/auth/return"

3. [Create Sign Up\Sign In policies](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-reference-policies#create-a-sign-up-policy)

In addition, refer to the 'Create an application' and 'Create your policies' sections that are included [here](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-devquickstarts-web-node)

4. [Configure Facebook with your AAD tenant](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-setup-fb-app)

