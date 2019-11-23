from flask import Flask, render_template, request

import json



app = Flask(__name__,template_folder='template')



@app.route('/')

def home():

    return render_template('index.html')



@app.route('/', methods=['POST'])
def my_form_post():
    text = request.form['text']
    text2 = request.form['text2']
    return text + text2




if __name__ == "__main__":

    app.run(debug=True)
