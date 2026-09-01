import os
import re

directory = r"C:\projects\Mozhibu - Story\Frontend\src"

def add_lazy_loading(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find <img tags that don't already have loading="lazy"
    # Use regex to find <img followed by anything up to the closing >, ignoring if loading="lazy" is already there
    
    # Simple replace: first remove any loading="lazy" to avoid duplicates
    content = content.replace('loading="lazy"', '')
    content = content.replace("loading='lazy'", '')
    
    # Then replace <img with <img loading="lazy"
    new_content = content.replace('<img ', '<img loading="lazy" ')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.ts') or file.endswith('.html'):
            add_lazy_loading(os.path.join(root, file))

print("Finished adding loading='lazy' to all images.")
