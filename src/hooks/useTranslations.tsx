import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

type LanguageCode = 'en' | 'sn' | 'nd';

interface Translation {
  key: string;
  language_code: LanguageCode;
  value: string;
  context?: string;
}

interface TranslationContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const useTranslations = () => {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load translations for current language
  const loadTranslations = async (lang: LanguageCode) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language_code', lang);

      if (error) throw error;

      const translationMap: Record<string, string> = {};
      data?.forEach(translation => {
        translationMap[translation.key] = translation.value;
      });

      setTranslations(translationMap);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  };

  // Change language
  const changeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem('preferred_language', lang);
    loadTranslations(lang);
  };

  // Initialize with stored language or default
  useEffect(() => {
    const stored = localStorage.getItem('preferred_language') as LanguageCode;
    const initialLang = stored || 'en';
    setLanguage(initialLang);
    loadTranslations(initialLang);
  }, []);

  // Get available languages
  const getAvailableLanguages = () => [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'sn', name: 'Shona', nativeName: 'chiShona' },
    { code: 'nd', name: 'Ndebele', nativeName: 'isiNdebele' }
  ];

  // Add new translation (admin only)
  const addTranslation = async (translation: Omit<Translation, 'id'>) => {
    try {
      const { error } = await supabase
        .from('translations')
        .upsert(translation);

      if (error) throw error;
      
      // Reload translations if it's for current language
      if (translation.language_code === language) {
        await loadTranslations(language);
      }
    } catch (error) {
      console.error('Error adding translation:', error);
      throw error;
    }
  };

  // Format currency for Zimbabwe
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(language === 'en' ? 'en-ZW' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date for Zimbabwe
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return new Intl.DateTimeFormat(
      language === 'en' ? 'en-ZW' : 'en-US',
      options
    ).format(date);
  };

  return {
    language,
    setLanguage: changeLanguage,
    t,
    isLoading,
    getAvailableLanguages,
    addTranslation,
    formatCurrency,
    formatDate
  };
};

// Context provider component
export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const translations = useTranslations();
  
  return (
    <TranslationContext.Provider value={translations}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook to use translation context
export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within TranslationProvider');
  }
  return context;
};