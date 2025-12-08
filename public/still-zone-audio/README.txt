Still Zone Audio Files
======================

This directory contains audio files specifically for Still Zone.
This is separate from Still Lift audio files to avoid confusion.

Folder Structure:
-----------------
Place your pre-generated audio files here, organized by mood and context:

still-zone-audio/
  ├── good-still/
  ├── good-move/
  ├── good-focused/
  ├── okay-still/
  ├── okay-move/
  ├── okay-focused/
  ├── bad-still/
  ├── bad-move/
  ├── bad-focused/
  ├── awful-still/
  ├── awful-move/
  └── awful-focused/

Naming Convention:
------------------
Files are looked up by audioIndex from the content library.
Supported extensions (first match wins): .mp3, .m4a, .ogg, .wav

Example naming patterns:
- audio_1.mp3, audio_2.mp3, etc.
- 1.mp3, 2.mp3, etc.
- Mood_Good_Content_Still_Audio_01.mp3

If no file is found, the app falls back to Text-to-Speech (TTS).

