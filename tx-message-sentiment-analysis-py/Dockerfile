# Build stage: compile Python dependencies
FROM python:3.10-slim-bullseye as builder
COPY requirements.txt requirements.txt
RUN python3 -m pip install --user -r requirements.txt

# Final stage: copy over Python dependencies and install production Node dependencies
# Final stage: copy over Python dependencies and install production Node dependencies
FROM node:12-alpine
RUN apk add python3
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local:$PATH
ENV NODE_ENV=production
LABEL "network.forta.settings.agent-logs.enable"="true"
WORKDIR /app
COPY ./src ./src
COPY package*.json ./
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]

