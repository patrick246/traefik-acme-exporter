FROM node:8
WORKDIR /usr/share/app
COPY src .
COPY package.json .
# RUN npm install # not needed, because currently no dependencies
CMD ["node", "index.js"]