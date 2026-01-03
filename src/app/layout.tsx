// Root layout is a passthrough - each route group has its own html/body
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
