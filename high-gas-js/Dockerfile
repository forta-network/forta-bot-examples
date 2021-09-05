# Build stage: compile Javascript (optional, provided as example if using Babel)
# FROM node:14.15.5-alpine as builder
# WORKDIR /app
# COPY . .
# RUN npm ci
# RUN npm run build

# Final stage: install production dependencies
FROM node:14.15.5-alpine
ENV NODE_ENV=production
WORKDIR /app
# if using build stage
# COPY --from=builder /app/dist ./
COPY ./src ./src
COPY package*.json ./
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]