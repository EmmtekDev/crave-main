'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UpdatesModal from "@/components/UpdatesModal";

export default function PublicLayout({ children }) {

    return (
        <>
            <UpdatesModal />
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
