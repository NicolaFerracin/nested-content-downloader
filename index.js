const axios = require('axios');
const afterLoad = require('after-load');
const PdfPrinter = require('pdfmake');
const fs = require('fs');

let globalConfig = {
  dir: './documents', // destination directory
  fonts: {
    Roboto: {
      normal: './fonts/Roboto-Regular.ttf',
      bold: './fonts/Roboto-Medium.ttf',
      italics: './fonts/Roboto-Italic.ttf',
      bolditalics: './fonts/Roboto-MediumItalic.ttf'
    }
  }, // fonts for pdfmake
  getTitle: url => url.replace(/\//g, '_').replace(/[:/.]/g, '') // default title
};

const checkRequiredConfig = config => {
  if (!config.urls) {
    throw new Error('Missing url list.');
  }
  if (!config.getImagesHref) {
    throw new Error('Missing getImagesHref function.');
  }
};

const getUrlContent = url => {
  console.log(`Getting HTML from ${url}.`);

  const title = globalConfig.getTitle(url);

  const pdfConfig = {
    title,
    fonts: globalConfig.fonts,
    url,
    path: `${globalConfig.dir}/${title}.pdf`
  };

  return new Promise(resolve => {
    afterLoad(url, async (html, $) => {
      const images = globalConfig
        .getImagesHref(html, $)
        .map(href => (!href.startsWith('http') ? url + href : href));
      await downloadImagesToPdf(images, pdfConfig);
      resolve();
    });
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

const createPdf = pdfConfig => {
  const printer = new PdfPrinter(pdfConfig.fonts);
  const pdfDoc = printer.createPdfKitDocument(pdfConfig.docDefinition);
  pdfDoc.pipe(fs.createWriteStream(pdfConfig.path));
  pdfDoc.end();
  console.log(`Content for ${pdfConfig.title} ready in '${pdfConfig.path}'!`);
};

const downloader = async config => {
  checkRequiredConfig(config);
  globalConfig = { ...globalConfig, ...config };

  if (!fs.existsSync(globalConfig.dir)) {
    fs.mkdirSync(globalConfig.dir);
  }

  const promises = globalConfig.urls.map(getUrlContent);
  await Promise.all(promises);
  console.log(
    `Images for all ${globalConfig.urls.length} urls have been downloaded. You can find them in '${
      globalConfig.dir
    }'`
  );
};

module.exports = downloader;
