from flask import Flask, render_template, request, jsonify, session
import psycopg2
import tkinter as tk
from PIL import Image, ImageTk
from psycopg2.extras import DictCursor



import mysql.connector
import os
import base64
import numpy as np

# new changes/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
# for making an array of images for video making
import base64
from PIL import Image
from io import BytesIO

# for making video out of images with transition
from moviepy.editor import *
from moviepy.video.fx.all import fadein, fadeout
from flask import Flask, send_file

# Global variable to store processed images
final_images = []

# new changes end here/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app = Flask(__name__)
app.secret_key = 'rohanisadickhead'

# Function to establish a connection to the MySQL database
def get_db_connection():
    connectstr="postgresql://akg:qNO68GCg29L4cM7BwSp0Zg@webeditor-9094.8nk.gcp-asia-southeast1.cockroachlabs.cloud:26257/users?sslmode=verify-full"
    return psycopg2.connect(connectstr)

# Function to retrieve user data from the database
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=DictCursor)
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    conn.close()
    return users

# Function to check user credentials
def check_user_credentials(username, password):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=DictCursor)
    cursor.execute('SELECT * FROM users WHERE username = %s AND password = %s', (username, password))
    user = cursor.fetchone()
    conn.close()
    return user

# Function to check if a user with the same username or email already exists
def user_exists(username, email):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = %s OR email = %s', (username, email))
    user = cursor.fetchone()
    conn.close()
    return user is not None

# Function to upload image to database
def upload_image_to_db(user_id, image_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO images (user_id, image_data) VALUES (%s, %s)', (user_id, image_data))
    conn.commit()
    conn.close()

    
@app.route('/')
def signin():
    return render_template('SIgnUp.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['signin-username']
    password = request.form['signin-password']

    # Check user credentials
    user = check_user_credentials(username, password)
    if not user:
        if username == "admin" and password == "admin":
            return jsonify({"success": True, "redirectTo": "admin"})
        else:
            return jsonify({"success": False, "message": "Invalid username or password"})
        # Store user id in session
        session['user_id'] = user['id']
        session['username'] = username
        return jsonify({"success": True, "redirectTo": "index"})  # Redirect to index.html on successful login
    else:
        # Store user id in session
        session['user_id'] = user['id']
        session['username'] = username
        return jsonify({"success": True, "redirectTo": "index"})  # Redirect to index.html on successful login

@app.route('/admin')
def admin():
    users = get_users()
    return render_template('admin.html', users=users)



@app.route('/index')
def index():
    # Check if the user is logged in
    if 'user_id' not in session:
        return render_template('login.html')  # Redirect to the login page if the user is not logged in
    
    user_id = session['user_id']
    
    # Fetch uploaded images for the current user from the database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT image_data FROM images WHERE user_id = %s', (user_id,))
    images = cursor.fetchall()
    conn.close()

    # Convert BLOB data to base64 strings
    base64_images = []
    for image_data in images:
        base64_image = base64.b64encode(image_data[0]).decode('utf-8')
        base64_images.append(base64_image)

    # Pass the base64-encoded images to the HTML template
    return render_template('index.html', images=base64_images)


@app.route('/signup', methods=['POST'])
def signup():
    username = request.form['signup-username']
    email = request.form['signup-email']
    password = request.form['signup-password']

    # Check if a user with the same username or email already exists
    if user_exists(username, email):
        return jsonify({"success": False, "message": "User with the same username or email already exists"})
    
    # Write user data to the database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO users (username, email, password) VALUES (%s, %s, %s)', (username, email, password))
    conn.commit()
    
    cursor=conn.cursor(cursor_factory=DictCursor) #############################################################################################Change Made to make it working
    # Retrieve the inserted user id
    cursor.execute('SELECT id FROM users WHERE username = %s', (username,))
    user_id = cursor.fetchone()['id']
    
    conn.close()

    # Create a folder for the user
    user_folder_path = os.path.join('user_folders', username)
    os.makedirs(user_folder_path, exist_ok=True)

    # Store user id in session
    session['user_id'] = user_id
    session['username'] = username

    return jsonify({"success": True, "username": username, "redirectTo": "index"})  # Redirect to homepage.html after successful signup

@app.route('/current_user')
def current_user_info():
    # Retrieve current username from session
    current_username = session.get('username')
    if current_username:
        return jsonify({"username": current_username})
    else:
        return jsonify({"username": None})

@app.route('/upload_image', methods=['POST'])
def upload_image():
    # Check if a file was uploaded
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part"})
    
    file = request.files['file']
    
    # Check if the file has a filename
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"})
    
    # Check if the user is logged in
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "User not logged in"})
    
    user_id = session['user_id']
    
    # Read the file content
    image_data = file.read()
    
    # Upload the image to the database
    upload_image_to_db(user_id, image_data)
    
    return jsonify({"success": True, "message": "Image uploaded successfully"})

