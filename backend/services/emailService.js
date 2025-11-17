const nodemailer = require("nodemailer");

// Configuração do transporter do nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Você pode alterar para outro serviço de email
  auth: {
    user: "keishirologhorizon@gmail.com", // Substitua pelo seu email
    pass: "Randomise@4513", // Use uma senha de aplicativo do Gmail
  },
});

const sendConfirmationEmail = async (clienteEmail, clienteNome) => {
  try {
    const mailOptions = {
      from: "seu-email@gmail.com", // Substitua pelo seu email
      to: clienteEmail,
      subject: "Bem-vindo ao MaicoSoft - Confirmação de Cadastro",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Bem-vindo ao MaicoSoft!</h2>
          <p>Olá ${clienteNome},</p>
          <p>Seu cadastro foi realizado com sucesso em nosso sistema.</p>
          <p>Agradecemos a confiança em nossos serviços!</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
            <p style="margin: 0;">Se precisar de suporte, entre em contato conosco:</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> suporte@maicosoft.com</p>
            <p style="margin: 5px 0;"><strong>Telefone:</strong> (00) 0000-0000</p>
          </div>
          <p style="color: #6b7280; font-size: 0.875rem;">
            Esta é uma mensagem automática, por favor não responda.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.response);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
};

module.exports = {
  sendConfirmationEmail,
};
