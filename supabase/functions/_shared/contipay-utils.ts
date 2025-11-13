// Utility: Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility: Validate and format phone number
export function formatPhoneNumber(phone: string, countryCode: string = 'ZW'): string {
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Zimbabwe numbers specifically
  if (countryCode === 'ZW') {
    if (cleaned.startsWith('263')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '+263' + cleaned.substring(1);
    }
    if (cleaned.length === 9) {
      return '+263' + cleaned;
    }
  }
  
  // For other countries, ensure it has a + prefix
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  
  return cleaned;
}

// Country code mapping: Full names and alpha-3 to alpha-2
export const countryCodeMap: { [key: string]: string } = {
  // Full country names to ISO alpha-2
  'Zimbabwe': 'ZW',
  'South Africa': 'ZA',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Botswana': 'BW',
  'Mozambique': 'MZ',
  'Zambia': 'ZM',
  'Malawi': 'MW',
  'Namibia': 'NA',
  'Kenya': 'KE',
  'Tanzania': 'TZ',
  'Uganda': 'UG',
  // Alpha-3 to Alpha-2 (in case they're sent)
  'ZWE': 'ZW',
  'ZAF': 'ZA',
  'USA': 'US',
  'GBR': 'GB',
  'BWA': 'BW',
  'MOZ': 'MZ',
  'ZMB': 'ZM',
  'MWI': 'MW',
};

export function getAlpha2CountryCode(country: string): string {
  return countryCodeMap[country] || country.substring(0, 2).toUpperCase();
}
