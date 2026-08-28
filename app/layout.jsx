import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import Script from "next/script";
import "./globals.css";

export const metadata = {
    title: "CraveStore — Where innovation meet elegance",
    description: "Where innovation meet elegance",

    other: {
        "google-adsense-account": "ca-pub-1398515947251090",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1398515947251090"
                    crossOrigin="anonymous"
                />
            </head>

            <body className="antialiased">
                <StoreProvider>
                    <Toaster />
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}
