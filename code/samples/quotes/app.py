from flask import Flask, render_template
import random

app = Flask(__name__)

QUOTES_FILENAME = "database/quotes.txt"

quotes = [line.rstrip('\n') for line in open(QUOTES_FILENAME)]

@app.route('/')
def index():
    quote = random.choice(quotes)
    return render_template('index.html', quote=quote)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000)
