import NextAuthRaw from 'next-auth';
import { authOptions } from '../../../lib/auth';

// next-auth v4 ships CJS modules. The default export lives on `.default` in
// CJS interop, but webpack's `import` interop can drop that access when the
// package does not set `__esModule: true`, causing the resolved value to be
// the module object instead of a callable. Resolve defensively.
const NextAuth =
  typeof NextAuthRaw === 'function'
    ? NextAuthRaw
    : NextAuthRaw && NextAuthRaw.default;

export default NextAuth(authOptions);