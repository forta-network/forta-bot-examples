# Build stage: compile Python dependencies
FROM python:3.9-alpine as builder
RUN apk update
RUN apk add alpine-sdk
RUN python3 -m pip install --upgrade pip
COPY requirements.txt ./
RUN python3 -m pip install --user -r requirements.txt


# Final stage: copy over Python dependencies and install production Node dependencies
FROM node:12-alpine
# this python version should match the build stage python version
RUN apk add python3
RUN apk add gnupg
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local:$PATH
ENV NODE_ENV=production
# Uncomment the following line to enable agent logging
LABEL "network.forta.settings.agent-logs.enable"="true"
WORKDIR /app
COPY ./src ./src
COPY package*.json ./
COPY private.pem ./
COPY LICENSE.md ./
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]