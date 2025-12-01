#!/usr/bin/env python3
"""
Script to find external image URLs in articles, download them to public/images/,
and replace the links with local paths.
"""

import re
import os
import urllib.request
import urllib.parse
from pathlib import Path
from collections import defaultdict

# Base directories
ARTICLES_DIR = Path("src/content/articles")
IMAGES_DIR = Path("public/images")

# Pattern to match external image URLs
EXTERNAL_URL_PATTERN = re.compile(
    r'http://www\.rgm\.lv/wp-content/uploads/[^\s\)"]+\.(jpg|jpeg|png|gif|webp|svg)',
    re.IGNORECASE
)

def normalize_url(url):
    """Remove size variants from URLs (e.g., -300x198, -200x300) to get base URL"""
    # Remove size variants like -300x198, -200x300
    url = re.sub(r'-\d+x\d+\.(jpg|jpeg|png|gif|webp|svg)$', r'.\1', url, flags=re.IGNORECASE)
    # Note: Keep -Kopie suffix as it's part of the actual filename
    return url

def get_next_image_number():
    """Find the highest numbered image and return next number"""
    max_num = 0
    for file in IMAGES_DIR.iterdir():
        if file.is_file():
            name = file.stem
            try:
                num = int(name)
                max_num = max(max_num, num)
            except ValueError:
                pass
    return max_num + 1

def extract_external_urls():
    """Extract all unique external image URLs from articles"""
    url_to_files = defaultdict(set)
    base_urls = set()
    
    for article_file in ARTICLES_DIR.glob("*.md"):
        content = article_file.read_text(encoding='utf-8')
        for match in EXTERNAL_URL_PATTERN.finditer(content):
            url = match.group(0)
            # Normalize to get base URL (without size variants)
            base_url = normalize_url(url)
            base_urls.add(base_url)
            url_to_files[base_url].add(article_file)
    
    return base_urls, url_to_files

def download_image(url, local_path):
    """Download an image from URL to local path"""
    try:
        print(f"Downloading {url} -> {local_path}")
        urllib.request.urlretrieve(url, local_path)
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def replace_urls_in_file(file_path, url_mapping):
    """Replace external URLs with local paths in a file"""
    content = file_path.read_text(encoding='utf-8')
    original_content = content
    
    for external_url, local_path in url_mapping.items():
        # Get the base filename without extension
        url_path = Path(external_url)
        base_name = url_path.stem
        ext = url_path.suffix
        
        # Create regex pattern that matches:
        # 1. The exact URL
        # 2. URLs with size variants (e.g., -300x198)
        # 3. URLs with -Kopie suffix
        # Pattern: base URL with optional size variant or -Kopie before extension
        pattern = re.escape(external_url)
        # Replace the filename part to allow variants
        pattern = pattern.replace(
            re.escape(base_name + ext),
            f'(?:{re.escape(base_name)}(?:-\\d+x\\d+|-Kopie)?{re.escape(ext)})'
        )
        
        # Replace all matches
        content = re.sub(pattern, local_path, content, flags=re.IGNORECASE)
        
        # Also do direct string replacements for common variants
        content = content.replace(external_url, local_path)
        # Handle size variants
        for size_variant in ['-300x198', '-200x300', '-300x200', '-400x278', '-470x313', '-512x341', '-600x338', '-660x742', '-666x742', '-750x421', '-800x566', '-800x742', '-960x637', '-960x677', '-1000x667', '-1320x742']:
            variant_url = external_url.replace(ext, f'{size_variant}{ext}')
            if variant_url in content:
                content = content.replace(variant_url, local_path)
        # Handle -Kopie variant
        kopie_url = external_url.replace(ext, f'-Kopie{ext}')
        if kopie_url in content:
            content = content.replace(kopie_url, local_path)
    
    if content != original_content:
        file_path.write_text(content, encoding='utf-8')
        return True
    return False

def main():
    print("Extracting external image URLs from articles...")
    base_urls, url_to_files = extract_external_urls()
    
    if not base_urls:
        print("No external image URLs found.")
        return
    
    print(f"Found {len(base_urls)} unique external image URLs")
    
    # Get starting image number
    next_num = get_next_image_number()
    print(f"Starting image numbering from {next_num}")
    
    # Create mapping of external URLs to local paths
    url_mapping = {}
    file_updates = defaultdict(set)
    
    for base_url in sorted(base_urls):
        # Determine file extension from the URL
        ext = Path(base_url).suffix.lower()
        if not ext or ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']:
            ext = '.jpg'  # default
        
        local_filename = f"{next_num}{ext}"
        local_path = f"/images/{local_filename}"
        full_local_path = IMAGES_DIR / local_filename
        
        # Download the image (use the base URL, which should be the full-size version)
        # Try the base URL first, then try with -Kopie if it fails
        downloaded = False
        actual_url = base_url
        if download_image(base_url, full_local_path):
            downloaded = True
        else:
            # Try with -Kopie suffix if base URL failed
            kopie_url = base_url.replace('.jpg', '-Kopie.jpg').replace('.png', '-Kopie.png').replace('.gif', '-Kopie.gif').replace('.jpeg', '-Kopie.jpeg')
            if kopie_url != base_url:
                print(f"Trying with -Kopie suffix: {kopie_url}")
                if download_image(kopie_url, full_local_path):
                    downloaded = True
                    actual_url = kopie_url
        
        if downloaded:
            # Map both the base_url and actual_url to the local path for replacement
            url_mapping[base_url] = local_path
            if actual_url != base_url:
                url_mapping[actual_url] = local_path
            # Track which files need updating (use base_url for lookup)
            for article_file in url_to_files[base_url]:
                file_updates[article_file].add((base_url, local_path))
                if actual_url != base_url:
                    file_updates[article_file].add((actual_url, local_path))
            next_num += 1
        else:
            print(f"Skipping {base_url} due to download error")
    
    print(f"\nUpdating article files...")
    updated_count = 0
    for article_file, url_pairs in file_updates.items():
        # Create a mapping for this file
        file_url_mapping = {url: local_path for url, local_path in url_pairs}
        if replace_urls_in_file(article_file, file_url_mapping):
            updated_count += 1
            print(f"Updated {article_file}")
    
    print(f"\nDone! Downloaded {len(url_mapping)} images and updated {updated_count} article files.")

if __name__ == "__main__":
    main()
