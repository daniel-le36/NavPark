from flask import Flask, render_template, request
import numpy as np
import pandas as pd
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
import math
import sys

def distance_calc(p1,p2):
    return math.sqrt( ((p1[0]-p2[0])**2)+((p1[1]-p2[1])**2) )

cred = credentials.Certificate('./london-data-47d52-9a3084ff0912.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
parkingDataCollname = "ParkingSpotData"
dataColl = db.collection(parkingDataCollname)
latitudes = []
longitudes = []
groupIds = []

#Set up the classifier object to assign new coordinates to a group
groupCoords = db.collection(parkingDataCollname).stream()
for doc in groupCoords:
    #TODO:Check for empty dictionaries
    dictVal = doc.to_dict()
    if any(dictVal):
        latitudes.append(dictVal['Latitude']) 
        longitudes.append(dictVal['Longitude'])
        groupIds.append(dictVal['GroupId'])
coordArray = np.concatenate([np.array(latitudes).reshape(-1,1),np.array(longitudes).reshape(-1,1)],1)
#Dataframe to store values
df = pd.DataFrame(coordArray, columns = ['Latitude', 'Longitude'])
df['GroupId'] = groupIds
#classifier = KNeighborsClassifier(n_neighbors=1)
classifier = DecisionTreeClassifier().fit(coordArray, groupIds)
#classifier.fit(coordArray, groupIds)


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

@app.route('/get_parking',methods=['GET'])
def get_parking():
    #Get the request data: latitude and longitude
    requestData = request.args
    latitude = float(requestData["latitude"])
    longitude = float(requestData["longitude"])
    newCoords = np.array([latitude,longitude]).reshape(1,-1)
    #Use the model to predict what group the coordinate belongs in
    predicted_group = classifier.predict(newCoords)[0]
    
    #Get the coordinates within this group
    coordsInGroup = df.loc[df['GroupId'] == predicted_group]
    
    #Find the coordinate in the group with the smallest distance
    smallestDist = 10000
    smallestDistCoord = (0,0)
    for row in coordsInGroup.itertuples():
        distance = distance_calc((latitude,longitude),(row.Latitude,row.Longitude))
        if distance < smallestDist:
            smallestDist = distance
            smallestDistCoord = (row.Latitude,row.Longitude)
    return {"Parking_Coords":smallestDistCoord}
    
    
if __name__ == "__main__":

    app.run(debug=True)