#toPutImages in SelectedImages Folder while Selecting
SELECTED_IMAGE_FOLDER = "selectedImage"
if not os.path.exists(SELECTED_IMAGE_FOLDER):
    os.makedirs(SELECTED_IMAGE_FOLDER)
    
@app.route('/final_video.mp4')
def final_video():
    return send_file('final_video.mp4')

# Endpoint to save selected image to the "selectedImage" folder
@app.route('/save_selected_image', methods=['POST'])
def save_selected_image():
    data = request.json
    image_src = data.get('imageSrc')

    if image_src:
        try:
            # Extract the image file name from the URL
            image_filename = image_src.split('/')[-1]
            # Save the image to the "selectedImage" folder
            with open(os.path.join(SELECTED_IMAGE_FOLDER, image_filename), 'wb') as f:
                f.write(request.get(image_src).content)
            return jsonify({"success": True, "message": "Image saved successfully"})
        except Exception as e:
            return jsonify({"success": False, "message": str(e)})
    else:
        return jsonify({"success": False, "message": "No image source provided"})

# Endpoint to delete selected image from the "selectedImage" folder
@app.route('/delete_selected_image', methods=['POST'])
def delete_selected_image():
    data = request.json
    image_src = data.get('imageSrc')

    if image_src:
        try:
            # Extract the image file name from the URL
            image_filename = image_src.split('/')[-1]
            # Delete the image from the "selectedImage" folder
            os.remove(os.path.join(SELECTED_IMAGE_FOLDER, image_filename))
            return jsonify({"success": True, "message": "Image deleted successfully"})
        except Exception as e:
            return jsonify({"success": False, "message": str(e)})
    else:
        return jsonify({"success": False, "message": "No image source provided"})
    
    
# To convert array of src of images in images after preview button is clicked////////////////////////////////////////////////////////////////////////////////////

intermediate_video = None
final_video = None
final_images =[]


    
# def create_video(images, transitions, output_file="output.mp4"):
#     clips = []
#     for i, image in enumerate(images):
#         clip = ImageClip(image).set_duration(6)  # Assuming each image should be displayed for 6 seconds

#         # Apply transitions based on the transitions list
#         if transitions[i] == 'fadein':
#             clip = fadein(clip, 1)
#         elif transitions[i] == 'fadeout':
#             clip = fadeout(clip, 1)
#         elif transitions[i] == 'crossfade' and i != 0:
#             clip = clip.crossfadein(1)

#         clips.append(clip)

#     # Concatenate clips, considering crossfade requires overlap
#     video = concatenate_videoclips(clips, method="compose", padding=-1 if 'crossfade' in transitions else 0)
#     video.write_videofile(output_file, 24, codec='libx264')
#     return output_file




def create_video_from_images(final_images, Transitions, output_file="output_video.mp4"):
    """
    Creates a video from a sequence of PIL Image objects with transitions.

    :param final_images: A list of PIL Image objects.
    :param Transitions: A list of transitions corresponding to each image.
    :param output_file: The filename for the created video.
    :param fps: Frames per second for the output video.
    """
    clips = []
    # print(final_images)
    for i, img in enumerate(final_images):
        clip = ImageClip(np.array(img)).set_duration(6)  # Each image lasts for 6 seconds

        # if i < len(Transitions):
            # transition = Transitions[i]
        if Transitions[i] == 'fadein':
            clip = clip.fadein(1)  # 1-second fade-in
        elif Transitions[i] == 'fadeout':
            clip = clip.fadeout(1)  # 1-second fade-out
        elif Transitions[i] == 'crossfade' and i != 0:
            clip = clip.crossfadein(1)

        clips.append(clip)

    # Handle crossfade; this requires modifying the start time of clips
    # if 'crossfade' in Transitions:
    #     for i in range(1, len(clips)):
    #         if Transitions[i - 1] == 'crossfade':
    #             clips[i] = clips[i].set_start(clips[i - 1].end - 1)  # Overlap clips for crossfade

    video = concatenate_videoclips(clips, method="compose", padding=-1 if 'crossfade' in Transitions else 0)
    video.write_videofile(output_file, 24, codec='libx264')

    return output_file


