import path from "path"
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
const apiRoutes = ["^/api/v1/", "/health"];

// Use environment variable to determine the target.
const target = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8321";

// Use environment variable to determine the UI server port
const port = process.env.VITE_PORT || 3000;

const proxyTargets = apiRoutes.reduce((proxyObj, route) => {
  proxyObj[route] = {
    target: target,
    changeOrigin: true,
    secure: false,
    ws: true,
  };
  return proxyObj;
}, {});
export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    plugins: [react(), svgr()],
    server: {
      port: port,
      proxy: {
        ...proxyTargets,
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});