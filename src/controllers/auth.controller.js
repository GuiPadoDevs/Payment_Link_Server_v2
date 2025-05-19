const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ error: 'Usuário e senha obrigatórios.' });

    const existingUser = await AdminUser.findOne({ username });
    if (existingUser)
        return res.status(409).json({ error: 'Usuário já existe.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new AdminUser({ username, passwordHash });
    await user.save();

    res.status(201).json({ message: 'Usuário criado com sucesso.' });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    const user = await AdminUser.findOne({ username });
    if (!user || !(await user.verifyPassword(password)))
        return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '2h',
    });

    res.json({ token });
};
