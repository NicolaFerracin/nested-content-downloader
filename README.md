# Downloader

Given a list of URLs, this Node.js script will:

- asynchronously get content for each URL
- extract image URLs with given locator from each page
- asynchronously collect all images and merge them to a PDF

## Use case

I wanted to collect images of houses from real estate websites, as inspiration.

Can be used to collect any type of content from a given list of URLs.

## Libraries used

- Axios: HTTP requests
- jsdom: html parsing
- pdfmake: PDF creation

## How to run

```
npm i

// modify urls.json and add the desired URLs

// modify index.js to change the content locator and any other configuration

node index.js
```

## TODO

- optimize PDFs
- turn into npm package
