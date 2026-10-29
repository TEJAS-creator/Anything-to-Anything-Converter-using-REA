"""
Media Engine:
Audio & Video conversions powered by local FFmpeg.
Supports MP4 <-> MP3, WAV, WEBM, GIF, AVI.
"""

import os
import subprocess
import shutil


def get_ffmpeg_path() -> str:
    """Finds ffmpeg in system path or standard locations."""
    path = shutil.which("ffmpeg")
    if path:
        return path
    # Check default Windows paths if not found in PATH
    for candidate in [
        r"C:\ffmpeg\bin\ffmpeg.exe",
        os.path.expanduser(r"~\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe")
    ]:
        if os.path.exists(candidate):
            return candidate
    return "ffmpeg"


def convert_media(
    input_path: str,
    output_path: str,
    target_format: str,
    audio_bitrate: str = "192k",
    fps: int = 15,
    gif_scale: int = 480
) -> str:
    """
    Executes FFmpeg conversion according to source and target format.
    """
    ffmpeg_bin = get_ffmpeg_path()
    target_fmt = target_format.lower().replace('.', '')

    cmd = [ffmpeg_bin, "-y", "-i", input_path]

    if target_fmt == 'mp3':
        cmd.extend(["-vn", "-c:a", "libmp3lame", "-b:a", audio_bitrate, output_path])

    elif target_fmt == 'wav':
        cmd.extend(["-vn", "-c:a", "pcm_s16le", output_path])

    elif target_fmt == 'gif':
        # High-fidelity two-pass GIF with palettegen
        vf_filter = f"fps={fps},scale={gif_scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
        cmd.extend(["-vf", vf_filter, output_path])

    elif target_fmt == 'webm':
        cmd.extend(["-c:v", "libvpx-vp9", "-b:v", "1500k", "-c:a", "libopus", output_path])

    elif target_fmt == 'avi':
        cmd.extend(["-c:v", "mpeg4", "-vtag", "xvid", "-qscale:v", "3", "-c:a", "libmp3lame", output_path])

    elif target_fmt == 'mp4':
        cmd.extend(["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", output_path])

    else:
        # Default auto-mux
        cmd.extend([output_path])

    process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if process.returncode != 0:
        raise RuntimeError(f"FFmpeg conversion failed: {process.stderr[-500:]}")

    return output_path
