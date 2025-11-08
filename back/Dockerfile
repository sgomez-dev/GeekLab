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

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Start the server
CMD ["node", "src/server.js"]
