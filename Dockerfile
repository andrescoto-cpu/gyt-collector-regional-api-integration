FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY src ./src

# Create directory for certificates
RUN mkdir -p /usr/src/app/certs

# Expose port
EXPOSE 443

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/index.js"]
