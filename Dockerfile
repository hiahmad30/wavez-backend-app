FROM node:14

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/

RUN npm install

COPY . /usr/src/app/

EXPOSE 3002
ARG SKIP_ERRORS=false

# Execute build steps
RUN if [ "$SKIP_ERRORS" = "true" ]; then npm run build; else echo "Skipping build step"; fi


CMD ["npm", "start"]
