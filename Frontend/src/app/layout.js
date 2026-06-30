import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'FileForge — Convert, Compress & Analyze Files with AI',
  description: 'Premium file conversion platform powered by AI. Convert images, videos, documents. Merge, split & compress PDFs. Summarize documents with Llama 3.1.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
