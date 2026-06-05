import { getServerSession } from 'next-auth';
import CredentialsProviderRaw from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// next-auth v4 ships CJS modules. The default export lives on `.default` in
// CJS interop, but webpack's `import` interop can drop that access when the
// package does not set `__esModule: true`, causing `CredentialsProvider` to
// resolve to the module object instead of the function. Resolve defensively
// to always get a callable provider factory.
const CredentialsProvider =
  typeof CredentialsProviderRaw === 'function'
    ? CredentialsProviderRaw
    : CredentialsProviderRaw && CredentialsProviderRaw.default;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const adminUser = process.env.ADMIN_USER || 'whitekali';
        const adminHash = process.env.ADMIN_HASH;
        if (!adminHash) {
          return null;
        }
        if (credentials.username === adminUser) {
          const isValid = await bcrypt.compare(credentials.password, adminHash);
          if (isValid) {
            return { id: 'admin', name: adminUser, email: 'admin@festpanel.pl' };
          }
        }
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/js/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function requireAuth(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: '/js/auth/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
}

export async function getAuthSession(req, res) {
  return await getServerSession(req, res, authOptions);
}