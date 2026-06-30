import os
from moviepy.editor import VideoFileClip, AudioFileClip

def convert_media(input_path, output_path, target_format):
    """
    Converts audio or video files using moviepy (FFmpeg wrapper).
    Supports MP4, AVI, MOV, GIF, MP3, WAV, AAC, FLAC
    """
    target_format = target_format.lower()
    
    # Audio extensions
    audio_formats = ['mp3', 'wav', 'aac', 'flac']
    # Video extensions
    video_formats = ['mp4', 'avi', 'mov', 'gif']
    
    try:
        # Determine if input is audio or video by checking extension
        ext = input_path.rsplit('.', 1)[1].lower()
        
        if ext in video_formats:
            clip = VideoFileClip(input_path)
            
            # If target is audio, extract audio from video
            if target_format in audio_formats:
                clip.audio.write_audiofile(output_path)
            # If target is GIF, use write_gif
            elif target_format == 'gif':
                clip.write_gif(output_path, fps=10) # Lower FPS for GIF to save size
            # Else it's video to video
            else:
                clip.write_videofile(output_path)
                
            clip.close()
            return True, "Video conversion successful"
            
        elif ext in audio_formats:
            if target_format in video_formats:
                return False, "Cannot convert Audio to Video without an image source."
                
            clip = AudioFileClip(input_path)
            clip.write_audiofile(output_path)
            clip.close()
            return True, "Audio conversion successful"
            
        else:
            return False, f"Unsupported media format: {ext}"
            
    except Exception as e:
        return False, str(e)
