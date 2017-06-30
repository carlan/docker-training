# Docker basics

### What is docker?

Almost every developer these days know there is _something_ called docker or at least heard the word docker before. But, do you really know what docker is? Isn't that complicated actually is pretty simple to understand.

Docker is a piece of software which aims to simplify the process of building, deploying and shipping applications and then running them in a controllable environment (sandbox).

The sandbox environment is called _container_ and this is really important to know.

### Containers

When I first heard the term container I thought about that huge rectangle box with lots of stuff inside it on a ship. If you think of it, it's kind of a standard way to ship stuff in a ship.

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

### Example 1: Hello world

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

### Example 2: Pulling images

To download images previously before run them, you can use the command below:

```bash
docker pull docker/whalesay
```

Now, try to run this image with the parameters below to see if docker will download it again:

```bash
docker run docker/whalesay cowsay <YOUR_NAME>
```
As you can see, no images were downloaded and you also got a whale saying your name as a gift.

### Example 3: Static site

I've created an image to show a clean and simple static website. While you are running this image, I'll show you some of the other docker commands. First, let's get the image.

Hummm. I can't remember it's name, just a sec let me look at my notes... I can't find it.

Well, we can try to search for my docker hub / docker cloud username to see if we can find it.

```bash
docker search carlancalazans
```
There it is! Let's run it.

```bash
docker run carlancalazans/static_site
```
Well, it's running. Running a container this way isn't good because we have a blocked terminal, we can't type any other command.

To fix this, hit _CTRL+C_ and add the _-d_ option on the command line:

```bash
docker run -d carlancalazans/static_site
```
This new option will run the container in background mode (detached). Now, we can execute some more commands. To get basic information from container, type:

```bash
docker ps
```
If you look at the name and think this is automatically generate. You are right!

Sometimes it's hard do remember the container name or reference it as the id, so let's rename it.

```bash
docker rename <ID> static_site
docker ps
```

Much better. To get information like how much memory and cpu usage, type:

```bash
docker stats static_site
```
To get some more information about the container formatted in json, type:

```bash
docker inspect static_site
```

Are you curious about what I'm using to serve the static website? Think for 10 seconds and type the command below:

```bash
docker top static_site
```
Did you get it right? This command will show us an output of the running proccess inside the container. It's very similar to _top_ from Linux. As a matter of fact, just type it on the terminal.

```bash
top
```
As you can see, this is a list of all proccess running on this virtual machine. _Hit q to exit_.

I wanna see some logs from the webserver, how about you? Yeah?

To get the logs from a container, execute the below in a terminal:

```bash
docker logs static_site
```
Until now, we don't even had a change to access the website. For this, we need to get port from the webserver. To see all the ports mapped to this container, type:

```bash
docker port static_site
```
Now, you can map a port on your virtual machine to access the website. I'll show you how to do this in person.

Well, that's finish this example.

We are leaving some container and images behind. Let's clean all up before finish.

To kill the process of a running container, just type:

```bash
docker kill static_site
docker ps
```
Nice! The container isn't running anymore. To remove it, do like this:

```bash
docker rm static_site
docker ps -a
```
Good! We don't have any container, let's delete the image with:

```bash
docker rmi carlancalazans/static_site
```
Very good. I'll talk to you again on the next example.

### Example 4: TBA
