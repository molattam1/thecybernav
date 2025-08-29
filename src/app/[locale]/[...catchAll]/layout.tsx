// /src/app/[locale]/products/[slug]/layout.tsx

export default function ProductsLayout({children}: {children: React.ReactNode;}) {
    return <section className="max-w-7xl mx-auto px-6 py-12">{children}</section>;
}
