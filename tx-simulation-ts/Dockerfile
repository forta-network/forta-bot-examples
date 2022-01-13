# Build stage: compile Typescript to Javascript
FROM node:12-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
# obfuscate compiled Javascript (optional)
# RUN npm install -g javascript-obfuscator
# RUN javascript-obfuscator ./dist --output ./obfuscated --split-strings true --split-strings-chunk-length 3

# Final stage: copy compiled Javascript from previous stage and install production dependencies
FROM node:12-alpine
ENV NODE_ENV=production
WORKDIR /app
# if using obfuscated code:
# COPY --from=builder /app/obfuscated ./src
# else if using unobfuscated code:
COPY --from=builder /app/dist ./src
COPY package*.json ./
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]