const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const PaymentLink = require('../models/PaymentLink');
const emailService = require('../services/emailService');
const fileService = require('../services/fileService');

exports.generateLink = async (req, res) => {
  try {
    const { redirectUrl } = req.body;

    if (!redirectUrl) return res.status(400).json({ error: 'Dados de pagamento obrigatórios' });

    const id = uuidv4();

    const newLink = new PaymentLink({
      id,
      redirectUrl,
    });
    await newLink.save();

    res.json({ message: 'Link criado com sucesso!', id });
  } catch (error) {
    console.error('Erro ao gerar link:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.submitPayment = async (req, res) => {
  try {
    const { nome, email, telefone, linkId } = req.body;

    if (!nome || !email || !telefone || !linkId) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
    }

    const link = await PaymentLink.findOne({ id: linkId });
    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado.' });
    }

    const fotoDocumento = req.files?.fotoDocumento?.[0];
    const selfieDocumento = req.files?.selfieDocumento?.[0];

    if (!fotoDocumento || !selfieDocumento) {
      return res.status(400).json({ error: 'Imagens obrigatórias ausentes.' });
    }

    const adminHTML = generateAdminEmailHTML(nome, email, telefone, linkId);
    const clientHTML = generateClientEmailHTML(nome, linkId);

    await emailService.sendEmail({
      to: process.env.RESPONSIBLE_EMAIL,
      subject: 'Novo pagamento recebido',
      html: adminHTML,
      attachments: [
        {
          filename: 'foto_documento.jpg',
          content: fotoDocumento.buffer,
          contentType: fotoDocumento.mimetype,
        },
        {
          filename: 'selfie_documento.jpg',
          content: selfieDocumento.buffer,
          contentType: selfieDocumento.mimetype,
        }
      ]
    });

    await emailService.sendEmail({
      to: email,
      subject: 'Pagamento processado com sucesso',
      html: clientHTML
    });

    res.status(200).json({ message: 'Pagamento enviado com sucesso!', redirectUrl: link.redirectUrl });

  } catch (error) {
    console.error('Erro ao processar envio:', error);
    res.status(500).json({ error: 'Erro interno ao processar o pagamento.' });
  }
};

// Funções auxiliares para gerar os templates de email

function generateClientEmailHTML(nome, linkId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento em Processamento - Guaraci</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #0063F7;
          padding: 30px 20px;
          text-align: center;
          border-radius: 16px 16px 0 0;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: rgba(255, 255, 255, 0.9);
          margin: 5px 0 0;
          font-size: 16px;
        }
        .content {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .title {
          color: #0063F7;
          text-align: center;
          font-size: 24px;
          margin-bottom: 25px;
        }
        .divider {
          border-top: 1px solid #eeeeee;
          margin: 25px 0;
        }
        .footer {
          text-align: center;
          color: #999999;
          font-size: 12px;
          margin-top: 30px;
        }
        .highlight-box {
          background-color: #f5f9ff;
          border-left: 4px solid #0063F7;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Guaraci</h1>
          <p>Pagamento via link</p>
        </div>

        <div class="content">
          <h2 class="title">Pagamento em Processamento</h2>

          <p>Olá, ${nome}!</p>

          <p>Recebemos seu pagamento e ele está sendo processado pela nossa equipe. Você receberá uma confirmação assim que o processo for concluído.</p>

          <div class="highlight-box">
            <strong>Detalhes do pagamento:</strong>
            <p>ID da transação: ${linkId}</p>
            <p>Data: ${new Date().toLocaleString()}</p>
          </div>

          <div class="divider"></div>

          <p>Caso tenha alguma dúvida, entre em contato conosco respondendo este e-mail ou através dos nossos canais de atendimento.</p>

          <p>Atenciosamente,<br>
          <strong>Equipe Guaraci</strong></p>

          <div class="footer">
            <p>© 2025 Guaraci. Todos os direitos reservados.</p>
            <p>
              <a href="#" style="color: #999999; text-decoration: none;">Política de Privacidade</a> | 
              <a href="#" style="color: #999999; text-decoration: none;">Termos de Serviço</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminEmailHTML(nome, email, telefone, linkId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Novo Pagamento Recebido - Guaraci</title>
      <style>
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .data-table th {
          background-color: #0063F7;
          color: white;
          padding: 10px;
          text-align: left;
        }
        .data-table td {
          padding: 10px;
          border-bottom: 1px solid #eeeeee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Guaraci</h1>
          <p>Pagamento via link</p>
        </div>

        <div class="content">
          <h2 class="title">Novo Pagamento Recebido</h2>

          <p>Um novo pagamento foi submetido através do sistema de links. Seguem os detalhes:</p>

          <table class="data-table">
            <tr>
              <th colspan="2">Dados do Cliente</th>
            </tr>
            <tr>
              <td><strong>Nome:</strong></td>
              <td>${nome}</td>
            </tr>
            <tr>
              <td><strong>E-mail:</strong></td>
              <td>${email}</td>
            </tr>
            <tr>
              <td><strong>Telefone:</strong></td>
              <td>${telefone}</td>
            </tr>
            <tr>
              <td><strong>ID do Link:</strong></td>
              <td>${linkId}</td>
            </tr>
            <tr>
              <td><strong>Data/Hora:</strong></td>
              <td>${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <p><strong>Documentos anexados:</strong></p>
          <p>1. Foto do documento</p>
          <p>2. Selfie com documento</p>

          <div class="footer">
            <p>© 2025 Guaraci. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
