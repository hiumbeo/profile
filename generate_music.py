import wave
import struct
import math
import subprocess
import os

SAMPLE_RATE = 44100

def synthesize_track(filename, duration, chord_progression, style='lofi'):
    num_samples = int(SAMPLE_RATE * duration)
    wav_path = filename + ".wav"
    mp3_path = filename + ".mp3"
    
    wav_file = wave.open(wav_path, 'w')
    wav_file.setnchannels(2) # Stereo
    wav_file.setsampwidth(2) # 16-bit
    wav_file.setframerate(SAMPLE_RATE)
    
    # We will generate stereo frames
    chunk_size = 4096
    frames = bytearray()
    
    # Musical scale / notes frequencies
    chord_len = duration / len(chord_progression)
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        chord_idx = int(t / chord_len) % len(chord_progression)
        current_chord = chord_progression[chord_idx]
        
        # Chord time relative to its bar
        t_chord = t % chord_len
        
        # Harmony (multiple sine waves with harmonic warmth and decay)
        sample_left = 0.0
        sample_right = 0.0
        
        # Soft envelope for each chord
        env = math.exp(-0.8 * (t_chord % (chord_len / 2)))
        
        for idx, freq in enumerate(current_chord):
            # Rich harmonics: fundamental + warm 2nd harmonic + octave
            harm1 = math.sin(2.0 * math.pi * freq * t)
            harm2 = 0.4 * math.sin(2.0 * math.pi * (freq * 2.002) * t)
            harm3 = 0.15 * math.sin(2.0 * math.pi * (freq * 3.005) * t)
            chord_note = (harm1 + harm2 + harm3) * 0.25 * env
            
            # Stereo panning
            pan = (idx / max(1, len(current_chord) - 1)) # 0 to 1
            sample_left += chord_note * (1.0 - 0.5 * pan)
            sample_right += chord_note * (0.5 + 0.5 * pan)
            
        # Bass note (sub bass)
        bass_freq = current_chord[0] / 2.0
        bass_env = math.exp(-0.5 * (t % 1.0))
        bass_tone = (math.sin(2.0 * math.pi * bass_freq * t) + 0.3 * math.sin(4.0 * math.pi * bass_freq * t)) * 0.35 * bass_env
        sample_left += bass_tone
        sample_right += bass_tone
        
        # Gentle Lofi Beat (Kick on 0s & 1.5s, Snare on 1.0s, Hi-hat on 0.5s ticks)
        beat_t = t % 2.0
        # Kick drum
        if beat_t < 0.2:
            kick_env = math.exp(-25.0 * beat_t)
            kick = math.sin(2.0 * math.pi * (60.0 - 40.0 * beat_t * 5.0) * beat_t) * 0.45 * kick_env
            sample_left += kick
            sample_right += kick
            
        # Snare / rimshot at beat 1.0
        snare_t = beat_t - 1.0
        if 0 <= snare_t < 0.25:
            snare_env = math.exp(-20.0 * snare_t)
            # Filtered noise + tone
            noise = ((math.sin(snare_t * 98765.4) * 43758.5453) % 1.0) * 2.0 - 1.0
            snare = (noise * 0.2 + 0.1 * math.sin(2.0 * math.pi * 180.0 * snare_t)) * snare_env
            sample_left += snare * 0.8
            sample_right += snare * 0.8
            
        # Hihat on every 0.25s
        hat_t = t % 0.25
        if hat_t < 0.05:
            hat_env = math.exp(-60.0 * hat_t)
            hat_noise = ((math.sin(t * 12345.67) * 98765.43) % 1.0) * 2.0 - 1.0
            hat = hat_noise * 0.06 * hat_env
            sample_left += hat * 0.7
            sample_right += hat * 1.0
            
        # Subtle melody line arpeggio
        arp_idx = int(t * 4.0) % len(current_chord)
        arp_freq = current_chord[arp_idx] * 2.0
        arp_t = t % 0.25
        arp_env = math.exp(-12.0 * arp_t)
        arp_note = math.sin(2.0 * math.pi * arp_freq * t) * 0.18 * arp_env
        sample_left += arp_note * 0.9
        sample_right += arp_note * 0.4
        
        # Master limiter & clipping protection
        sample_left = max(-0.95, min(0.95, sample_left * 0.85))
        sample_right = max(-0.95, min(0.95, sample_right * 0.85))
        
        val_l = int(sample_left * 32767.0)
        val_r = int(sample_right * 32767.0)
        
        frames.extend(struct.pack('<hh', val_l, val_r))
        
        if len(frames) >= chunk_size:
            wav_file.writeframes(frames)
            frames = bytearray()
            
    if len(frames) > 0:
        wav_file.writeframes(frames)
        
    wav_file.close()
    
    # Convert to high-quality MP3 using ffmpeg
    subprocess.run([
        'ffmpeg', '-y', '-i', wav_path, 
        '-codec:a', 'libmp3lame', '-b:a', '192k', 
        mp3_path
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    os.remove(wav_path)
    print(f"Generated {mp3_path}")

os.makedirs('public/music', exist_ok=True)

# 1. Late Night Rose (F#m7 - Bm7 - E7 - Amaj7)
synthesize_track('public/music/track1', 48, [
    [185.0, 220.0, 277.18, 329.63], # F#m7
    [123.47, 146.83, 185.0, 220.0], # Bm7
    [164.81, 207.65, 246.94, 293.66], # E7
    [220.0, 277.18, 329.63, 440.0], # Amaj7
])

# 2. Losing Interest (C - Am - F - G)
synthesize_track('public/music/track2', 45, [
    [130.81, 164.81, 196.0, 246.94], # Cmaj7
    [110.0, 130.81, 164.81, 196.0], # Am7
    [174.61, 220.0, 261.63, 329.63], # Fmaj7
    [196.0, 246.94, 293.66, 349.23], # G7
])

# 3. Đường Dài Em Đi (Dm - Bb - C - Am)
synthesize_track('public/music/track3', 44, [
    [146.83, 174.61, 220.0, 261.63], # Dm7
    [116.54, 146.83, 174.61, 220.0], # Bbmaj7
    [130.81, 164.81, 196.0, 246.94], # C7
    [110.0, 130.81, 164.81, 196.0], # Am7
])

# 4. Best Part (Synthwave Chill Groove: Dmaj7 - C#m7 - Bm7 - A)
synthesize_track('public/music/track4', 45, [
    [146.83, 185.0, 220.0, 277.18], # Dmaj7
    [138.59, 164.81, 207.65, 246.94], # C#m7
    [123.47, 146.83, 185.0, 220.0], # Bm7
    [110.0, 138.59, 164.81, 220.0], # Amaj
])

print("All 4 MP3 tracks generated successfully!")
