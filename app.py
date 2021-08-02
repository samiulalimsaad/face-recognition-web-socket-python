import asyncio
import io
import json

import cv2
import face_recognition
import numpy as np
import websockets
from PIL import Image

# Load a second sample picture and learn how to recognize it.
biden_image = face_recognition.load_image_file("biden.jpg")
biden_face_encoding = face_recognition.face_encodings(biden_image)[0]

# Create arrays of known face encodings and their names
known_face_encodings = [
    biden_face_encoding
]
known_face_names = [
    "Joe Biden"
]


async def time(websocket, path):
    process_this_frame = True
    while True:

        message = await websocket.recv()
        print(message)
        print(f"We got message from the client!")
        # Image.open(io.BytesIO(message)).show()
        frame = cv2.imdecode(np.frombuffer(message, np.uint8), -1)
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

        rgb_small_frame = small_frame[:, :, ::-1]

        if process_this_frame:

            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

            face_names = []

            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                name = "Unknown"

                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]

                face_names.append(name)
            x = {
                "position": face_locations,
                "name": face_names
            }
            await websocket.send(json.dumps(x))

        process_this_frame = not process_this_frame


start_server = websockets.serve(time, "localhost", 5000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
