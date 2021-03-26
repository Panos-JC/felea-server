import nodemailer from "nodemailer";
import path from "path";

const hbs = require("nodemailer-express-handlebars");

const hbsConfig = {
  viewEngine: {
    extName: ".hbs",
    partialsDir: path.join(__dirname, "../email_templates/"),
    layoutsDir: path.join(__dirname, "../email_templates/"),
    defaultLayout: "",
  },
  viewPath: path.join(__dirname, "../email_templates/"),
  extName: ".hbs",
};

export async function send(
  to: string,
  subject: string,
  template: string,
  context: any
) {
  // let transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });

  let transporter = nodemailer.createTransport({
    name: "mail.felea.org",
    host: "box5526.bluehost.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("[TEST]: ", process.env.EMAIL_USER);
  console.log("[TEST]: ", process.env.EMAIL_PASS);

  transporter.use("compile", hbs(hbsConfig));

  const email = {
    from: `"Felea Bot" <${process.env.EMAIL_USER}>`,
    to,
    // cc: ccValues,
    subject: subject,
    template: template,
    context: context,
  };

  try {
    await transporter.sendMail(email);
  } catch (error) {
    console.log(error);
  }

  // {
  //   from: '"Felea" <infopanostest@gmail.com>', // sender address
  //   to, // list of receivers
  //   subject: "SUBJECT", // Subject line
  //   text: html, // plain text body
  //   html, // html body
  // }
}
