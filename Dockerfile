# STAGE 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Argumento para la URL del API (Se puede pasar desde Coolify en el build)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# STAGE 2: Runtime
FROM nginx:stable-alpine
# Copiamos el build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración básica de Nginx para SPAs (manejo de rutas de Vue Router)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
