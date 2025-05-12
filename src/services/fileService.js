const fs = require('fs');
const path = require('path');

exports.saveImage = async (file, id) => {
  const dir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const ext = path.extname(file.originalname);
  const filePath = path.join(dir, `${id}${ext}`);

  fs.writeFileSync(filePath, file.buffer);
  return `/uploads/${id}${ext}`;
};
