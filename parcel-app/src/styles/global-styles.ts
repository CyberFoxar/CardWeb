import { css } from "lit";

export const styles = css`
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    :host, cw-app, .cw-app {
      @apply text-gray-900 bg-gray-100 dark:bg-gray-800 dark:text-gray-100;
    }
    h1 {
      @apply text-2xl;
    }
    h2 {
      @apply text-xl;
    }
    h3 {
      @apply text-lg;
    }
    a {
      @apply text-blue-400 underline;
      :visited {
        @apply text-violet-200;
      }
    }
  }

  @layer components { 
    .generated-menu a {
        @apply text-pink-600 hover:text-pink-400 no-underline;
    }
    .generated-menu li {
        @apply ml-2 mt-1;
    }
  }
`;
