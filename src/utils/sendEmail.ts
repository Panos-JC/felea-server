import nodemailer from "nodemailer";
// import Email from "email-templates";

export async function sendEmail(to: string, html: string) {
  let transporter = nodemailer.createTransport({
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    // auth: {
    //   user: "ixl2whkl3e7ut6xh@ethereal.email", // generated ethereal user
    //   pass: "8reAADtAyq1AHN9sAQ", // generated ethereal password
    // },
    service: "gmail",
    auth: {
      user: "infopanostest@gmail.com",
      pass: "panos@test1993",
    },
  });

  // const email = new Email({
  //   message: {
  //     from: "infopanostest@gmail.com",
  //   },
  //   // uncomment below to send emails in development/test env:
  //   send: false,
  //   transport: transporter,
  // });

  // email
  //   .send({
  //     template: "mars",
  //     message: {
  //       to: "phatziioannou@gmail.com",
  //     },
  //     locals: {
  //       name: "Elon",
  //     },
  //   })
  //   .then(console.log)
  //   .catch(console.error);

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to, // list of receivers
    subject: "Change password", // Subject line
    text: html, // plain text body
    html, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
