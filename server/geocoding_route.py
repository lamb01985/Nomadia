from dotenv import load_dotenv
import httpx
import os

load_dotenv(dotenv_path="geocoding.env")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


async def get_coordinates_from_google(
    place_name: str,
    place_type: str = "",
    place_address: str = "",
    destination: str = "",
):
    query = f"{place_name} {place_type} {destination} {place_address}".strip()

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": query,
        "key": GOOGLE_API_KEY,
        "components": f"locality: {destination}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

    if data.get("status") == "OK":
        location = data["results"][0]["geometry"]["location"]
        return {
            "latitude": location["lat"],
            "longitude": location["lng"],
        }

    return None
