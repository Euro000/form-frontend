import './globals.css';

export const metadata = {
  title: 'ล็อกอินเพื่อรับรหัส',
  description: 'Register / Login'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
