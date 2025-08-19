import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'Event' | 'Service' | 'Review' | 'LocalBusiness' | 'WebSite';
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    switch (type) {
      case 'Organization':
        return {
          ...baseSchema,
          name: data.name || 'ZimEventPro',
          url: data.url || 'https://zimeventpro.com',
          logo: data.logo || 'https://zimeventpro.com/logo.png',
          description: data.description || 'Zimbabwe\'s premier event planning marketplace',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'ZW',
            addressLocality: data.city || 'Harare',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: data.phone,
            contactType: 'customer service',
          },
          sameAs: data.socialLinks || [],
        };

      case 'Event':
        return {
          ...baseSchema,
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          location: {
            '@type': 'Place',
            name: data.location,
            address: data.address,
          },
          organizer: {
            '@type': 'Organization',
            name: data.organizer,
          },
          offers: data.price ? {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          } : undefined,
        };

      case 'Service':
        return {
          ...baseSchema,
          name: data.name,
          description: data.description,
          provider: {
            '@type': 'Organization',
            name: data.provider,
          },
          areaServed: {
            '@type': 'Country',
            name: 'Zimbabwe',
          },
          serviceType: data.category,
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'USD',
          },
          aggregateRating: data.rating ? {
            '@type': 'AggregateRating',
            ratingValue: data.rating,
            reviewCount: data.reviewCount,
          } : undefined,
        };

      case 'Review':
        return {
          ...baseSchema,
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: data.rating,
            bestRating: 5,
          },
          author: {
            '@type': 'Person',
            name: data.author,
          },
          reviewBody: data.text,
          itemReviewed: {
            '@type': 'Service',
            name: data.serviceName,
          },
        };

      case 'LocalBusiness':
        return {
          ...baseSchema,
          name: data.name,
          description: data.description,
          address: {
            '@type': 'PostalAddress',
            streetAddress: data.address,
            addressLocality: data.city,
            addressCountry: 'ZW',
          },
          telephone: data.phone,
          url: data.website,
          image: data.image,
          priceRange: data.priceRange,
          aggregateRating: data.rating ? {
            '@type': 'AggregateRating',
            ratingValue: data.rating,
            reviewCount: data.reviewCount,
          } : undefined,
        };

      case 'WebSite':
        return {
          ...baseSchema,
          url: data.url || 'https://zimeventpro.com',
          name: data.name || 'ZimEventPro',
          description: data.description,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${data.url || 'https://zimeventpro.com'}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };

      default:
        return { ...baseSchema, ...data };
    }
  };

  const schema = generateSchema();

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;