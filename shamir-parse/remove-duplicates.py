with open('urls.txt') as f:
    urls = f.readlines()
with open('urls.txt', 'w') as f:
    for url in set(urls):
        f.write(url)
