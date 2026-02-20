import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "ToolMesh — Decentralized MCP Tool Marketplace",
  description:
    "Discover, validate, and configure MCP tools through Cortensor's decentralized consensus network. Trust-verified AI tool recommendations with transparent evidence.",
  keywords: ["MCP", "Model Context Protocol", "Cortensor", "AI tools", "decentralized", "marketplace"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
