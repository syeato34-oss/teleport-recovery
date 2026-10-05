# Existing development-tool dependency findings

Reviewed: 3 October 2026.

`npm audit --omit=dev --json` reports zero vulnerabilities for the production dependencies. The full `npm audit --json` reports seven findings: six high and one moderate, all in the existing development/build dependency graph.

Affected packages are Vite, esbuild, Tailwind CSS and Tailwind's braces/chokidar/micromatch/fast-glob dependency chain. The aggregate package count includes packages affected by the same underlying advisory; it is not seven independent production attacks.

The deployed application consists of static files generated in `dist`; Netlify does not run Vite, an esbuild serve process or a Tailwind watcher for customer requests. This limits exposure of the described development-server and pattern-processing issues in the deployed site. It does not remove risks for developer machines or build environments.

The Vite Windows file-access advisory concerns exposed development servers and sensitive files in allowed directories. The esbuild advisory concerns its serve feature's cross-origin access. The braces advisory concerns deeply nested pattern input. Source/configuration and the build environment must be treated accordingly. Keep local development servers on loopback, and do not use them as a production host. The QA static server also binds only to loopback and rejects callback POSTs.

The audit's proposed automatic fixes cross Vite and Tailwind major versions. A Tailwind migration can alter the frozen typography, spacing and styling output. This surgical pass preserves those major versions; it does not apply `npm audit fix --force`, substitute an unreviewed parser or claim the full toolchain is vulnerability-free. A separate tested toolchain update remains outstanding. Review primary advisories and current compatible fixes when doing that update; repeat visual, build and callback QA afterward.

Primary maintainer advisories reviewed:

- [Vite Windows filesystem deny bypass](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff).
- [esbuild development-server cross-origin access](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99).
- [braces deeply nested patterns](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

This record concerns actual audit findings, not a claim that customer data is currently exposed or that every listed condition applies to this project.
