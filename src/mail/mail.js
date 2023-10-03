const mailer = require('nodemailer');
const welcome = require("./welcome_template");
const goodbye = require("./goodbye_template");

const getEmailDate = (to, name, template) => {
    let data = null;
    switch (template) {
        case "welcome":
            data = {
                from: '보내는 사람 이름 <userId@gmail.com>',
                to,
                subject: `Hello ${name}`,
                html: welcome()
            }
            break;
        case "goodbye":
            data = {
                from: '보내는 사람 이름 <userId@gmail.com>',
                to,
                subject: `Goodbye ${name}`,
                html: goodbye()
            }
            break;
        default:
            data;
    }
    return data;
}
const sendMail = (to, name, type) => {
    const transporter = mailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'hooney200@gmail.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mail = getEmailDate(to, name, type);
    transporter.sendMail(mail, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            console.log('email sent successfully');
        }
    });
}

module.exports = sendMail;
