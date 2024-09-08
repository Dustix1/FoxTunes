# Use an official Node.js runtime as a base image
FROM arm64v8/node:18.17.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm run build-docker

# Expose a port (if your application requires it)
EXPOSE 3000
EXPOSE 27017
EXPOSE 2334

# Define the command to run your application
CMD ["node", "./dist/index.js"]
