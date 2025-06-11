import requests
import random
from urllib import parse
from rich import print, inspect
from schemas import PlaceOut

url_base = "http://maps.googleapis.com/maps/api/staticmap?"
apiKey = "&key=AIzaSyAZrat4CnOLXL89hfWiha1rHPypVfhvLjY"
# https://maps.googleapis.com/maps/api/staticmap?center=48.846943,%202.337222%20&zoom=13&size=300x300&maptype=roadmap%20&markers=color:blue%7Clabel:A%7C48.860294,2.338629%20&markers=color:green%7Clabel:B%7C48.846943,%202.337222%20&key=AIzaSyAZrat4CnOLXL89hfWiha1rHPypVfhvLjY


def get_map(places: list[PlaceOut]):
    try:
        markers = get_marker(places)
        center = get_center(places[0])
        url = url_base + center + "&size=300x300&maptype=roadmap%20" + markers + apiKey
        return url
    except Exception as e:
        inspect(e)
        return None


def get_center(place: PlaceOut):
    lat = place.lat
    lng = place.lng
    center = f"center={lat},%20{lng}%20"
    return center


def get_marker(places: list[PlaceOut]):
    markers = ""
    colors = [
        "black",
        "brown",
        "green",
        "purple",
        "yellow",
        "blue",
        "gray",
        "orange",
        "red",
        "white",
    ]
    for place in places:
        curr_color = random.choice(colors)
        label = place.name[0]
        lat = place.lat
        lng = place.lng
        marker = f"&markers=color:{curr_color}%7Clabel:{label}%7C{lat},{lng}%20"
        markers += marker
    return markers
