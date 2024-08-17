FROM --platform=linux/ARM64 node:18

WORKDIR /user

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node" , "src/index.js"]
 