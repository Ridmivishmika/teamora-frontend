import "./globals.css";


export const metadata = {
  title: "Teamora",
  description: "Teamora By Ridmi",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body >{children}</body>
    </html>
  );
}