# def add_music(video_file, music_file, final_output="final_output.mp4"):
#     video = VideoFileClip(video_file)
#     audio = AudioFileClip(music_file).subclip(0, video.duration)
#     final_video = video.set_audio(audio)
#     final_video.write_videofile(final_output, fps=24, codec='libx264', audio_codec='aac')
#     return final_output

# def show_image(image_path):
#     # Create the main window
#     root = tk.Tk()
#     root.title("Popup Image")

#     # # Load the image
#     # image = Image.open(image_path)
#     photo = ImageTk.PhotoImage(image_path)

#     # Create a label with the image
#     label = tk.Label(root, image=photo)
#     label.image = photo  # Keep a reference to prevent garbage collection

#     # Place the label in the window
#     label.pack()

#     # Run the GUI
#     root.mainloop()


@app.route('/process-images', methods=['POST'])
def process_images():
    global final_images
    
    final_images = []  # Reset final_images for each new processing request
    data = request.json
    select_images = data['select_images']
    
    # Process the images (decode base64 strings)
    for base64_str in select_images:
        image_data = base64.b64decode(base64_str.split(',')[1])
        image = Image.open(BytesIO(image_data))
        final_images.append(image)

    # Return a response indicating successful image processing
    return jsonify({'message': 'Images processed successfully'})



@app.route('/process_transitions', methods=['POST'])
def process_transitions():
    global final_images
    global intermediate_video

    data = request.get_json()
    
    # Receive the transitions array from the client
    Transitions = data.get('transitionsArray', [])

    # Check if images are available
    if not final_images:
        return jsonify({'error': 'No images to create video'}), 400

    # Create the video with transitions and update intermediate_video
    intermediate_video = create_video_from_images(final_images, Transitions)

    return jsonify({'message': 'Video created successfully with transitions','outputVideoSrc':intermediate_video})


@app.route('/process-music', methods=['POST'])
def process_music():
    global intermediate_video
    global final_video
    
    data = request.get_json()  # Retrieve the JSON data sent by the client
    selected_music_src = data.get('selectMusicSrc')  # Get the selectedMusicSrc from the JSON data
    
    if not selected_music_src:
        return jsonify({'error': 'No music source provided'}), 400

    # At this point, you have the music source URL
    # You can process it as needed for your application
    # print('Selected music source:', selected_music_src)

    # Implement your processing logic here
    video_clip = VideoFileClip(intermediate_video)
    
     # Load the music file
    audio_clip = AudioFileClip(selected_music_src)
    
    # Set the audio of the video clip as the audio clip
    # The audio will be set from the start of the video to the minimum of either video's end or audio's duration
    video_clip = video_clip.set_audio(audio_clip.set_duration(video_clip.duration))
    
    # Define the output file for the final video
    final_video = "final_video.mp4"
    
    # Write the result to a file (many options available !)
    video_clip.write_videofile(final_video, codec='libx264', audio_codec='aac')

    return jsonify({'message': 'Video created successfully with background music', 'outputVideoSrc': final_video})
    


@app.route('/download')
def download_file():
    global final_video
    
    print("final Video Path:", final_video)

    if not final_video:
        return "Intermediate video path not set", 404
    
    if not os.path.exists(final_video):
        return f"Video file not found at {final_video}", 404
    
    return send_file(final_video, as_attachment=True)

@app.route('/video')
def video():
    return Response(final_video, mimetype='video/mp4')
    

if __name__ == '__main__':
    app.run(debug=True)