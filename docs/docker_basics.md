# Docker basics

### What is docker?

Almost every developer these days know there is _something_ called docker or at least heard the word docker before. But, do you really know what docker is? Isn't that complicated actually is pretty simple to understand.

Docker is a piece of software which aims to simplify the process of building, deploying and shipping applications and then running them in a controllable environment (sandbox).

The sandbox environment is called _container_ and this is really important to know.

### Containers

When I first heard the term container I though about that huge rectangle box with lots of stuff inside it on a ship. If you think of it, it's kind of a standard way to ship stuff in a ship.

Well, containers in docker are very similar. A container is a stardard way to ship your code to different environments.

A running instance of an image is also know as a container.

### Images

As we just saw, an image is the basis of a container, a blueprint to get a container running. An image is built to be used in a container. Also, an image doesn't have a state and it never changes.

If you want to run a Java application, you'll need an operation system like Ubuntu or Windows, and you'll also need the Java installed in the image to run your application.

### Docker client

Docker ships with a client which is used to _put stuff in a container_, _load containers in ships_, _remove containers from ships_ and so on.

It's how we interact with images and containers, actually a little more than that.

## Hands-on

### Available commands

To check the available commands within the docker binary you can type either:

```bash
docker -h
```
OR
```bash
docker
```

### Hello world

The guys from docker built a hello world image to test our docker installation and understand the basics of it.

Type this in the terminal:

```bash
docker run hello-world
```

You'll see that docker downloaded an image, built a container based on that image and then ran it.

To see the downloaded image you can type:

```bash
docker images
```

If you didn't see the part of _building a container based on the image_ it's fine. We still can check if it's true doing:

```bash
docker ps
```
Hummm. Got nothing? Try with _-a_ option from ALL (running and stopped containers):

```bash
docker ps -a
```
Now, you see it.

So, if the container is still running it's possible to see it with just the _ps_ without the option "-a", 
but if the container is stopped we have to include the "-a" option. Or, you can do it like me run the command with the "-a" 
option all the time.

If you are like me, there still a question to ask. Where the _hello world_ image is stored?

Well, docker offers us a hub to store the images. This hub can be found on the address [https://hub.docker.com](https://hub.docker.com).
The image can be found on [this address](https://hub.docker.com/_/hello-world/).

### Pulling images

To download images previously before run them, you can use the command below:

```bash
docker pull docker/whalesay
```

Now, try to run this image with the parameters below to see if docker will download it again:

```bash
docker run docker/whalesay cowsay <YOUR_NAME>
```
As you can see, no images were downloaded and you also got a whale saying your name as a gift.



