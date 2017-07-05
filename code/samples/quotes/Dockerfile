FROM python:alpine
MAINTAINER Carlan Calazans <carlancalazans@gmail.com>
WORKDIR /usr/src/app
RUN mkdir templates database
COPY requirements.txt .
COPY app.py .
ADD templates templates
ADD database database
COPY entrypoint.sh .
RUN pip install --no-cache-dir -r requirements.txt
RUN chmod +x entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["sh", "entrypoint.sh"]
