import requests
import os

os.makedirs("./usr/local/sbin/temp", exist_ok=True)
# os.makedirs("./temp", exist_ok=True)

def download_file(download_url, filename="document.pdf"):
    headers = {'User-Agent': 'Mozilla/5.0'}
    final_filename = f"./usr/local/sbin/temp/{filename}"  
    # final_filename = f"./temp/{filename}"  
    
    try:
        response = requests.get(download_url, headers=headers, stream=True)
    
        if response.status_code == 200:
            with open(final_filename, 'wb') as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
            print("Download completed!")
        else:
            print(f"Failed to download file. Status code: {response.status_code}")
            final_filename = ""
    except Exception as e:
        print(f"Download URL: {download_url}")
        print(f"An error occurred: {e}")
        final_filename = ""
    
    return final_filename

# if __name__ == "__main__":
#     download_file("https://www.mdpi.com/2078-2489/15/11/697/pdf?version=1730704574")
