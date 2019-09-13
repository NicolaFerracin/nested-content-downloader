# Downloader

Badly named [npm pagkage](https://www.npmjs.com/package/multiple-urls-images-downloader).

Given a list of URLs, this module will collect all the images on each URL and store them in separate PDF files.

Single steps are:

- asynchronously get HTML content for each URL
- extract image URLs using the given locator function (using [`after-load`](https://www.npmjs.com/package/after-load))
- asynchronously collect all images and merge them to a PDF

## Use case

I wanted to collect images of houses from several real estate websites, as inspiration.

## Libraries used

- [`axios`](https://www.npmjs.com/package/axios): HTTP requests
- [`after-load`](https://www.npmjs.com/package/after-load): full html loading
- [`pdfmake`](https://www.npmjs.com/package/pdfmake): PDF creation

## Install

```
npm -S i multiple-urls-images-downloader
```

## How to use

**NOTE**: You will need to provide fonts for the PDF generation.

```js
const muid = require('multiple-urls-images-downloader');

const config = {
  // Mandatory list of URLs to inspect
  urls: ['url1', 'url2'],

  // Destination dir where to store the PDF files
  // Defaults to './documents'
  dir: './my_dir',

  // Defaults to the url without "/" or ":" or "."
  getTitle: url => url,

  // Mandatory
  // List of fonts. By default muid will look for the following:
  fonts: {
    Roboto: {
      normal: './fonts/Roboto-Regular.ttf',
      bold: './fonts/Roboto-Medium.ttf',
      italics: './fonts/Roboto-Italic.ttf',
      bolditalics: './fonts/Roboto-MediumItalic.ttf',
    },
  },

  // Mandatory
  // Locator function. muid will pass the html string and the $ cheerio object
  // ($ is provided by after-load)
  getImagesHref: (html, $) => {
    const images = [];
    $('img[src^="img/photos"]').each(function() {
      images.push($(this).attr('src'));
    });
    return images;
  },
};

muid(config);
```
