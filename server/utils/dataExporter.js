const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { XMLBuilder } = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');

/**
 * Exporta datos a formato CSV
 */
async function exportToCSV(data, headers, outputPath) {
  const csvWriter = createCsvWriter({
    path: outputPath,
    header: headers.map(h => ({ id: h.key, title: h.label }))
  });

  await csvWriter.writeRecords(data);
  return outputPath;
}

/**
 * Exporta datos a formato JSON
 */
function exportToJSON(data, metadata, outputPath) {
  const jsonData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    ...metadata,
    "data": data,
    "exportDate": new Date().toISOString()
  };

  fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');
  return outputPath;
}

/**
 * Exporta datos a formato XML
 */
function exportToXML(data, metadata, outputPath) {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    arrayNodeName: "item"
  });

  const xmlData = {
    dataset: {
      "@_xmlns": "http://www.w3.org/2005/Atom",
      "@_xmlns:dcat": "http://www.w3.org/ns/dcat#",
      metadata: {
        title: metadata.name || "Dataset",
        description: metadata.description || "",
        publisher: metadata.publisher || "Concejo Municipal de Guachucal",
        issued: metadata.datePublished || new Date().toISOString(),
        modified: metadata.dateModified || new Date().toISOString()
      },
      records: {
        item: data
      }
    }
  };

  const xml = builder.build(xmlData);
  fs.writeFileSync(outputPath, '<?xml version="1.0" encoding="UTF-8"?>\n' + xml, 'utf8');
  return outputPath;
}

/**
 * Genera metadatos DCAT para el dataset
 */
function generateDCATMetadata(name, description, category) {
  return {
    name: name,
    description: description,
    publisher: {
      "@type": "GovernmentOrganization",
      "name": "Concejo Municipal de Guachucal",
      "url": "https://concejo.guachucal.gov.co"
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    category: category,
    license: "https://creativecommons.org/licenses/by/4.0/",
    keywords: ["transparencia", "datos abiertos", category || "gobierno"]
  };
}

/**
 * Limpia archivos temporales más antiguos de 1 hora
 */
function cleanupTempFiles(tempDir) {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    return;
  }

  const files = fs.readdirSync(tempDir);
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  files.forEach(file => {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);
    if (stats.mtime.getTime() < oneHourAgo) {
      fs.unlinkSync(filePath);
    }
  });
}

module.exports = {
  exportToCSV,
  exportToJSON,
  exportToXML,
  generateDCATMetadata,
  cleanupTempFiles
};















