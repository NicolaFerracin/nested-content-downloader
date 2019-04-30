const urls = require('./urls.json');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const utils = require('./utils');

const dir = 'documents'; // destination directory

const getUrlContent = url => {
  console.log(`Getting HTML from ${url}.`);

  const imageSrcLocator = 'a.js_pp_image.js_lightbox_image_src'; // images locator
  const fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  }; // fonts for pdfmake

  const urlParts = url.split('/');
  const title = utils.formatTitle(urlParts);

  const pdfConfig = {
    title,
    fonts,
    url,
    path: `./${dir}/${title}.pdf`
  };

  return axios.get(url).then(async res => {
    const { document } = new JSDOM(res.data).window;
    const images = Array.from(document.querySelectorAll(imageSrcLocator)).map(el => el.dataset.src);

    await downloadImagesToPdf(images, pdfConfig);
  });
};

const downloadImagesToPdf = async (images, pdfConfig) => {
  const promises = images.map(img => axios.get(img, { responseType: 'arraybuffer' }));
  await Promise.all(promises).then(values => {
    const base64 = values.map(
      val => 'data:image/jpeg;base64,' + Buffer.from(val.data, 'binary').toString('base64')
    );

    pdfConfig.docDefinition = {
      content: [
        { text: pdfConfig.url, link: pdfConfig.url },
        ...base64.map(img => ({ image: img, width: 612.0 }))
      ],
      pageMargins: [0, 0, 0, 0]
    };

    createPdf(pdfConfig);
  });
};

const createPdf = config => {
  const printer = new PdfPrinter(config.fonts);
  const pdfDoc = printer.createPdfKitDocument(config.docDefinition);
  pdfDoc.pipe(fs.createWriteStream(config.path));
  pdfDoc.end();
  console.log(`Content for ${config.title} ready in '${config.path}'!`);
};

const download = () => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const promises = urls.map(getUrlContent);
  return Promise.all(promises);
};

const run = async () => {
  await download();
  console.log(
    `Images for all ${urls.length} urls have been downloaded. You can find them in './${dir}'`
  );
};

run();
