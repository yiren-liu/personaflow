import concurrent.futures as cf
import io
import os
from pathlib import Path

from openai import OpenAI
import json
from settings import app_settings

class TTS():
    def __init__(self):
        self.voices = {
            "male-1":"echo",
            "female-1":"nova",
            "male-2":"onyx",
            "female-2":"shimmer",
            "male-3":"alloy",
            "male-4":"fable"
        }
        self.client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY"),
            base_url= os.environ.get("OPENAI_API_BASE"),
    )

    def get_mp3(self, text: str, voice: str) -> bytes:
        with self.client.audio.speech.with_streaming_response.create(
            model="tts-1",
            voice=voice,
            input=text,
            speed = 1,
        ) as response:
            with io.BytesIO() as file:
                for chunk in response.iter_bytes():
                    file.write(chunk)
                return file.getvalue()
            
    def get_unique_speakers(self, transcript):
        """
        This functions gets unique speakers while preseving the ordering. Using set() does not preserve the ordering
        """
        unique_speakers = []
        for utterance in transcript['transcript']:
            if utterance['speaker'] not in unique_speakers:
                unique_speakers.append(utterance['speaker'])
        return unique_speakers

    def add_voice(self, transcript):
        unique_speakers = self.get_unique_speakers(transcript)
        if len(unique_speakers) > len(self.voices):
            raise Exception("Not enough voices to mock all personas")
        
        unique_voices = list(self.voices.values())
        voice_map = {unique_speakers[i]: unique_voices[i] for i in range(len(unique_speakers))}
        for utterance in transcript['transcript']:
            utterance['voice'] = voice_map[utterance['speaker']]
        return transcript
    
    def write_audio(self, file_name, byte_data):
        temporary_directory = app_settings.temp_location
        os.makedirs(temporary_directory, exist_ok=True)

        file_path = Path(temporary_directory, file_name)
        with open(file_path, "wb") as file:
            file.write(byte_data)
        return file_path

    def generate_audio(self, file_name, transcript) -> bytes:
        audio = b""
        characters = 0

        transcript = self.add_voice(transcript)
        with cf.ThreadPoolExecutor() as executor:
            futures = []
            for line in transcript['transcript']:
                future = executor.submit(self.get_mp3, line['text'], line['voice']) #
                futures.append((future))
                characters += len(line["text"])

            for future in futures:
                audio_chunk = future.result()
                audio += audio_chunk

        audio_path = self.write_audio(file_name, audio)
        return audio_path

if __name__ == "__main__":
    import dotenv

    dotenv.load_dotenv(".env.block")

    with open('transcript.json', 'r') as file:
        transcript = json.load(file)
    tts = TTS()
    file_link = tts.generate_audio(transcript)
    print(file_link)