const express = require('express');
const { default: mongoose } = require('mongoose');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose.connect(`mongodb+srv://hooney200:hooney1108@cluster0.155h4r3.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
        console.log('mongodb connected');
    })
    .catch((err) => {
        console.log(err);
    })

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/signup', (req, res) => {
    res.render('signup');
})

const port = 4000;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
