# UFC-Fighter-API

An API containing statistics on current and old UFC fighters. These include
success rates, strike percentages and more.

## Acknowledgements

 - [UFC Stats](http://ufcstats.com/statistics/fighters?char=a)

## Documentation

To access endpoints visit http://ec2-3-84-185-93.compute-1.amazonaws.com:3000/fighter/
### API Reference

#### Get all fighter listings

```http
  GET /fighter?firstName=${fname}&lastName=${lname}
```

| Parameter  | Type     | Description                |
| :--------  | :------- | :------------------------- |
| `fname`    | `String` | Empty first name input     |
| `lname`    | `String` | Empty last name input      |


#### Get a specific fighter

```http
  GET /fighter?firstName=${fname}&lastName=${lname}
```
| Parameter  | Type     | Description                       |
| :--------  | :------- | :-------------------------        |
| `fname`    | `String` | **Required.** First name fighter  |
| `lname`    | `String` | **Required.** Last name of fighter|


#### Get a list of fighters matching a set of attributes (see 'Usage/Examples'). 

```http
  GET /fighter?losses=${ls}&wins=${ws}
```
| Parameter  | Type      | Description                         |
| :--------  | :-------  | :-------------------------          |
| `ls`       | `Integer` | Losses suffered throughout career   |
| `ws`       | `Integer` | Wins accumulated throughout carrear |


#### Pass in multiple fighters and or attributes to get back list of matching items. 

```http
  GET /fighter
  
  //Request Body

  '0':['lastName=St-Pierre','firstName=Georges'],
  '1':['firstName=Justin','lastName=Gaethje'],
  '2':['draws=1','losses=3'],
```
This will return three results: one for the fighter Georges St-Pierre a second for 
Justin Gaethje and a third for all fighters with one win and one loss. Note any 
action completed with the GET endpoint can also be accomplished with the POST. Lastly, if 
if multiple fighters are returned for one first-name last-name pairs, consider specifying
a weight as this means the fighter has fought in two different weight classes.  
### Usage/Examples

### All Parameters
| Parameter  | Type      | Description                                                      |
| :--------  | :-------  | :-------------------------                                       |
| `firstName`| `String`  | First name of fighter                                            |
| `lastName` | `String`  | Last name of fighter                                             | 
| `wins`     | `Integer` | Accumulated careeer wins                                         | 
| `losses`   | `Integer` | Accumulated careeer losses                                       | 
| `draws`    | `Integer` | Accumulated careeer draws                                        | 
| `height`   | `Double`  | Height of fighter in feet and inches entered as a decimal pair   | 
| `weight`   | `Integer` | Weight of fighter in pounds                                      | 
| `reach`    | `Double`  | Reach of fighter in inches                                       | 

#### Get statistics on a fighter based on first name and last name
```python
import requests
import pprint 

params = {
    'firstName': 'Georges',
    'lastName': 'St-Pierre',
}
resp = requests.get('http://ec2-3-84-185-93.compute-1.amazonaws.com:3000/fighter/',params=params)
text = resp.json()
pprint.pprint(text)
```

#### Get a set of data matching parameter inputs
```python
import requests
import pprint 

params = {
    'wins': '2',
    'firstName': 'John',
}
resp = requests.get('http://ec2-3-84-185-93.compute-1.amazonaws.com:3000/fighter/',params=params)
text = resp.json()
pprint.pprint(text)
```

#### Get muliple lists of data matching respective input parameter sets.
```python
import requests
import pprint

body = {
    '0':['lastName=Usman','firstName=Kamaru'],
    '1':['lastName=McGregor','firstName=Conor'],
    '2':['draws=4','losses=3'],
}
res = requests.post('http://ec2-3-84-185-93.compute-1.amazonaws.com:3000/fighter/', data=body)
pprint.pprint(res.json())
```
