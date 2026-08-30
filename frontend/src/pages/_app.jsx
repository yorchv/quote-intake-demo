import { useEffect } from 'react';
import { initProductAnalytics } from '../analytics.js';
import '../styles.css';

export default function ProductApp({ Component, pageProps }) {
  useEffect(() => {
    initProductAnalytics();
  }, []);
  return <Component {...pageProps} />;
}
