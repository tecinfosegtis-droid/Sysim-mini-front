export const metadata = {
  title: 'Sysim Mini – Gestão Condominial',
  description: 'Aplicativo Sysim Mini para controle de condomínios',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
