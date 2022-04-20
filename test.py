import requests
import pprint

body = {
    '0':['lastName=Usman','firstName=Kamaru'],
    '1':['lastName=McGregor','firstName=Conor'],
    '2':['draws=4','losses=3'],
}
res = requests.post('http://ec2-3-84-185-93.compute-1.amazonaws.com:3000/fighter/', data=body)
pprint.pprint(res.json())


params = {
    'wins': '2',
    'firstName': 'John',
}
resp = requests.post('http://ec2-3-84-185-93.compute-1.amazonaws.com:3000/fighter/',params=params)
text = resp.json()
pprint.pprint(text)

params = {
    'firstName': 'Georges',
    'lastName': 'St-Pierre',
}
resp = requests.get('http://ec2-3-84-185-93.compute-1.amazonaws.com:3000/fighter/',params=params)
text = resp.json()
pprint.pprint(text)