# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json /usr/src/app/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /usr/src/app/

# Expose the port the app runs on
EXPOSE 5175

# Command to run the application
# TODO: Change to build command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]