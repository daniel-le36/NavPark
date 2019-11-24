from flask import Flask, render_template, request

import json



app = Flask(__name__)



@app.route('/')

def home():

    return render_template('home.html')



@app.route('/newStuff', methods=['POST'])
def newStuff():
	requestData = request.get_json() 
	latitude = int(requestData["latitude"])
	longitude = int(requestData["longitude"])
	return {"newSum":longitude+latitude}

if __name__ == "__main__":

    app.run(debug=True)