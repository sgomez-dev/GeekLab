FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY . .

# Expose port (matches vite.config.js port 32136)
EXPOSE 32136

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
