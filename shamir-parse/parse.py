from bs4 import BeautifulSoup, Tag
from typing import Iterator, List
import requests
# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.common.keys import Keys
# from selenium.webdriver.firefox.service import Service


to_parse = {
    'researches': 'http://shamir.lv/category/%D0%B8%D1%81%D1%81%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F',
    'activity': 'http://shamir.lv/category/kuljtura',
    'projects': 'http://shamir.lv/category/kuljtura/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B',
    'years': 'http://shamir.lv/category/kuljtura/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/450-%D0%BB%D0%B5%D1%82-%D0%B2%D0%BC%D0%B5%D1%81%D1%82%D0%B5-%D0%B5%D0%B2%D1%80%D0%B5%D0%B9%D1%81%D0%BA%D0%B0%D1%8F-%D0%BA%D1%83%D0%BB%D1%8C%D1%82%D1%83%D1%80%D0%B0-%D0%B2-%D0%BB%D0%B0%D1%82%D0%B2',
    'teaching': 'http://shamir.lv/category/kuljtura/%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B/%D0%BF%D1%80%D0%B5%D0%BF%D0%BE%D0%B4%D0%B0%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D0%B8-%D1%85%D0%BE%D0%BB%D0%BE%D0%BA%D0%BE%D1%81%D1%82%D0%B0',
    'festivals': 'http://shamir.lv/category/%D1%84%D0%B5%D1%81%D1%82%D0%B8%D0%B2%D0%B0%D0%BB%D0%B8',
    'fest_5770': 'http://shamir.lv/category/%D1%84%D0%B5%D1%81%D1%82%D0%B8%D0%B2%D0%B0%D0%BB%D0%B8/%D1%84%D0%B5%D1%81%D1%82%D0%B8%D0%B2%D0%B0%D0%BB%D1%8C-%D0%B5%D0%B2%D1%80%D0%B5%D0%B9%D1%81%D0%BA%D0%BE%D0%B9-%D0%BA%D1%83%D0%BB%D1%8C%D1%82%D1%83%D1%80%D1%8B-5770',
    'fest_5771': 'http://shamir.lv/category/%D1%84%D0%B5%D1%81%D1%82%D0%B8%D0%B2%D0%B0%D0%BB%D0%B8/%D1%84%D0%B5%D1%81%D1%82%D0%B8%D0%B2%D0%B0%D0%BB%D1%8C-%D0%B5%D0%B2%D1%80%D0%B5%D0%B9%D1%81%D0%BA%D0%BE%D0%B9-%D0%BA%D1%83%D0%BB%D1%8C%D1%82%D1%83%D1%80%D1%8B-5771',
    'fest_5772': 'http://shamir.lv/category/%D1%84%D0%B5%D1%81%D1%82%D0%B8%D0%B2%D0%B0%D0%BB%D0%B8/%D1%84%D0%B5%D1%81%D1%82%D0%B8%D0%B2%D0%B0%D0%BB%D1%8C-%D0%B5%D0%B2%D1%80%D0%B5%D0%B9%D1%81%D0%BA%D0%BE%D0%B9-%D0%BA%D1%83%D0%BB%D1%8C%D1%82%D1%83%D1%80%D1%8B-5772',
    'fest_5773': 'http://shamir.lv/category/%D1%84%D0%B5%D1%81%D1%82%D0%B8%D0%B2%D0%B0%D0%BB%D0%B8/%D1%84%D0%B5%D1%81%D1%82%D0%B8%D0%B2%D0%B0%D0%BB%D1%8C-%D0%B5%D0%B2%D1%80%D0%B5%D0%B9%D1%81%D0%BA%D0%BE%D0%B9-%D0%BA%D1%83%D0%BB%D1%8C%D1%82%D1%83%D1%80%D1%8B-5773',
    'concerts': 'http://shamir.lv/category/%D0%BA%D0%BE%D0%BD%D1%86%D0%B5%D1%80%D1%82%D1%8B',
    'conferences': 'http://shamir.lv/category/%D0%BA%D0%BE%D0%BD%D1%84%D0%B5%D1%80%D0%B5%D0%BD%D1%86%D0%B8%D0%B8',
}

# service = Service(executable_path='/usr/bin/geckodriver')
# options = webdriver.FirefoxOptions()
# driver = webdriver.Firefox(service=service, options=options)
# driver.get(to_parse['activity'])
# driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.END)
# time.sleep(10)
# for article in driver.find_element(By.CLASS_NAME, 'herald-main-content').find_elements(By.TAG_NAME, 'article'):
#     print(article.get_attribute('innerHTML'))


def generate_links(url: str) -> Iterator[str]:
    yield url
    for i in range(2, 30):
        yield f'{url}/page/{i}'
    raise ValueError('too many pages')


def get_soup(url: str) -> Tag:
    return BeautifulSoup(requests.get(url).content)


def get_arts(soup: Tag) -> List[str]:
    content = soup.find(class_='herald-main-content')
    if isinstance(content, Tag):
        return [art.find('a').get('href') for art in content.find_all('article')]
    else:
        return []


with open('urls.txt', 'w') as f:
    for (sect, sect_url) in to_parse.items():
        print(sect)
        for link in generate_links(sect_url):
            print(link)
            arts = get_arts(get_soup(link))
            if arts:
                f.write('\n'.join(arts))
                f.write('\n')
            else:
                break
