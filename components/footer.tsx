/**
 * A footer component.
 * @returns {JSX.Element} - The rendered footer component.
 */
export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-foreground rounded-sm" />
              <span className="font-serif text-xl font-semibold">Virtuoso</span>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              La plataforma más elegante para aprender violín online.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Cursos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Práctica
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Precios
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Compañía</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Carreras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Términos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/80">
          <p>© 2025 Virtuoso. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
