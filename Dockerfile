# Use official Node.js LTS image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire application code
COPY . .

# Expose port 3000 to the host machine
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
