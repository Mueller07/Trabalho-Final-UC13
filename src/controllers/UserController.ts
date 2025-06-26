import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const userRepository = AppDataSource.getRepository(User);

export const UserController = {
  register: async (req: Request, res: Response) => {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        res.status(400).json({ mensagem: 'Preencha todos os campos.' });
        return;
      }

      const userExists = await userRepository.findOneBy({ email });
      if (userExists) {
        res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
        return;
      }

      const hash = await bcrypt.hash(senha, 10);
      const user = userRepository.create({ nome, email, senha: hash });
      await userRepository.save(user);

      res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        res.status(400).json({ mensagem: 'Preencha todos os campos.' });
        return;
      }

      const user = await userRepository.findOneBy({ email });

      if (!user) {
        res.status(400).json({ mensagem: 'Usuário não encontrado.' });
        return;
      }

      const match = await bcrypt.compare(senha, user.senha);
      if (!match) {
        res.status(401).json({ mensagem: 'Senha incorreta.' });
        return;
      }

      res.status(200).json({
        mensagem: 'Login bem-sucedido!',
        userId: user.id,
        nome: user.nome,
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao realizar login." });
    }
  }
};
