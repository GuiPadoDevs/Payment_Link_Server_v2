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

    const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;

    let locationInfo = 'Localização indisponível';
    try {
      const response = await fetch(`https://ipwho.is/${clientIp}`);
      const data = await response.json();
      if (data.success) {
        locationInfo = `${data.city}, ${data.region}, ${data.country}`;
      }
    } catch (err) {
      console.warn('Erro ao buscar localização do IP:', err);
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

    const adminHTML = generateAdminEmailHTML(nome, email, telefone, linkId, clientIp, locationInfo);

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

    res.status(200).json({ message: 'Pagamento enviado com sucesso!', redirectUrl: link.redirectUrl });

  } catch (error) {
    console.error('Erro ao processar envio:', error);
    res.status(500).json({ error: 'Erro interno ao processar o pagamento.' });
  }
};

// Funções auxiliares para gerar os templates de email

function generateAdminEmailHTML(nome, email, telefone, linkId, clientIp, locationInfo) {
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
              <td><strong>IP do cliente:</strong></td>
              <td>${clientIp}</td>
            </tr>
            <tr>
              <td><strong>Localização do cliente:</strong></td>
              <td>${locationInfo}</td>
            </tr>
            <tr>
              <td><strong>Data/Hora:</strong></td>
              <td>${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <p><strong>Documentos anexados:</strong></p>
          <p>1. Documento oficial com foto</p>
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
