# Dockerfile

A Dockerfile is a special text file, with it we can build images automatically. Inside a Dockerfile we can use a set of commands to shape the image as we need.

## Your version of the static website

On our last section, we learned how to execute some important commands to manage images and containers with Docker client. On this section, we will see how to automate some things.

Before we dive in a Dockerfile, let's see some steps to create our own version of the static website. Later on, we will automate the image creation in a Dockerfile. Shall we?

### Building the image

To build an image we are going to execute some of the commands we already know and a few new. Like I said before, don't worry too much about how difficult this can be because we are going to automate everything later on.

To create an image, first we need to choose a base, for this sample the base image will be _nginx:alpine_. I think I said before, but Alpine is a super light Linux distro.

Let's execute the base image on detached mode and set the container name as `my_static_website`, with the command below:

```bash
docker run --name my_static_website -d nginx:alpine
```

Now that we have the base image running, let's change the file _index.html_:

```bash
docker exec -it my_static_website sh
vi /usr/share/nginx/html/index.html
```

Change the contents of the file to something like this:

```html
<!DOCTYPE html>
<html>
<head><title>Welcome to my static website!<title>
<stype>
body {
  width: 35em;
  margin: 0 auto;
  font-family: Tahoma, Verdana, Arial, sans-serif;
}
</style>
</head>

<body>
  <h1>Welcome to my static website!</h1>
  <p><em>Thank you for visiting my website.</em></p>
</body>
</html>
```

Hit _i_ to start to change the file then _ESC (maybe a few times) and :x_ when you're done. Press _CTRL+D_ to exit the console and get back to our VM.

We are almost done. On the next step, we will need to commit our changes and we can do this by typing:

```bash
docker commit -m "<message>" -a "<firstname> <lastname>" my_static_website <DOCKER_HUB_USER>/my_static_website:latest
```
The final step is to push the modification to you Docker hub repository:

```bash
docker login --username=<DOCKER_HUB_USER>
docker push <DOCKER_HUB_USER>/my_static_website
```
To check your image, execute the following commands:

```bash
docker kill $(docker ps -qa)
docker rm $(docker ps -qa)
docker rmi $(docker images -qa)
docker run -p 4000:80 -d <DOCKER_HUB_USER>/my_static_website
```
Done. That's all we need to create an image. It was easy for you? I hope not.

#### Summary

On this section we learned how to create an image executing some Docker commands on the console. The steps that we followed are:

1. Execute in background the base image
2. Change it to your needs
3. Commit the changes
4. Push to Docker hub

[![Creating an image](https://asciinema.org/a/fXVCT7RS3KOOSvrLvP1NByuHu.png)](https://asciinema.org/a/fXVCT7RS3KOOSvrLvP1NByuHu)

#### Questions
1. Which is the option to rename a container before running it?
  * [A] -n
  * [B] --container 
  * [C] -r
  * [D] --name

2. Which is the command used to execute a binary inside a container?
  * [A] run
  * [B] exec 
  * [C] command
  * [D] ps

### Creating a Dockerfile

On the previous section we learned how to create an image by ourselves typing some commands on the terminal. Now, we are diving in the Dockerfile to automate the creation of the same image.

First, we will need to setup a few things. They are as follows:

1. A directory to store the Dockerfile
2. A _site_ directory to store the _index.html_
3. The _index.html_
4. A Dockerfile

The format of the Dockerfile basically follow the rule below:

```Dockerfile
# comment
INSTRUCTION arguments
```
#### FROM
This is the first instruction on a Dockerfile. All Dockerfiles must start with a `FROM` instruction. It will say which is the base image from which we are building.

#### LABEL
Used to add metadata information to an image. Basically, you will need a key and a value to set as a metadata.

#### COPY
This is the easiest one. It will copy the contents of a folder to another one.

#### EXPOSE
This instruction will tell Docker that the container listens on a port at runtime. Although, it will not make the port of the container available to access on the host, to do this we still need the _-p_ option.

#### WORKDIR
Sets the working directory for any of the instructions `RUN`, `CMD`, `ENTRYPOINT`, `COPY` and `ADD`. If the argument does not exist, it will be created.

#### VOLUME
Creates a volume with a mount point with the same name.

There is a lot more instructions available on the [Docker website](https://docs.Docker.com/engile/reference/builder/), but for our needs this is enough. I recommend you to check the other instructions when you have a chance.

Our `Dockerfile` will be similar to this one:

```Dockerfile
FROM nginx:alpine
LABEL maintainer="<firstname> <lastname> <<email>>"
WORKDIR /usr/share/nginx/html
COPY site .
EXPOSE 80
```
As you can see, we are saying to Docker:
1. The base image with the instruction `FROM`
2. The maintainer information with `LABEL`
3. The work directory inside the image using `WORKDIR`
4. To copy the contents of _site_ to work directory with `COPY`
5. The container listens on a port at runtime using `EXPOSE`

To finally build the image, execute on the commands on the same directory as the `Dockerfile`:

```bash
docker build -t my_new_static_website:latest .
```

To run it:

```bash
docker run -p 4000:80 -d my_new_static_website
```

To push to the Docker hub, now you can do like this:

```bash
docker tag my_new_static_website <DOCKER_HUB_USER>/my_new_static_website:latest
docker push <DOCKER_HUB_USER>/my_new_static_website
```

#### Summary

On this section we learned how to create an image using a Dockerfile and it's instructions.

[![Creating a Dockerfile](https://asciinema.org/a/MaUHoo2SZ7xAB6PdYPoVBVX9B.png)](https://asciinema.org/a/MaUHoo2SZ7xAB6PdYPoVBVX9B)

#### Questions

1. What is the name of the instruction to copy directory contents to an image?
  * [A] CP
  * [B] MOVE 
  * [C] COPY
  * [D] LINK

2. What is the name of the instruction to set the working directory inside an image?
  * [A] WORKDIR
  * [B] DIR 
  * [C] SET
  * [D] WORK

