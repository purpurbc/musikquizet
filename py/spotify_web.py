#import requests
import json
from pyodide.http import pyfetch, FetchResponse
from typing import Optional, Any
import asyncio

async def request(url: str, method: str = "GET", body: Optional[str] = None,
                  headers: Optional[dict[str, str]] = None, **fetch_kwargs: Any) -> FetchResponse:
    
    kwargs = {"method": method, "mode": "no-cors"}  # CORS: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
    if body and method not in ["GET", "HEAD"]:
        print("body",body)
        kwargs["body"] = body
    if headers:
        kwargs["headers"] = headers
        print("header",headers)
    kwargs.update(fetch_kwargs)
    print("fhjs")
    response = await pyfetch(url, **kwargs)
    return response


# Replace with your own Spotify API client ID and client secret
CLIENT_ID = 'c69fdbfb0e20482b85142fb997c14208'
CLIENT_SECRET = '05a7149bd02f428ea83927bfa0104181'
week = 7
year = 2023
categories = ['Intro(Storstäder)', 'Splash', 'Singles Night', 'Greedy', 'Elements', 'Roadtrip']
songs_per_category = [8,8,6,6,8,8]
num_songs = sum(songs_per_category)

# Kategori https://open.spotify.com/playlist/68alwoOYLRoobdjq4eesrC?si=e200fd801e5a4307
playlist_url_v7 = 'https://open.spotify.com/playlist/3HzbmfKUAjuOZUMA6P4F6q?si=91c7536e081f4f31'
playlist_url_v3 = 'https://open.spotify.com/playlist/0fAuoyKg2VVHl5rY8vexui?si=449e395dade94d2d'


async def main():
    #OLD
    # Authenticate with Spotify API and get access token
    auth_response = await request(  url = 'https://accounts.spotify.com/api/token', 
                                    method = "POST", 
                                    body = json.dumps({
                                        'grant_type': 'client_credentials',
                                        'client_id': CLIENT_ID,
                                        'client_secret': CLIENT_SECRET,}),
                                    headers={"Content-Type": "application/json"})
    print("hfjsh")
    print(auth_response)
    auth_response_data = auth_response.json()
    access_token = auth_response_data['access_token']

    # Get playlist ID from Spotify playlist URL
    playlist_url = playlist_url_v3 # input("Enter Spotify playlist URL: ")
    playlist_id = playlist_url.split('/')[-1]

    # Get playlist data from Spotify API
    playlist_response = await request(f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks', method="GET", headers={'Authorization': f'Bearer {access_token}'})
    playlist_data = json.loads(playlist_response.bytes())
    json_pretty_data = json.dumps(playlist_data, indent=4)


    """# Open a text file in write mode
    with open("data.txt", "w") as file:
        # Write the JSON string to the file
        file.write(json_pretty_data)
    # Close the file
    file.close()"""



    #with open("data.txt", mode="w", encoding="utf-8") as file:

    category, song = 0, 0
    print(f'Facit MQ v.{week} ({year})\n\n')
    print(f'Kategori {category+1}: {categories[category]}: {songs_per_category[category]*2}p')

    # Print each track's name and artist
    for i, track in enumerate(playlist_data['tracks']['items']): 
        
        track_name = track['track']['name']
        track_artists = ', '.join([artist['name'] for artist in track['track']['artists']])
        print(f'\n{song+1}. {track_name} - {track_artists}')

        song += 1

        if song == songs_per_category[category] and category is not len(songs_per_category)-1: 
            print(f'\n\nKategori {category+2}: {categories[category]}: {songs_per_category[category+1]*2}p')
            song = 0
            category += 1

    print(f'\n\nMAXPOÄNG:{num_songs*2}')

    #file.close()

asyncio.ensure_future(main())

"""if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        pass"""