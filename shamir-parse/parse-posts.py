import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from typing import Optional


def validate(**kwargs):
    for key, value in kwargs.items():
        if not value:
            raise ValueError(f'{key} not found')
        return value


class Post:
    url: str
    title: str
    tags: tuple[str]
    date: str
    image: str
    body: str

    def __init__(self, url: str) -> None:
        self.url = url


def add_broken(url: str) -> None:
    with open('broken.txt', 'a') as f:
        f.write(url)
        f.write('\n')


def parse(url: str) -> Optional[Post]:
    print(url)
    post = Post(url)

    soup = BeautifulSoup(requests.get(url).content)
    thumbnail = validate(thumbnail=soup.find(class_='herald-post-thumbnail-single'))
    header = validate(header=thumbnail.find('header', class_='entry-header'))

    post.title = validate(title_div=header.div).contents[0]
    print(post.title)

    post.date = validate(date=header.find(class_='herald-date')).text
    post.tags = tuple(a.contents[0] for a in validate(meta_category=header.find(class_='meta-category')).find_all('a'))

    post.image = validate(img=soup.find('img', class_='attachment-herald-lay-a-full'))['src']
    post.body = "".join([str(item) for item in validate(body=soup.find(class_='entry-content')).contents]).replace('\n', ' ')

    return post


def resolve(url: str) -> Optional[dict]:
    try:
        return parse(url).__dict__
    except ValueError:
        add_broken(url)
        return None


with open('urls.txt') as f:
    urls = [line.strip() for line in f.readlines()]

df = pd.DataFrame([res for res in [resolve(url) for url in tqdm(urls)] if res])
df.to_csv('posts.csv')
