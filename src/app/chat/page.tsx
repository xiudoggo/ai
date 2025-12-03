"use client";
import Home from "../components/Home";

export default function ChatPage() {
  // Render the existing Home component which contains the Sidebar and
  // client-side Router. This ensures the same layout is preserved when
  // visiting /chat directly or refreshing the page.
  return <Home />;
}
