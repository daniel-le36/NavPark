# NavPark
Find the nearest parking spot for your Google Maps destination in London, Ontario. 

## How It Works
Beforehand, coordinate data for parking lots and on-street parking with parking meters in London are imported from the city's open data portal. Using the SkLearn library, the coordinates are then classified into 100 groups based on proximity to each other using the K-means clustering algorithm. Using the newly classified data, a model is then created with this data using the K-nearest neighbours algorithm so when given a new set of coordinates, the corresponding group can be derived from this model. Now when a user enters in their destination, the coordinates of the destination are inputted into this model which returns which group of coordinates the destination is classified under. The coordinates within this group are then retrieved and the Google Maps API is returned the coordinates of the nearest parking spot to it. Using this new coordinate, Google Maps displays a route driving to the parking spot and from there, walking to the original destination.

## Technology Used
- Flask
- Python
- SkLearn
- Cloud FireStore
- Javascript
- Google Maps API
