const urls = require('./urls.json');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const PdfPrinter = require('pdfmake');
const fs = require('fs');

const dir = 'documents'; // destination directory
const imageSrcLocator = 'a.js_pp_image.js_lightbox_image_src'; // images locator
const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
}; // fonts for pdfmake

// remove dash and capitalize
const clean = string => {
  const noDash = string.replace(/-/g, ' ').split(' ');
  return noDash.map(word => word.toUpperCase()[0] + word.substr(1)).join('_');
};
const formatTitle = urlParts =>
  `${urlParts.pop()}-${clean(urlParts[4])}_(${clean(urlParts[5])},${clean(urlParts[6])})`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const promises = urls.map(url => {
  console.log(`Getting HTML from ${url}.`);

  const urlParts = url.split('/');
  const title = formatTitle(urlParts);

  return axios.get(url).then(res => {
    const { document } = new JSDOM(res.data).window;
    const images = Array.from(document.querySelectorAll(imageSrcLocator)).map(el => el.dataset.src);

    const promises = images.map(img => axios.get(img, { responseType: 'arraybuffer' }));
    Promise.all(promises).then(values => {
      const base64 = values.map(
        val => 'data:image/jpeg;base64,' + Buffer.from(val.data, 'binary').toString('base64')
      );

      const docDefinition = {
        content: [{ text: url, link: url }, ...base64.map(img => ({ image: img, width: 612.0 }))],
        pageMargins: [0, 0, 0, 0]
      };

      const printer = new PdfPrinter(fonts);
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(fs.createWriteStream(`./${dir}/${title}.pdf`));
      pdfDoc.end();
      console.log(`Images for ${title} ready in './${dir}/${title}.pdf'!`);
    });
  });
});

Promise.all(promises);
