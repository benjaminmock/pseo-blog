const Footer = () => {
  return (
    <footer className="bg-white shadow-inner border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} kursio.de - Alle Rechte vorbehalten
          </div>
          <nav className="mt-4 md:mt-0">
            <a
              href="/impressum"
              className="text-gray-700 hover:text-gray-900 transition text-sm"
            >
              Impressum
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
