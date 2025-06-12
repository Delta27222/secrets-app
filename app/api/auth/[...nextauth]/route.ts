import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

// Este es el flujo OAuth completo:
// 1. Usuario hace clic en "Iniciar sesión con GitHub"
// 2. Se redirige a GitHub para autorización
// 3. GitHub redirige de vuelta con un código
// 4. NextAuth intercambia el código por un token de acceso
// 5. NextAuth almacena el token y crea una sesión
// 6. Hacemos una llamada a nuestra API para obtener los datos del usuario

// Obtener la URL base para la autenticación
const baseUrl = process.env.NEXTAUTH_URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://tek-secrets.onrender.com"

if (!baseUrl && process.env.NODE_ENV === "production") {
  console.warn("ADVERTENCIA: No se ha configurado NEXTAUTH_URL o VERCEL_URL en el entorno de producción.")
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Cuando se completa la autenticación inicial, 'account' contiene el token de acceso
      if (account && profile) {
        // Guardamos el token de acceso en el JWT
        token.accessToken = account.access_token
        token.tokenType = account.token_type

        try {
          // Hacer una llamada a nuestra API para obtener los datos del usuario
          const response = await fetch(`${apiUrl}/v1/auth/github`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-GitHub-Token": `${account.access_token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            console.log("Datos del usuario obtenidos:", userData)

            // Guardar los datos del usuario en el token
            token.id = userData._id
            token.username = userData.username
            token.displayName = userData.displayName
            // Mantener el email y la imagen del perfil de GitHub si no están en la respuesta
            token.email = userData.email || token.email
          } else {
            console.error("Error al obtener datos del usuario:", await response.text())
          }
        } catch (error) {
          console.error("Error al llamar a la API:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      // Pasamos el token de acceso y los datos del usuario a la sesión del cliente
      session.accessToken = token.accessToken
      session.tokenType = token.tokenType

      // Añadir los datos del usuario a la sesión
      session.user = {
        ...session.user,
        id: token.id,
        username: token.username,
        displayName: token.displayName,
      }

      return session
    },
    async redirect({ url, baseUrl }) {
      // Asegurarnos de que las redirecciones internas vayan al dominio correcto
      if (url.startsWith("/")) {
        // Para rutas relativas, usar la URL base
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        // Para URLs absolutas del mismo origen, permitirlas
        return url
      }
      // Para otras URLs, redirigir a la página principal
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
