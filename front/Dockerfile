FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY . .

# Remove node_modules if it exists to ensure clean build
RUN rm -rf node_modules

# Reinstall dependencies to ensure consistency
RUN npm i

# Expose port (matches vite.config.js port 32136)
EXPOSE 32136

# Start the development server with explicit port and host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
