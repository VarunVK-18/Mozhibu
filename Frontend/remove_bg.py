from PIL import Image

def remove_white_bg(image_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    # threshold for white
    for item in datas:
        # Check if pixel is white or very close to white (e.g. > 240)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0)) # Fully transparent
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(image_path, "PNG")
    print("Background removed successfully!")

remove_white_bg(r"C:\projects\Mozhibu - Story\Frontend\src\assets\logo.png")
