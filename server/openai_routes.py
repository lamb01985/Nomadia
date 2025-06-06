from fastapi import APIRouter, HTTPException
import openai
import os
from schemas import ItineraryRequest
from dotenv import load_dotenv
import json
import time
import re
import boto3
import requests
from botocore.exceptions import NoCredentialsError
from PIL import Image
from io import BytesIO
from geocoding_route import get_coordinates_from_google


router = APIRouter()
load_dotenv(dotenv_path="openai.env")
load_dotenv(dotenv_path="aws.env")
load_dotenv(dotenv_path="unsplash.env")

openai.api_key = os.getenv("OPENAI_API_KEY")

# S3 setup
S3_BUCKET = os.getenv("S3_BUCKET")
S3_REGION = os.getenv("AWS_REGION")

# Unsplash setup
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


@router.post("/api/itinerary")
async def generate_itinerary(data: ItineraryRequest):
    prompt = (
        f"Create a daily travel itinerary for a trip to {data.destination} "
        f"from {data.start_date} to {data.end_date} with a {data.vibe} vibe. "
        "Each day should include a 'plan' (a paragraph) and a 'places' array. "
        "Each place must be an object with: 'name', 'type', and 'address' (street address with city and country). "
        "Only include places that exist in the real world and are recognizable by Google Maps."
        "Do not invent locations. Use real cities, landmarks, or businesses found on Google Maps."
        'Respond ONLY with raw JSON like this: {"MM-DD-YYYY": {"plan": "...", "places": [...]}, ...}. '
        "Never include markdown, explanations, or introductions. If unsure, return an empty JSON object."
    )
    try:
        start = time.time()
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a highly precise travel planning assistant. "
                        "You only suggest places that exist in the real world and are recognizable by Google Maps. "
                        "You never invent addresses or businesses. "
                        "You must strictly follow formatting instructions in the user's message."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        )

        print("openAi response time:", time.time() - start, "seconds")

        content = response.choices[0].message.content.strip()

        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if not json_match:
            raise HTTPException(
                status_code=500, detail="No valid JSON found in OpenAi response"
            )

        cleaned = json_match.group(0)

        # Parse JSON
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="JSON decoding failed")

        if not isinstance(parsed, dict):
            raise HTTPException(status_code=500, detail="Expected a dictionary of days")

        days = []
        for date_str, day_data in sorted(parsed.items()):
            if "plan" not in day_data or "places" not in day_data:
                print(f"Missing keys in {date_str}: {day_data}")
                continue

            correct_places = []

            for place in day_data["places"]:
                coords = await get_coordinates_from_google(
                    place_name=place["name"],
                    place_type=place.get("type", ""),
                    place_address=place.get("address"),
                    destination=data.destination,
                )

                if coords:
                    place["gps_coordinates"] = coords
                else:
                    place["gps_coordinates"] = place.get(
                        "gps_coordinates", {"latitude": None, "longitude": None}
                    )
                correct_places.append(place)

            day_data["place"] = correct_places
            day_data["day"] = date_str
            days.append(day_data)

        return {"days": days, "cover_photo": None}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/cover-photo")
async def get_cover_photo(destination: str, vibe: str):
    print(f"received destination:{destination}")
    try:
        start = time.time()
        query = f"{destination}"
        print(f"unsplash query: {query}")

        # Search Unsplash for image
        search_url = "https://api.unsplash.com/search/photos"
        search_params = {
            "query": query,
            "per_page": 5,
            "orientation": "landscape",
            "client_id": UNSPLASH_ACCESS_KEY,
        }

        search_response = requests.get(search_url, params=search_params)
        search_data = search_response.json()

        if not search_data["results"]:
            print("No unsplash images found. Using fallback image")
            fallback_url = (
                "https://nomadia-data.s3.us-east-2.amazonaws.com/planeImage.jpg"
            )

            return {"cover_photo": fallback_url}

        images = search_data["results"]
        # Filter picture
        filtered_images = [
            img
            for img in images
            if destination.lower() in (img.get("alt_description") or "").lower()
            or destination.lower() in (img.get("description") or "").lower()
        ]
        selected_pool = filtered_images if filtered_images else images

        # loop images until one is wide enough
        chosen_image = None
        for img in selected_pool:
            image_url = img.get("urls", {}).get("full")
            if not image_url:
                continue

            try:
                response = requests.get(image_url)
                image_file = Image.open(BytesIO(response.content))
                width, height = image_file.size

                if width >= height * 1.2:
                    chosen_image = img
                    image_data = response.content
                    break

            except Exception as e:
                print(f"Skipping bad image: {e}")

        if not chosen_image:
            chosen_image = selected_pool[0]
            image_url = chosen_image.get("urls", {}).get("full")
            image_data = requests.get(image_url).content

        if chosen_image:
            image_id = chosen_image["id"]

        # Track Download image data (required by Unsplash)
        track_download_url = f"https://api.unsplash.com/photos/{image_id}/download"
        requests.get(track_download_url, params={"client_id": UNSPLASH_ACCESS_KEY})

        # Download image data
        try:
            image_data = requests.get(image_url).content
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to download image:{e}")

        filename = (
            f"cover_{destination.lower().replace(' ', '_')}_{int(time.time())}.jpg"
        )

        # Upload Image to S3
        try:
            s3.put_object(
                Bucket=S3_BUCKET,
                Key=filename,
                Body=image_data,
                ContentType="image/png",
            )
            s3_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{filename}"
        except NoCredentialsError:
            raise HTTPException(
                status_code=500, detail="AWS creditials not configured correctly."
            )

        print("Final S3 URL:", s3_url)
        print("Unsplash image time:", time.time() - start, "seconds")

        return {"cover_photo": s3_url}
    except Exception as e:
        print("Image generation error:", e)
        raise HTTPException(status_code=500, detail="Image generation failed")
