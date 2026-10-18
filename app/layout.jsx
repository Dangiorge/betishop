import Providers from "./providers";
import "./globals.css";

export const metadata = {
  applicationName: "BetiShop",
  title: "BetiShop — Shop Management",
  description: "Manage products, inventory, sales, and shop finances with BetiShop.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "BetiShop",
    statusBarStyle: "default",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#172554",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
