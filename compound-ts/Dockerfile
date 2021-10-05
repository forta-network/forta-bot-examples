# Build stage: compile Typescript to Javascript
FROM node:14.15.5-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# Final stage: copy compiled Javascript from previous stage and install production dependencies
FROM node:14.15.5-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist ./src
COPY package*.json ./
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]