# --- Stage 1: Frontend build ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm i

# Copy the remaining source code and build the app
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the generated build to Nginx public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom configuration if you need SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
    