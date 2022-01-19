FROM node:17-alpine3.14
WORKDIR /ufc-app
COPY . ./ 
EXPOSE 3000
RUN npm install
CMD ["npm", "run", "start"] 