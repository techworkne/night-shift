const express = require('express');
const path = require('path');

const app = express();
const PORT= 3000;

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, ()=>{
    console.log("Сервер работает на порту 3000");
});
