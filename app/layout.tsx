export const metadata = {
  title: "CubeMaster Demo",
  description: "MVP container & pallet packing demo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-7xl mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
