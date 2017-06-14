# Sticker E-Commerce Demo App

**Running locally:**

```console
$ docker-compose -f docker-compose.dev.yml up -d
```

Then open your browser to [http://localhost:3000](http://localhost:3000)

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
1. Generate the docker-registry secret Kubernetes will use to pull the app's
 images. The included script can do this:
    ```console
    $ node generate-dockercfg.js
    ```

1. Set required values in `values.yaml` (you can provide these on the command
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

5. Collect the chart's dependencies:
    ```console
    $ helm dependency update stickerapp
    ```

1. Install the chart:
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
