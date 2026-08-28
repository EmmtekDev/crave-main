import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
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
            <body className="antialiased">
                <StoreProvider>
                    <Toaster />
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}
