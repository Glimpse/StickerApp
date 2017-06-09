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
  * This chart does not work with `minikube` due to persistent volume permission
    issues ([minikube #956](https://github.com/kubernetes/minikube/issues/956)).
* The Helm client on your local machine, and Tiller installed on your cluster.
  See the [Helm quickstart guide](https://docs.helm.sh/using-helm) for instructions.

#### Installing the chart
1. Build the app's images and push them to your registry. The chart expects these
images, where `your-registry.azurecr.io` is your private registry:

    image name | source directory
    --- | ---
    your-registry.azurecr.io/stickerapp/apigateway:v1 | apigateway
    your-registry.azurecr.io/stickerapp/checkout:v1 | checkoutService
    your-registry.azurecr.io/stickerapp/session:v1 | sessionService
    your-registry.azurecr.io/stickerapp/stickers:v1 | stickerService

  You can build these from the command line, e.g. for the sticker service:
  ```
  $ docker login your-registry.azurecr.io -u adminName -p password
  $ cd stickerService
  $ docker build -t your-registry.azurecr.io/stickerapp/stickers:v1 .
  $ docker push your-registry.azurecr.io/stickerapp/stickers:v1
  ```
2. Open a command prompt to the `k8s` directory.
1. Generate docker configuration with the provided script:
```
$ node generate-dockercfg.js
```

4. Edit `values.yaml`. Populate the `dockercfg` field with the script's output,
and the `registry` field with your registry's url, e.g. `your-registry.azurecr.io`.

1. Add the Incubator repo to Helm:
```
$ helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
```

6. Collect the chart's dependencies:
```
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

$ kubectl get all -l app=stickerapp
NAME                                         READY     STATUS    RESTARTS   AGE
po/honest-deer-apigateway-1160103434-9q3vr   1/1       Running   0          7m
po/honest-deer-checkout-545275974-f2rt5      1/1       Running   0          7m
po/honest-deer-session-1173111989-x7x37      1/1       Running   0          7m
 ...
```

The deployment will take several minutes. When it completes, the app's API gateway
will be exposed at a public IP. You can retrieve this IP from the Kubernetes UI,
or `kubectl`:
```console
$ kubectl get svc -l=component=apigateway
NAME                       CLUSTER-IP     EXTERNAL-IP      PORT(S)             AGE
honest-deer-apigateway     10.0.193.70    40.112.209.189   80:32517/TCP        7m
```

#### Modifying the running app
Like any other Kubernetes app, you can control this one with `kubectl`. For
example, scaling the `apigateway` deployment to add a second pod:
```
$ kubectl get deploy -l component=apigateway
NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
honest-deer-apigateway   1         1         1            1           9m
$ kubectl scale --replicas=2 deploy/honest-deer-apigateway
deployment "honest-deer-apigateway" scaled
$ kubectl get deploy -l=component=apigateway
NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
honest-deer-apigateway   2         2         2            2           10m
```

#### Further reading
* [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
* [Using Helm](https://docs.helm.sh/using-helm/#helm-usage)
