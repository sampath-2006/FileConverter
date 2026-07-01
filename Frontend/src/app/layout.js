import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'FileForge — Convert, Compress & Analyze Files with AI',
  description: 'Premium file conversion platform powered by AI. Convert images, videos, documents. Merge, split & compress PDFs. Summarize documents instantly.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var localTheme = localStorage.getItem('ff_theme');
                if (localTheme) {
                  document.documentElement.setAttribute('data-theme', localTheme);
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
