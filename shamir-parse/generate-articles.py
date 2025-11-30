import pandas as pd
from slugify import slugify
from os import mkdir, rename
from markdownify import markdownify as md
import re

path = "articles"
path_bak = '.' + path + '.bak'
i = 0
while True:
    i += 1
    try:
        rename(path, path_bak + str(i))
        break
    except FileNotFoundError:
        break
    except OSError:
        pass
mkdir(path)


def clean(body_content):
    """
    Clean HTML content and convert to pretty markdown, preserving images, videos, and other media.

    Args:
        body_content: The body content from CSV (can be a list or string)

    Returns:
        Clean markdown string
    """
    if not body_content:
        return ""

    if isinstance(body_content, list):
        content = ''.join([str(item) for item in body_content if item and str(item).strip() != '\\n'])
    else:
        content = str(body_content)

    markdown_content = md(content, heading_style="ATX")

    # Clean up common issues
    # Remove excessive whitespace
    markdown_content = re.sub(r'\n\s*\n\s*\n', '\n\n', markdown_content)

    # Fix image syntax if needed
    markdown_content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'![\1](\2)', markdown_content)

    # Remove any remaining HTML tags that might have been missed
    markdown_content = re.sub(r'<[^>]+>', '', markdown_content)

    # Clean up extra whitespace
    markdown_content = markdown_content.strip()

    return markdown_content


template = """---
id: "{}"
title: "{}"
image: "{}"
tags: {}
date: {}
oldUrl: {}
---

{} """


def join_tags(tags_str: str) -> str:
    return tags_str.replace("(", "[").replace(")", "]")


def parse_date(date: str) -> str:
    _, pre_month, pre_day, year = date.split()
    day = re.sub('[a-z,]', '', pre_day).zfill(2)
    month = {
        'January': '01',
        'February': '02',
        'March': '03',
        'April': '04',
        'May': '05',
        'June': '06',
        'July': '07',
        'August': '08',
        'September': '09',
        'October': '10',
        'November': '11',
        'December': '12',
    }[pre_month]
    return f'{year}-{month}-{day}'


def generate(row: pd.Series) -> pd.Series:
    print(row.title)
    with open(f'{path}/{slugify(row.title)}.md', 'w') as f:
        f.write(template.format(row.name, row.title, row.image, join_tags(row.tags), parse_date(row.date), row.url, clean(row.body)))
    return row


df = pd.read_csv('posts.csv', index_col=0)

df.apply(generate, axis=1)
