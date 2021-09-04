# Build stage: compile Python dependencies
FROM python:3.8-alpine as builder
RUN apk update
RUN apk add alpine-sdk
RUN python3 -m pip install --upgrade pip
COPY requirements.txt ./
RUN python3 -m pip install --user -r requirements.txt

# Final stage: copy over Python dependencies and install production Node dependencies
FROM node:14.15.5-alpine
RUN apk add python3
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local:$PATH
ENV NODE_ENV=production
WORKDIR /app
COPY ./src ./src
COPY package*.json ./
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]