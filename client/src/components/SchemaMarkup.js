import React from 'react';

/**
 * Componente para agregar Schema.org markup (JSON-LD) a las páginas
 * Mejora el SEO y permite que los motores de búsqueda entiendan mejor el contenido
 */

export const OrganizationSchema = ({ name, url, logo, email, telephone, address }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": name || "Diócesis de Ipiales",
    "url": url || "https://diocesisdeipiales.org",
    "logo": logo || "https://diocesisdeipiales.org/images/logo.png",
    "email": email || "contacto@diocesisdeipiales.org",
    "telephone": telephone || "+57 (2) XXX-XXXX",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ipiales",
      "addressRegion": "Nariño",
      "addressCountry": "CO"
    },
    ...(address && { "address": { ...address, "@type": "PostalAddress" } })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const WebSiteSchema = ({ name, url, searchUrl }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name || "Diócesis de Ipiales",
    "url": url || "https://diocesisdeipiales.org",
    ...(searchUrl && {
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": searchUrl
        },
        "query-input": "required name=search_term_string"
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const ArticleSchema = ({ headline, description, image, datePublished, dateModified, author }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": headline,
    "description": description,
    "image": image,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Organization",
      "name": author || "Diócesis de Ipiales"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Diócesis de Ipiales",
      "logo": {
        "@type": "ImageObject",
        "url": "https://diocesisdeipiales.org/images/logo.png"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const BreadcrumbSchema = ({ items }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const DatasetSchema = ({ name, description, url, datePublished, dateModified, license }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": name,
    "description": description,
    "url": url,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "publisher": {
      "@type": "GovernmentOrganization",
      "name": "Diócesis de Ipiales"
    },
    ...(license && { "license": license })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default {
  OrganizationSchema,
  WebSiteSchema,
  ArticleSchema,
  BreadcrumbSchema,
  DatasetSchema
};















