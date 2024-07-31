# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json from the server directory
COPY package.json /app
COPY package-lock.json /app

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY server /app

# Expose the port the app runs on
EXPOSE 3007

# Command to run the application
CMD ["node", "app.js"]