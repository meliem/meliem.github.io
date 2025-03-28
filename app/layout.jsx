import "./globals.css";

export const metadata = {
  title: "Elie | Creative Developer",
  description: "Portfolio showcasing creative development work",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
